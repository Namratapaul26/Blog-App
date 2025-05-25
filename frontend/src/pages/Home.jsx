import React, { useEffect, useState } from 'react';
import {
  Container,
  Grid,
  Typography,
  Box,
  Pagination,
  CircularProgress,
} from '@mui/material';
import BlogCard from '../components/BlogCard';
import { blogAPI } from '../services/api';

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState({
    blogs: [],
    currentPage: 1,
    totalPages: 1,
    totalBlogs: 0,
  });

  const fetchBlogs = async (page) => {
    try {
      setLoading(true);
      const response = await blogAPI.getBlogs(page);
      setData(response);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to fetch blogs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs(1);
  }, []);

  const handlePageChange = (event, page) => {
    fetchBlogs(page);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Latest Blog Posts
      </Typography>
      
      <Grid container spacing={4}>
        {data.blogs.map((blog) => (
          <Grid item xs={12} sm={6} md={4} key={blog._id}>
            <BlogCard blog={blog} />
          </Grid>
        ))}
      </Grid>

      {data.totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={4}>
          <Pagination
            count={data.totalPages}
            page={data.currentPage}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}
    </Container>
  );
};

export default Home; 