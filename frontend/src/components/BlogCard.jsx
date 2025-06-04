import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Link,
} from '@mui/material';
import PropTypes from 'prop-types';

const BlogCard = ({ blog }) => {
  return (
    <Card 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        }
      }}
    >
      {blog.coverImage && (
        <CardMedia
          component="img"
          height="200"
          image={blog.coverImage}
          alt={blog.title}
          sx={{
            objectFit: 'cover',
          }}
        />
      )}
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography 
          variant="h6" 
          component={RouterLink}
          to={`/blogs/${blog._id}`}
          sx={{
            textDecoration: 'none',
            color: 'text.primary',
            '&:hover': {
              color: 'primary.main',
            },
            mb: 1
          }}
        >
          {blog.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {blog.content.substring(0, 150)}...
        </Typography>
        <Box sx={{ mt: 'auto' }}>
          <Typography variant="caption" color="text.secondary">
            By {blog.author?.name || 'Unknown'} • {new Date(blog.createdAt).toLocaleDateString()}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

BlogCard.propTypes = {
  blog: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    coverImage: PropTypes.string,
    author: PropTypes.shape({
      name: PropTypes.string
    }),
    createdAt: PropTypes.string.isRequired
  }).isRequired
};

export default BlogCard; 