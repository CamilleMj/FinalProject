const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configuration using environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Function to upload an image
// async function uploadImage(imageBuffer) {
//     try {
//       const uploadResult = await cloudinary.uploader.upload_stream({
//         folder: 'event_images',
//         public_id: 'event_image',
//       }, (error, result) => {
//         if (error) {
//           throw error;
//         }
//         return result;
//       });
  
//       // Pipe the image buffer to the upload stream
//       const stream = require('stream');
//       const bufferStream = new stream.PassThrough();
//       bufferStream.end(imageBuffer);
//       bufferStream.pipe(uploadResult);
  
//       return uploadResult;
//     } catch (error) {
//       console.error('Error uploading to Cloudinary:', error);
//       throw error;
//     }
//   }

// module.exports = { uploadImage };
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'events',
        allowed_formats: ['jpg', 'png'],
    },
});

const upload = multer({ storage: storage });

const uploadImage = (fileBuffer) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream({ folder: 'events' }, (error, result) => {
            if (error) {
                reject(error);
            } else {
                resolve(result);
            }
        }).end(fileBuffer);
    });
};

module.exports = { uploadImage };
