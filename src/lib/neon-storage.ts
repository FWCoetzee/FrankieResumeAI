// Creator: Franklin Coetzee
// ID number: 8510305083081
// Email: salazar3593@gmail.com
// Built with AI assistance

import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

let storageClient: S3Client | undefined;

export function getNeonStorageClient(): S3Client {
  const required = ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_ENDPOINT_URL_S3', 'AWS_REGION'];
  const missing = required.filter((name) => !process.env[name]);
  if (missing.length) throw new Error(`Neon Object Storage is not configured: ${missing.join(', ')}`);

  storageClient ??= new S3Client({
    region: process.env.AWS_REGION,
    endpoint: process.env.AWS_ENDPOINT_URL_S3,
    forcePathStyle: true,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });
  return storageClient;
}

export async function putNeonStorageObject(bucket: string, key: string, body: Uint8Array, contentType: string): Promise<void> {
  await getNeonStorageClient().send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: contentType }));
}

export async function getNeonStorageObject(bucket: string, key: string): Promise<Uint8Array> {
  const response = await getNeonStorageClient().send(new GetObjectCommand({ Bucket: bucket, Key: key }));
  if (!response.Body) throw new Error('Object storage returned an empty body.');
  return new Uint8Array(await response.Body.transformToByteArray());
}

export async function deleteNeonStorageObject(bucket: string, key: string): Promise<void> {
  await getNeonStorageClient().send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}

export async function getNeonStorageDownloadUrl(bucket: string, key: string, expiresIn = 3600): Promise<string> {
  return getSignedUrl(getNeonStorageClient(), new GetObjectCommand({ Bucket: bucket, Key: key }), { expiresIn });
}
