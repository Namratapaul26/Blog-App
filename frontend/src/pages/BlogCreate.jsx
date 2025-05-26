import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  IconButton,
  Card,
  CardMedia,
  Alert,
} from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import AddPhotoAlternate from '@mui/icons-material/AddPhotoAlternate';
import { blogAPI } from '../services/api';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_CONTENT_IMAGES = 10;

const BlogCreate = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
  });
  const [coverImage, setCoverImage] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState('');
  const [contentImages, setContentImages] = useState([]);
  const [contentImagePreviews, setContentImagePreviews] = useState([]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const coverImageInputRef = useRef(null);
  const contentImageInputRef = useRef(null);

  const validateFileSize = (file) => {
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`File ${file.name} is too large. Maximum size is 5MB.`);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCoverImageChange = (e) => {
    try {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        validateFileSize(file);
        setCoverImage(file);
        const reader = new FileReader();
        reader.onload = () => {
          setCoverImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      setError(err.message);
      e.target.value = '';
    }
  };

  const handleContentImageChange = (e) => {
    try {
      if (e.target.files) {
        const files = Array.from(e.target.files);
        
        // Check total number of images
        if (contentImages.length + files.length > MAX_CONTENT_IMAGES) {
          throw new Error(`Maximum ${MAX_CONTENT_IMAGES} content images allowed.`);
        }

        // Validate each file size
        files.forEach(validateFileSize);

        setContentImages((prev) => [...prev, ...files]);
        
        files.forEach((file) => {
          const reader = new FileReader();
          reader.onload = () => {
            setContentImagePreviews((prev) => [...prev, reader.result]);
          };
          reader.readAsDataURL(file);
        });
      }
    } catch (err) {
      setError(err.message);
      e.target.value = '';
    }
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      throw new Error('Title is required');
    }
    if (!formData.content.trim()) {
      throw new Error('Content is required');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // Validate form data
      validateForm();

      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title.trim());
      formDataToSend.append('content', formData.content.trim());

      if (coverImage) {
        formDataToSend.append('coverImage', coverImage);
      }

      contentImages.forEach((image) => {
        formDataToSend.append('contentImages', image);
      });

      console.log('Submitting blog with:', {
        title: formData.title,
        content: formData.content,
        coverImage: coverImage ? coverImage.name : 'none',
        contentImages: contentImages.map(img => img.name)
      });

      const blog = await blogAPI.createBlog(formDataToSend);
      navigate(`/blogs/${blog._id}`);
    } catch (err) {
      console.error('Error creating blog:', err);
      if (err.response?.data?.errors) {
        // Handle validation errors from the server
        const errorMessages = err.response.data.errors
          .map(error => error.msg)
          .join(', ');
        setError(errorMessages);
      } else {
        setError(err.response?.data?.message || err.message || 'An error occurred while creating the blog');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Typography component="h1" variant="h4" gutterBottom>
            Create New Blog Post
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="title"
              label="Title"
              name="title"
              autoFocus
              value={formData.title}
              onChange={handleChange}
              error={!!error && !formData.title.trim()}
              helperText={error && !formData.title.trim() ? 'Title is required' : ''}
            />

            {/* Cover Image Upload */}
            <Box sx={{ my: 2 }}>
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                ref={coverImageInputRef}
                onChange={handleCoverImageChange}
              />
              <Button
                variant="outlined"
                startIcon={<PhotoCamera />}
                onClick={() => coverImageInputRef.current?.click()}
              >
                Upload Cover Image
              </Button>
              {coverImagePreview && (
                <Card sx={{ mt: 2, maxWidth: 345 }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={coverImagePreview}
                    alt="Cover preview"
                  />
                </Card>
              )}
            </Box>

            <TextField
              margin="normal"
              required
              fullWidth
              name="content"
              label="Content"
              multiline
              rows={10}
              value={formData.content}
              onChange={handleChange}
              error={!!error && !formData.content.trim()}
              helperText={error && !formData.content.trim() ? 'Content is required' : ''}
            />

            {/* Content Images Upload */}
            <Box sx={{ my: 2 }}>
              <input
                type="file"
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                ref={contentImageInputRef}
                onChange={handleContentImageChange}
              />
              <Button
                variant="outlined"
                startIcon={<AddPhotoAlternate />}
                onClick={() => contentImageInputRef.current?.click()}
                disabled={contentImages.length >= MAX_CONTENT_IMAGES}
              >
                Add Content Images ({contentImages.length}/{MAX_CONTENT_IMAGES})
              </Button>
              <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {contentImagePreviews.map((preview, index) => (
                  <Card key={index} sx={{ width: 100 }}>
                    <CardMedia
                      component="img"
                      height="100"
                      image={preview}
                      alt={`Content image ${index + 1}`}
                    />
                  </Card>
                ))}
              </Box>
            </Box>

            <Box sx={{ mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Publishing...' : 'Publish'}
              </Button>
              <Button
                sx={{ ml: 2 }}
                onClick={() => navigate('/')}
                size="large"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default BlogCreate; 