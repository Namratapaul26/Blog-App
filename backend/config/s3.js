const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');

// Validate AWS credentials
const validateAWSConfig = () => {
  const requiredVars = ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_BUCKET_NAME', 'AWS_REGION'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required AWS environment variables: ${missingVars.join(', ')}`);
  }
};

// Configure AWS
try {
  validateAWSConfig();
  
  AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
  });

  console.log('AWS configured successfully');
} catch (error) {
  console.error('AWS configuration error:', error.message);
  throw error;
}

// Create S3 instance
const s3 = new AWS.S3();

// Configure multer with S3
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_BUCKET_NAME,
    acl: 'public-read',
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, `blog-images/${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 11 // Maximum 11 files (1 cover + 10 content images)
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

// Middleware to handle file uploads
const uploadBlogFiles = (req, res, next) => {
  const uploadFields = upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'contentImages', maxCount: 10 }
  ]);

  uploadFields(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      console.error('Multer error:', err);
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File size is too large. Maximum size is 5MB.' });
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({ message: 'Too many files uploaded.' });
      }
      return res.status(400).json({ message: err.message });
    }
    if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({ message: err.message });
    }

    // Log successful upload
    if (req.files) {
      console.log('Files uploaded successfully:', {
        coverImage: req.files.coverImage ? req.files.coverImage[0].location : 'none',
        contentImages: req.files.contentImages ? req.files.contentImages.map(f => f.location) : []
      });
    }

    next();
  });
};

// Function to delete file from S3
const deleteFileFromS3 = async (fileUrl) => {
  try {
    const key = fileUrl.split('.com/')[1];
    await s3.deleteObject({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key
    }).promise();
    
    console.log('File deleted successfully from S3:', key);
  } catch (error) {
    console.error('Error deleting file from S3:', error);
    throw error;
  }
};

// Test S3 connection
const testS3Connection = async () => {
  try {
    await s3.listBuckets().promise();
    console.log('S3 connection test successful');
  } catch (error) {
    console.error('S3 connection test failed:', error);
    throw error;
  }
};

// Run connection test
testS3Connection();

module.exports = {
  s3,
  uploadBlogFiles,
  deleteFileFromS3
}; 