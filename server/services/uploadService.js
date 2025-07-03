const sharp = require('sharp');
const { s3Client } = require('../config/s3Config');
const { PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { AppError } = require('../utils/error');
const { extractFileKey } = require('../utils/helper');


const uploadImageService = async (file) => {
    try {
        if (!file) {
            throw new AppError('Please upload an image', 400);
        }

        const allowedTypes = [ 'image/png', 'image/jpg', 'image/jpeg', 'image/webp'];
        if (!allowedTypes.includes(file.mimetype)) {
            throw new AppError('Invalid file type. Only PNG, JPG, JPEG, and WEBP are allowed.', 400);
        }

        const fileKey = `uploads/${Date.now()}-${file.originalname}`;
        const imageBuffer = await sharp(file.buffer)
            .jpeg({ quality: 80 }) // Convert to JPEG with 80% quality
            .toBuffer();
        
        // upload parameters
        const uploadParams = {
            Bucket: process.env.S3_BUCKET,
            Key: fileKey,
            Body: imageBuffer,
            ContentType: 'image/jpeg', // Set the content type to JPEG
            ACL: 'public-read', // Set the ACL to public-read if you want the image to be publicly accessible
        };

        // Upload the image to S3
        const command = new PutObjectCommand(uploadParams);
        await s3Client.send(command);

        // Return the minio URL of the uploaded image
        const imageUrl = `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET}/${fileKey}`;
        return imageUrl;
    } catch (error) {
        if (error instanceof AppError) {
            throw error; // Re-throw custom errors
        }
        console.error('Error uploading image:', error);
        throw new AppError('Failed to upload image', 500);
    }
};


// delete image service
const deleteImageService = async (imageUrl) => {
    try {
        if (!imageUrl) {
            throw new AppError('Image URL is required', 400);
        }

        const fileKey = extractFileKey(imageUrl);
        if (!fileKey) {
            throw new AppError('Invalid image URL', 400);
        }
        const decodedKey = decodeURIComponent(fileKey);

        // delete parameters
        const deleteParams = {
            Bucket: process.env.S3_BUCKET,
            Key: decodedKey,
        };

        // Delete the image from S3
        const command = new DeleteObjectCommand(deleteParams);
        await s3Client.send(command);

        return { deleted: true };
    } catch (error) {
        if (error instanceof AppError) {
            throw error; // Re-throw custom errors
        }
        console.error('Error deleting image:', error);
        return { deleted: false };
    }
};


module.exports = {
    uploadImageService,
    deleteImageService
};