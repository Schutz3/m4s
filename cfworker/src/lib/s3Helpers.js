export async function createPresignedUrl(method, endpoint, bucket, objectName, accessKey, secretKey, expiryInSeconds) {
    const region = 'us-east-1'; // Minio uses a default region
    const date = new Date();
    const dateString = date.toISOString().split('T')[0].replace(/-/g, '');
    const amzDate = date.toISOString().replace(/[:-]|\.\d{3}/g, '');
    const expiry = Math.floor(Date.now() / 1000) + expiryInSeconds;
  
    const credential = `${accessKey}/${dateString}/${region}/s3/aws4_request`;
    
    const canonicalQueryString = [
      `X-Amz-Algorithm=AWS4-HMAC-SHA256`,
      `X-Amz-Credential=${encodeURIComponent(credential)}`,
      `X-Amz-Date=${amzDate}`,
      `X-Amz-Expires=${expiryInSeconds}`,
      `X-Amz-SignedHeaders=host`,
    ].join('&');
  
    const canonicalRequest = [
      method,
      `/${bucket}/${objectName}`,
      canonicalQueryString,
      `host:${new URL(endpoint).host}\n`,
      'host',
      'UNSIGNED-PAYLOAD'
    ].join('\n');
  
    const stringToSign = [
      'AWS4-HMAC-SHA256',
      amzDate,
      `${dateString}/${region}/s3/aws4_request`,
      await sha256(canonicalRequest)
    ].join('\n');
  
    const signingKey = await getSignatureKey(secretKey, dateString, region, 's3');
    const signature = await hmacSha256(signingKey, stringToSign);
  
    const presignedUrl = `${endpoint}/${bucket}/${objectName}?${canonicalQueryString}&X-Amz-Signature=${signature}`;
  
    return presignedUrl;
  }
  
  async function getSignatureKey(key, dateStamp, regionName, serviceName) {
    const kDate = await hmacSha256('AWS4' + key, dateStamp);
    const kRegion = await hmacSha256(kDate, regionName);
    const kService = await hmacSha256(kRegion, serviceName);
    const kSigning = await hmacSha256(kService, 'aws4_request');
    return kSigning;
  }
  
  async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  
  async function hmacSha256(key, message) {
    const keyBuffer = typeof key === 'string' ? new TextEncoder().encode(key) : key;
    const messageBuffer = new TextEncoder().encode(message);
  
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyBuffer,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
  
    const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageBuffer);
    return Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }