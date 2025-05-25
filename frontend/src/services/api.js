import axios from 'axios';

const API_URL = process.env.NODE_ENV === 'production'
  ? process.env.REACT_APP_API_URL
  : 'http://localhost:5000/api';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add token to requests if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    // Ensure headers object exists
    if (!config.headers) {
      config.headers = {};
    }

    if (token) {
      config.headers['x-auth-token'] = token;
    }

    // Log request details in development
    if (process.env.NODE_ENV === 'development') {
      console.log('API Request:', {
        url: config.url,
        method: config.method,
        headers: config.headers,
      });
    }

    return config;
  },
  (error) => {
    console.error('Request Interceptor Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 500) {
      console.error('Server Error (500):', {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers,
        data: error.config?.data,
        response: error.response?.data,
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
      });
    } else {
      console.error('API Error:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
      });
    }
    throw error;
  }
);

export const authAPI = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  signup: async (credentials) => {
    const response = await api.post('/auth/signup', credentials);
    return response.data;
  },

  getUser: async () => {
    const response = await api.get('/auth/user');
    return response.data;
  },
};

export const blogAPI = {
  getBlogs: async (page = 1, limit = 10) => {
    const response = await api.get(`/blogs?page=${page}&limit=${limit}`);
    return response.data;
  },

  getBlog: async (id) => {
    const response = await api.get(`/blogs/${id}`);
    return response.data;
  },

  createBlog: async (blogData) => {
    try {
      const response = await api.post('/blogs', blogData, {
        headers: {
          'Content-Type': blogData instanceof FormData ? 'multipart/form-data' : 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error in createBlog:', error);
      throw error;
    }
  },

  updateBlog: async (id, blogData) => {
    try {
      const response = await api.put(`/blogs/${id}`, blogData, {
        headers: {
          'Content-Type': blogData instanceof FormData ? 'multipart/form-data' : 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error in updateBlog:', error);
      throw error;
    }
  },

  deleteBlog: async (id) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Log the delete attempt
      console.log('Attempting to delete blog:', {
        id,
        token: token ? 'Present' : 'Missing',
      });

      const response = await api.delete(`/blogs/${id}`);
      
      // Log successful deletion
      console.log('Blog deleted successfully:', {
        id,
        response: response.data,
      });

      return response.data;
    } catch (error) {
      // Log detailed error information
      console.error('Error in deleteBlog:', {
        id,
        error: error.response?.data || error.message,
        status: error.response?.status,
        stack: error.stack,
      });
      throw error;
    }
  },
}; 