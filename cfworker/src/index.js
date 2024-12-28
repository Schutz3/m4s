const PostalMime = require("postal-mime");

async function sendEmailToApi(emailData) {
  const apiUrl = '';
  const token = "";

  console.log("Sending email data to API:", emailData);
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` 
    },
    body: JSON.stringify(emailData),
  });

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  return await response.json();
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
    const rawEmail = await streamToArrayBuffer(event.raw, event.rawSize);
    const parser = new PostalMime.default();
    const parsedEmail = await parser.parse(rawEmail);
    const emailData = {
      from: event.from,
      to: event.to,
      subject: parsedEmail.subject,
      html: parsedEmail.html,
      text: parsedEmail.text,
      attachments: parsedEmail.attachments.map(att => ({
        filename: att.filename,
        disposition: att.disposition,
        mimeType: att.mimeType,
        size: att.content.byteLength,
      }))
    };
    try {
      const result = await sendEmailToApi(emailData);
      console.log("Email data stored via API:", result);
    } catch (error) {
      console.error("Error storing email data via API:", error);
    };
  },
};
