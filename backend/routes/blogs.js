const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Blog = require('../models/Blog');
const User = require('../models/User');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const mimetype = allowedTypes.test(file.mimetype);
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error(`File upload only supports the following filetypes: ${allowedTypes}`));
};

const upload = multer({
  storage: storage,
  limits: { 
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 11 // Maximum 11 files (1 cover + 10 content images)
  },
  fileFilter: fileFilter
});

// Multer error handling middleware
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File size is too large. Maximum size is 5MB.' });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ message: 'Too many files uploaded.' });
    }
    return res.status(400).json({ message: err.message });
  }
  if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
};

// Create multer middleware for blog routes
const uploadBlogFiles = (req, res, next) => {
  upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'contentImages', maxCount: 10 }
  ])(req, res, (err) => {
    handleMulterError(err, req, res, next);
  });
};

// @route   GET api/blogs
// @desc    Get all blogs with pagination
// @access  Public
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const blogs = await Blog.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'name email');

    const total = await Blog.countDocuments();

    res.json({
      blogs,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalBlogs: total
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/blogs/:id
// @desc    Get blog by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate('author', 'name email');
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    res.json(blog);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Blog not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   POST api/blogs
// @desc    Create a blog
// @access  Private
router.post('/', [
  auth,
  uploadBlogFiles,
  [
    check('title', 'Title is required').not().isEmpty(),
    check('content', 'Content is required').not().isEmpty()
  ]
], async (req, res) => {
  try {
    // Validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    console.log('Request body:', req.body);
    console.log('Files received:', req.files);

    const newBlog = new Blog({
      title: req.body.title,
      content: req.body.content,
      author: req.user.id
    });

    // Handle file uploads
    if (req.files) {
      if (req.files.coverImage) {
        newBlog.coverImage = '/uploads/' + req.files.coverImage[0].filename;
        console.log('Cover image path:', newBlog.coverImage);
      }
      if (req.files.contentImages) {
        newBlog.contentImages = req.files.contentImages.map(file => '/uploads/' + file.filename);
        console.log('Content images paths:', newBlog.contentImages);
      }
    }

    const blog = await newBlog.save();
    await blog.populate('author', 'name email');
    
    res.json(blog);
  } catch (err) {
    console.error('Error creating blog:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ 
      message: 'Error creating blog',
      error: err.message 
    });
  }
});

// @route   PUT api/blogs/:id
// @desc    Update a blog
// @access  Private
router.put('/:id', [
  auth,
  uploadBlogFiles,
  [
    check('title', 'Title is required').not().isEmpty(),
    check('content', 'Content is required').not().isEmpty()
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    let blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Check user
    if (blog.author.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    // Handle file uploads
    const updateData = {
      title: req.body.title,
      content: req.body.content
    };

    if (req.files) {
      if (req.files.coverImage) {
        // Delete old cover image if it exists
        if (blog.coverImage) {
          const oldPath = path.join(__dirname, '..', blog.coverImage);
          if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
          }
        }
        updateData.coverImage = '/uploads/' + req.files.coverImage[0].filename;
      }
      if (req.files.contentImages) {
        // Delete old content images
        blog.contentImages.forEach(imagePath => {
          const oldPath = path.join(__dirname, '..', imagePath);
          if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
          }
        });
        updateData.contentImages = req.files.contentImages.map(file => '/uploads/' + file.filename);
      }
    }

    blog = await Blog.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    ).populate('author', 'name email');

    res.json(blog);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Blog not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/blogs/:id
// @desc    Delete a blog
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Check user
    if (blog.author.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    // Delete associated images
    if (blog.coverImage) {
      const coverPath = path.join(__dirname, '..', blog.coverImage);
      if (fs.existsSync(coverPath)) {
        fs.unlinkSync(coverPath);
      }
    }

    if (blog.contentImages && blog.contentImages.length > 0) {
      blog.contentImages.forEach(imagePath => {
        const contentPath = path.join(__dirname, '..', imagePath);
        if (fs.existsSync(contentPath)) {
          fs.unlinkSync(contentPath);
        }
      });
    }

    // Use findByIdAndDelete instead of remove()
    await Blog.findByIdAndDelete(req.params.id);

    res.json({ message: 'Blog removed' });
  } catch (err) {
    console.error('Error in delete blog:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Blog not found' });
    }
    res.status(500).json({ 
      message: 'Server Error',
      error: err.message 
    });
  }
});

module.exports = router; 