import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

console.log('API Configuration:', {
  environment: process.env.NODE_ENV,
  apiUrl: API_URL,
  baseUrl: API_URL ? API_URL.replace('/api', '') : null
});

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include auth token
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

    // For FormData, let the browser set the Content-Type
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    // Log request details for debugging
    console.log('API Request:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
      isFormData: config.data instanceof FormData,
      hasToken: !!token
    });

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      console.error('Login Error:', {
        message: error.message,
        response: error.response?.data
      });
      throw error;
    }
  },

  signup: async (credentials) => {
    try {
      const response = await api.post('/auth/signup', credentials);
      return response.data;
    } catch (error) {
      console.error('Signup Error:', {
        message: error.message,
        response: error.response?.data
      });
      throw error;
    }
  },

  getUser: async () => {
    try {
      const response = await api.get('/auth/user');
      return response.data;
    } catch (error) {
      console.error('Get User Error:', {
        message: error.message,
        response: error.response?.data
      });
      throw error;
    }
  },
};

export const blogAPI = {
  getBlogs: async () => {
    try {
      const response = await api.get('/blogs');
      return response.data;
    } catch (error) {
      console.error('Get Blogs Error:', {
        message: error.message,
        response: error.response?.data
      });
      throw error;
    }
  },

  getBlog: async (id) => {
    try {
      const response = await api.get(`/blogs/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get Blog Error:', {
        id,
        message: error.message,
        response: error.response?.data
      });
      throw error;
    }
  },

  createBlog: async (blogData) => {
    try {
      const response = await api.post('/blogs', blogData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Create Blog Error:', {
        message: error.message,
        response: error.response?.data
      });
      throw error;
    }
  },

  updateBlog: async (id, blogData) => {
    try {
      const response = await api.put(`/blogs/${id}`, blogData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Update Blog Error:', {
        id,
        message: error.message,
        response: error.response?.data
      });
      throw error;
    }
  },

  deleteBlog: async (id) => {
    try {
      const response = await api.delete(`/blogs/${id}`);
      return response.data;
    } catch (error) {
      console.error('Delete Blog Error:', {
        id,
        message: error.message,
        response: error.response?.data
      });
      throw error;
    }
  },
}; 