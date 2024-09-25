import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import * as dotenv from 'dotenv';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

@Injectable()
export class FileUploadService {
  private s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

  async uploadImageToS3(
    file: Express.Multer.File,
    folder: string,
  ): Promise<string> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    try {
      // Generate unique file name with UUID and preserve original file extension
      const fileExtension = extname(file.originalname);
      const fileKey = `${folder}/${uuidv4()}${fileExtension}`;

      // Prepare the parameters for uploading to S3
      const uploadParams = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: fileKey,
        Body: file.buffer,
        ContentType: file.mimetype,
        // Remove the ACL property
      };

      // Upload the file to S3
      await this.s3.send(new PutObjectCommand(uploadParams));

      // Return the URL of the uploaded file
      return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;
    } catch (error) {
      console.error('Error uploading file to S3:', error);
      throw new InternalServerErrorException('Error uploading file to S3');
    }
  }
}
