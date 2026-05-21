import { S3Client } from "@aws-sdk/client-s3";

export const s3Client = new S3Client({
  region: "us-east-1", // Or your preferred region
  endpoint: "http://localhost:4566", // LocalStack address
  forcePathStyle: true, // Required for LocalStack/Minio
  credentials: {
    accessKeyId: "test", // Dummy credentials for local dev
    secretAccessKey: "test",
  },
});
