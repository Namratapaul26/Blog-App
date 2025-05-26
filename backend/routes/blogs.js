const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Blog = require('../models/Blog');
const { uploadBlogFiles, cloudinary } = require('../config/cloudinary');

// @route   GET api/blogs
// @desc    Get all blogs
// @access  Public
router.get('/', async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 }).populate('author', 'name');
    res.json(blogs);
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
    const blog = await Blog.findById(req.params.id).populate('author', 'name');
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
    // Log the request details
    console.log('Create Blog Request:', {
      body: req.body,
      files: req.files,
      user: req.user,
      headers: req.headers
    });

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const newBlog = new Blog({
      title: req.body.title,
      content: req.body.content,
      author: req.user.id
    });

    // Handle file uploads
    if (req.files) {
      if (req.files.coverImage) {
        newBlog.coverImage = req.files.coverImage[0].path;
      }
      if (req.files.contentImages) {
        newBlog.contentImages = req.files.contentImages.map(file => file.path);
      }
    }

    const blog = await newBlog.save();
    await blog.populate('author', 'name');
    
    // Log the created blog
    console.log('Blog created successfully:', {
      id: blog._id,
      title: blog.title,
      author: blog.author,
      coverImage: blog.coverImage,
      contentImages: blog.contentImages
    });

    res.json(blog);
  } catch (err) {
    console.error('Error creating blog:', {
      error: err.message,
      stack: err.stack,
      body: req.body,
      files: req.files
    });
    
    // Handle specific error cases
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: Object.values(err.errors).map(e => ({ msg: e.message }))
      });
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
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Check user
    if (blog.author.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    // Handle file uploads and delete old images
    const updateData = {
      title: req.body.title,
      content: req.body.content
    };

    if (req.files) {
      if (req.files.coverImage) {
        // Delete old cover image from Cloudinary
        if (blog.coverImage) {
          const publicId = blog.coverImage.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(`blog-app/${publicId}`);
        }
        updateData.coverImage = req.files.coverImage[0].path;
      }
      
      if (req.files.contentImages) {
        // Delete old content images from Cloudinary
        if (blog.contentImages && blog.contentImages.length > 0) {
          const deletePromises = blog.contentImages.map(imagePath => {
            const publicId = imagePath.split('/').pop().split('.')[0];
            return cloudinary.uploader.destroy(`blog-app/${publicId}`);
          });
          await Promise.all(deletePromises);
        }
        updateData.contentImages = req.files.contentImages.map(file => file.path);
      }
    }

    blog = await Blog.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    ).populate('author', 'name');

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

    // Delete images from Cloudinary
    if (blog.coverImage) {
      const publicId = blog.coverImage.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`blog-app/${publicId}`);
    }

    if (blog.contentImages && blog.contentImages.length > 0) {
      const deletePromises = blog.contentImages.map(imagePath => {
        const publicId = imagePath.split('/').pop().split('.')[0];
        return cloudinary.uploader.destroy(`blog-app/${publicId}`);
      });
      await Promise.all(deletePromises);
    }

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