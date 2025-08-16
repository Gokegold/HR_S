import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";

const s3 = new AWS.S3({ region: process.env.AWS_REGION });
const rek = new AWS.Rekognition({ region: process.env.AWS_REGION });

export async function uploadImageToS3(userId: string, base64: string) {
  const buffer = Buffer.from(base64.split(",").pop() || base64, "base64");
  const key = `photos/${userId}/${uuidv4()}.jpg`;
  await s3
    .putObject({
      Bucket: process.env.S3_BUCKET!,
      Key: key,
      Body: buffer,
      ContentType: "image/jpeg",
      ACL: "private",
    })
    .promise();
  return key;
}

export async function compareFaceWithReference(selfieRef: string, photoRef: string, threshold = 80) {
  try {
    const params: AWS.Rekognition.CompareFacesRequest = {
      SourceImage: { S3Object: { Bucket: process.env.S3_BUCKET!, Name: selfieRef } },
      TargetImage: { S3Object: { Bucket: process.env.S3_BUCKET!, Name: photoRef } },
      SimilarityThreshold: threshold,
    };
    const res = await rek.compareFaces(params).promise();
    if (res.FaceMatches && res.FaceMatches.length > 0) {
      return true;
    }
  } catch (err) {
    console.error("Rekognition compare error:", err);
  }
  return false;
}

/**
 * Compare two arbitrary s3 keys and return similarity score (0-100)
 */
export async function compareTwoImages(s3KeyA: string, s3KeyB: string) {
  try {
    const params: AWS.Rekognition.CompareFacesRequest = {
      SourceImage: { S3Object: { Bucket: process.env.S3_BUCKET!, Name: s3KeyA } },
      TargetImage: { S3Object: { Bucket: process.env.S3_BUCKET!, Name: s3KeyB } },
      SimilarityThreshold: 0,
    };
    const res = await rek.compareFaces(params).promise();
    if (res.FaceMatches && res.FaceMatches.length > 0) {
      return (res.FaceMatches[0].Similarity || 0);
    }
  } catch (err) {
    console.error("Rekognition compareTwoImages error:", err);
  }
  return 0;
}