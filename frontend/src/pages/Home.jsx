import React, { useEffect, useState } from 'react';
import {
  Container,
  Grid,
  Typography,
  Box,
  Pagination,
  CircularProgress,
  Alert,
} from '@mui/material';
import BlogCard from '../components/BlogCard';
import { blogAPI } from '../services/api';

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        console.log('Fetching blogs...');
        setLoading(true);
        const response = await blogAPI.getBlogs();
        console.log('Blogs response:', response);
        setBlogs(Array.isArray(response) ? response : []);
        setError('');
      } catch (err) {
        console.error('Error fetching blogs:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
          apiUrl: process.env.REACT_APP_API_URL
        });
        setError(err.response?.data?.message || err.message || 'Failed to fetch blogs');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {error ? (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
          <Typography variant="body2" sx={{ mt: 1 }}>
            API URL: {process.env.REACT_APP_API_URL || 'Not set'}
          </Typography>
        </Alert>
      ) : null}

      <Typography variant="h4" component="h1" gutterBottom>
        Latest Blog Posts
      </Typography>
      
      {blogs.length > 0 ? (
        <Grid container spacing={4}>
          {blogs.map((blog) => (
            <Grid item xs={12} sm={6} md={4} key={blog._id}>
              <BlogCard blog={blog} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="text.secondary">
            No blog posts found
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default Home; 