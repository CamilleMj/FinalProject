const { v2: cloudinary } = require('cloudinary');
require('dotenv').config();

// Configuration using environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Function to upload an image
async function uploadImage(imagePath) {
  try {
    const uploadResult = await cloudinary.uploader.upload(imagePath, {
      folder: 'event_images',
      public_id: 'event_image',
    });
    return uploadResult;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
}

module.exports = { uploadImage };
