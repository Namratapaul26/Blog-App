const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Validate Cloudinary credentials
const validateCloudinaryConfig = () => {
  const requiredVars = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required Cloudinary environment variables: ${missingVars.join(', ')}`);
  }
};

// Configure Cloudinary
try {
  validateCloudinaryConfig();
  
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });

  console.log('Cloudinary configured successfully');
} catch (error) {
  console.error('Cloudinary configuration error:', error.message);
  throw error;
}

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'blog-app',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
    transformation: [{ width: 1000, height: 1000, crop: 'limit' }],
    // Add unique filename
    public_id: (req, file) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      return `blog-app/${file.fieldname}-${uniqueSuffix}`;
    }
  }
});

// Configure multer with Cloudinary storage
const upload = multer({ 
  storage: storage,
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
        coverImage: req.files.coverImage ? req.files.coverImage[0].path : 'none',
        contentImages: req.files.contentImages ? req.files.contentImages.map(f => f.path) : []
      });
    }

    next();
  });
};

// Test Cloudinary connection
const testCloudinaryConnection = async () => {
  try {
    const result = await cloudinary.api.ping();
    console.log('Cloudinary connection test successful:', result);
  } catch (error) {
    console.error('Cloudinary connection test failed:', error);
    throw error;
  }
};

// Run connection test
testCloudinaryConnection();

module.exports = {
  cloudinary,
  uploadBlogFiles
}; 