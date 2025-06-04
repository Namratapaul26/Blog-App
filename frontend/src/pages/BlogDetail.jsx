import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Divider,
  ImageList,
  ImageListItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert,
} from '@mui/material';
import { blogAPI } from '../services/api';

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const token = localStorage.getItem('token');
  const user = token ? JSON.parse(atob(token.split('.')[1])).user : null;
  const isAuthor = blog?.author?._id === user?.id;

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const data = await blogAPI.getBlog(id);
        setBlog(data);
      } catch (err) {
        setError(err.message || 'Error fetching blog');
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id]);

  const handleDeleteClick = () => {
    if (!token) {
      setDeleteError('You must be logged in to delete a blog');
      return;
    }
    setDeleteDialogOpen(true);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  const handleDeleteConfirm = async () => {
    try {
      setIsDeleting(true);
      setDeleteError('');
      
      if (!id) {
        throw new Error('Blog ID is missing');
      }
      if (!token) {
        throw new Error('You must be logged in to delete a blog');
      }

      // Verify user owns the blog
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      if (blog.author._id !== decodedToken.user.id) {
        throw new Error('You are not authorized to delete this blog');
      }

      await blogAPI.deleteBlog(id);
      setDeleteDialogOpen(false);
      navigate('/');
    } catch (err) {
      console.error('Error deleting blog:', err);
      
      // Handle specific error cases
      if (err.response?.status === 500) {
        setDeleteError(
          'The server encountered an error. This might be because the blog has already been deleted or due to a temporary server issue. Please try refreshing the page.'
        );
      } else if (err.response?.status === 401) {
        setDeleteError('Your session has expired. Please log in again.');
        localStorage.removeItem('token');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setDeleteError(
          err.response?.data?.message || 
          err.message || 
          'An error occurred while deleting the blog'
        );
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRetryDelete = () => {
    setRetryCount(prev => prev + 1);
    setDeleteError('');
    handleDeleteConfirm();
  };

  const handleCloseError = () => {
    setDeleteError('');
  };

  if (loading) {
    return (
      <Container>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

  if (!blog) {
    return (
      <Container>
        <Typography>Blog not found</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Paper sx={{ p: 4 }}>
          {/* Cover Image */}
          {blog.coverImage && (
            <Box sx={{ mb: 4, borderRadius: 1, overflow: 'hidden' }}>
              <img
                src={blog.coverImage}
                alt={blog.title}
                style={{
                  width: '100%',
                  height: '400px',
                  objectFit: 'cover',
                }}
              />
            </Box>
          )}

          <Typography variant="h4" component="h1" gutterBottom>
            {blog.title}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            By {blog.author?.name || 'Unknown'} • {new Date(blog.createdAt).toLocaleDateString()}
          </Typography>
          <Divider sx={{ my: 2 }} />
          
          {/* Blog Content */}
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 4 }}>
            {blog.content}
          </Typography>

          {/* Content Images */}
          {blog.contentImages && blog.contentImages.length > 0 && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                Additional Images
              </Typography>
              <ImageList sx={{ width: '100%' }} cols={2} gap={16}>
                {blog.contentImages.map((image, index) => (
                  <ImageListItem key={index}>
                    <img
                      src={image}
                      alt={`Blog content ${index + 1}`}
                      loading="lazy"
                      style={{
                        width: '100%',
                        height: '300px',
                        objectFit: 'cover',
                        borderRadius: '4px',
                      }}
                    />
                  </ImageListItem>
                ))}
              </ImageList>
            </Box>
          )}

          {/* Action Buttons */}
          {isAuthor && (
            <Box sx={{ mt: 4 }}>
              <Button
                variant="contained"
                color="primary"
                component={RouterLink}
                to={`/blogs/edit/${blog._id}`}
                sx={{ mr: 2 }}
              >
                Edit
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={handleDeleteClick}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </Box>
          )}
        </Paper>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Delete Blog Post
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete this blog post? This action cannot be undone.
          </DialogContentText>
          {deleteError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {deleteError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary" disabled={isDeleting}>
            Cancel
          </Button>
          {deleteError && retryCount < 3 ? (
            <Button 
              onClick={handleRetryDelete}
              color="warning" 
              variant="contained"
              disabled={isDeleting}
            >
              Retry Delete
            </Button>
          ) : (
            <Button 
              onClick={handleDeleteConfirm} 
              color="error" 
              variant="contained"
              disabled={isDeleting || retryCount >= 3}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Error Snackbar */}
      <Snackbar
        open={!!deleteError}
        autoHideDuration={6000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseError} 
          severity="error" 
          sx={{ width: '100%' }}
          action={
            retryCount < 3 && (
              <Button 
                color="inherit" 
                size="small" 
                onClick={handleRetryDelete}
                disabled={isDeleting}
              >
                RETRY
              </Button>
            )
          }
        >
          {deleteError}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default BlogDetail; 