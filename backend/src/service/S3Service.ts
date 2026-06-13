import { PutObjectCommand, GetObjectCommand, CreateBucketCommand, HeadBucketCommand, HeadObjectCommand, PutBucketPolicyCommand } from "@aws-sdk/client-s3";
import { Readable } from 'stream';
import { s3Client } from "../config";
import { AppError } from "../middleware";
import crypto from 'crypto';
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3ServiceException } from "@aws-sdk/client-s3";

export interface UploadFileParams {
    bucket: string;
    key: string;
    body: Buffer | Uint8Array | Blob | string | Readable;
    contentType?: string;
}

export async function uploadToS3({ bucket, key, body, contentType }: UploadFileParams) {
    const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: body,
        ContentType: contentType || 'application/octet-stream',
    });

    try {
        const result = await s3Client.send(command);
        const endpoint = process.env.LOCALSTACK_ENDPOINT ?? 'http://localhost:4566';
        return {
            ...result,
            Location: `${endpoint}/${bucket}/${key}`,
        };
    } catch (error) {
        console.error('S3 upload error:', error);
        throw new AppError('Erro fazendo upload da imagem', 500);
    }
}

export async function getFromS3(bucket: string, key: string) {
    const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
    });

    try {
        return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    } catch (error) {
        console.error('S3 get error:', error);
        throw new AppError('Erro fazendo download da imagem', 500);
    }
}

export async function createBucket(bucketName: string) {
    const command = new CreateBucketCommand({
        Bucket: bucketName,
    });

    try {
        const result = await s3Client.send(command);
        return result;
    } catch (error) {
        console.error('Error creating bucket:', error);
        throw new AppError('Erro fazendo upload da imagem', 500);
    }
}

export async function doesBucketExist(bucketName: string): Promise<boolean> {
    try {
        const command = new HeadBucketCommand({ Bucket: bucketName });
        await s3Client.send(command);
        return true; 
    } catch (error) {
        if (error instanceof S3ServiceException) {
            if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
                return false; 
            }
        }

        if (error instanceof Error) {
            console.error('Error checking bucket:', error.message);
        } else {
            console.error('Unknown error checking bucket:', error);
        }

        throw new AppError('Erro fazendo upload da imagem', 500);
    }
}

export function generateUniqueImageKey(image: Buffer) {
    const hash = crypto.createHash('sha-256');
    hash.update(image);
    return hash.digest('hex');
}

async function setBucketPublicPolicy(bucketName: string): Promise<void> {
    const policy = JSON.stringify({
        Version: '2012-10-17',
        Statement: [{
            Sid: 'PublicReadGetObject',
            Effect: 'Allow',
            Principal: '*',
            Action: 's3:GetObject',
            Resource: `arn:aws:s3:::${bucketName}/*`,
        }],
    });

    await s3Client.send(new PutBucketPolicyCommand({ Bucket: bucketName, Policy: policy }));
}

export async function ensureBucketExists(bucketName: string): Promise<void> {
    try {
        const bucketExists = await doesBucketExist(bucketName);

        if (!bucketExists) {
            await createBucket(bucketName);
        }

        await setBucketPublicPolicy(bucketName);
        return;
    } catch (error) {
        console.error('Error ensuring bucket existense', error)
        throw new AppError('Erro fazendo upload da imagem', 500);
    }

}

export function getImageContentType(image: any): string {
    if (image.mimetype) return image.mimetype;
    if (image.type) return image.type;
    return 'image/jpeg'; 
}

export async function checkFileExists(bucket: string, key: string): Promise<boolean> {
    const command = new HeadObjectCommand({
        Bucket: bucket,
        Key: key,
    });

    try {
        await s3Client.send(command);
        return true; 
    } catch (error: any) {
        if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
            return false;
        }
        
        throw new AppError('Erro fazendo upload da imagem', 500);
    }
}
