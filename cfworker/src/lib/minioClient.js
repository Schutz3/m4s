import { createPresignedUrl } from './s3Helpers';

export function createS3Client(env) {
  const endpoint = `https://${env.MINIO_ENDPOINT}`;
  const accessKey = env.MINIO_ACCESS_KEY;
  const secretKey = env.MINIO_SECRET_KEY;
  const bucket = env.MINIO_BUCKET;

  return {
    putObject: async (objectName, content) => {
      const url = `${endpoint}/${bucket}/${objectName}`;
      const date = new Date().toUTCString();
      const contentType = 'application/octet-stream';
      
      const stringToSign = `PUT\n\n${contentType}\n${date}\n/${bucket}/${objectName}`;
      const signature = await hmacSha1(secretKey, stringToSign);

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Date': date,
          'Content-Type': contentType,
          'Authorization': `AWS ${accessKey}:${signature}`,
        },
        body: content,
      });

      if (!response.ok) {
        throw new Error(`Failed to upload object: ${response.statusText}`);
      }
    },

    presignedGetObject: async (objectName, expiryInSeconds) => {
      return await createPresignedUrl('GET', endpoint, bucket, objectName, accessKey, secretKey, expiryInSeconds);
    },
  };
}

async function hmacSha1(key, message) {
  const keyBuffer = new TextEncoder().encode(key);
  const messageBuffer = new TextEncoder().encode(message);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBuffer,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageBuffer);
  return btoa(String.fromCharCode(...new Uint8Array(signature)));
}