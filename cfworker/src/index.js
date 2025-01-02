import { createS3Client } from './lib/minioClient';
const PostalMime = require("postal-mime");

async function sendEmailToApi(emailData, env) {
  console.log("Sending email data to API:", emailData);
  const response = await fetch(env.API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${env.TOKEN}` 
    },
    body: JSON.stringify(emailData),
  });

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  return await response.json();
}

async function uploadAttachmentToMinio(attachment, s3Client, env) {
  const objectName = `attachments/${Date.now()}-${attachment.filename}`;
  
  const content = Buffer.isBuffer(attachment.content) 
    ? attachment.content 
    : Buffer.from(attachment.content);

  await s3Client.putObject(objectName, content);
  return await s3Client.presignedGetObject(objectName, 6 * 24 * 60 * 60);
}

async function streamToArrayBuffer(stream, streamSize) {
  let result = new Uint8Array(streamSize);
  let bytesRead = 0;
  const reader = stream.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    result.set(value, bytesRead);
    bytesRead += value.length;
  }
  return result;
}

export default {
  async email(event, env, ctx) {
    const s3Client = createS3Client(env);
    const rawEmail = await streamToArrayBuffer(event.raw, event.rawSize);
    const parser = new PostalMime.default();
    const parsedEmail = await parser.parse(rawEmail);
    
    const attachmentPromises = parsedEmail.attachments.map(async (att) => {
      const content = att.content instanceof Uint8Array ? Buffer.from(att.content) : att.content;
      const minioLink = await uploadAttachmentToMinio({...att, content}, s3Client, env);
      const url = new URL(minioLink);
      const fullPath = url.pathname.substring(1);
      const pathParts = fullPath.split('/');
      const objectName = pathParts.slice(1).join('/');
      return {
        filename: att.filename,
        disposition: att.disposition,
        objectName: objectName,
        mimeType: att.mimeType,
        size: content.byteLength,
      };
    });

    const processedAttachments = await Promise.all(attachmentPromises);

    const emailData = {
      from: event.from,
      to: event.to,
      subject: parsedEmail.subject,
      html: parsedEmail.html,
      text: parsedEmail.text,
      attachments: processedAttachments
    };

    try {
      const result = await sendEmailToApi(emailData, env);
      console.log("Email data stored via API:", result);
    } catch (error) {
      console.error("Error storing email data via API:", error);
    }
  },
};