import React from 'react';
import { Link } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  CardActionArea,
  Box,
  Avatar,
  Chip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: theme.shadows[8],
  },
}));

const StyledCardMedia = styled(CardMedia)(({ theme }) => ({
  height: 240,
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '30%',
    background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)',
  },
}));

const BlogCard = ({ blog }) => {
  const defaultCoverImage = '/placeholder-blog.jpg';
  const formattedDate = new Date(blog.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Calculate read time (assuming average reading speed of 200 words per minute)
  const wordCount = blog.content.split(/\s+/).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <StyledCard>
      <CardActionArea component={Link} to={`/blogs/${blog._id}`}>
        <Box sx={{ position: 'relative' }}>
          <StyledCardMedia
            image={blog.coverImage ? `http://localhost:5000${blog.coverImage}` : defaultCoverImage}
            alt={blog.title}
          />
          <Box
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              zIndex: 1,
            }}
          >
            <Chip
              label={`${readTime} min read`}
              size="small"
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(4px)',
                fontWeight: 500,
              }}
            />
          </Box>
        </Box>
        <CardContent>
          <Typography
            gutterBottom
            variant="h5"
            component="h2"
            sx={{
              fontWeight: 600,
              fontSize: '1.25rem',
              mb: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {blog.title}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              lineHeight: 1.6,
            }}
          >
            {blog.content}
          </Typography>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Avatar
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                blog.author?.name || 'Unknown'
              )}&background=random`}
              sx={{ width: 32, height: 32 }}
            />
            <Box>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 600,
                  color: 'text.primary',
                }}
              >
                {blog.author?.name || 'Unknown'}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block' }}
              >
                {formattedDate}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </CardActionArea>
    </StyledCard>
  );
};

BlogCard.propTypes = {
  blog: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    coverImage: PropTypes.string,
    author: PropTypes.shape({
      name: PropTypes.string,
    }),
    createdAt: PropTypes.string.isRequired,
  }).isRequired,
};

export default BlogCard; 