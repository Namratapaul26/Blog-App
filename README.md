# MERN Stack Blog Application

A full-featured blogging platform built with the MERN (MongoDB, Express.js, React.js, Node.js) stack. The application features a modern, responsive UI and supports image uploads using Cloudinary for cloud storage.

## Features

- 🔐 User authentication (signup/login)
- 📝 Create, read, update, and delete blog posts
- 🖼️ Image upload support (cover image + content images)
- ☁️ Cloudinary integration for image storage
- 🎨 Rich text editor for blog content
- 📱 Responsive design
- ⚡ Fast loading times
- 🔒 Secure API endpoints
- 🌐 Deployed on Vercel (frontend) and Render (backend)

## Tech Stack

### Frontend
- React.js
- TypeScript
- React Router
- Axios for API calls
- Tailwind CSS for styling

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Cloudinary for image storage
- Multer for file uploads

## Prerequisites

Before running this project, make sure you have:

1. Node.js (v14 or higher)
2. MongoDB installed locally or a MongoDB Atlas account
3. Cloudinary account
4. Git

## Environment Variables

### Backend (.env)
```
NODE_ENV=development
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000
```

## Installation and Setup

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd blog-application
   ```

2. Install backend dependencies
   ```bash
   cd backend
   npm install
   ```

3. Install frontend dependencies
   ```bash
   cd ../frontend
   npm install
   ```

4. Set up Cloudinary:
   - Create a Cloudinary account at https://cloudinary.com
   - Get your cloud name, API key, and API secret from your dashboard
   - Add these credentials to your backend .env file

5. Start the backend server (development mode)
   ```bash
   cd backend
   npm run dev
   ```

6. Start the frontend development server
   ```bash
   cd frontend
   npm start
   ```

The application should now be running at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy using Vercel's automatic deployment

### Backend (Render)
1. Create a new Web Service in Render
2. Connect your GitHub repository
3. Configure environment variables in Render dashboard:
   - Add all your Cloudinary credentials
   - Add MongoDB URI and JWT secret
   - Set the FRONTEND_URL to your Vercel deployment URL
4. Deploy using automatic deployment

## API Documentation

### Authentication Endpoints
- POST `/api/auth/signup` - Register new user
- POST `/api/auth/login` - Login user

### Blog Endpoints
- GET `/api/blogs` - Get all blogs
- GET `/api/blogs/:id` - Get single blog
- POST `/api/blogs` - Create new blog
- PUT `/api/blogs/:id` - Update blog
- DELETE `/api/blogs/:id` - Delete blog

### Image Upload Endpoints
- POST `/api/upload` - Upload images to Cloudinary

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Thanks to all contributors who have helped with code and bug fixes
- Special thanks to the MERN stack community for their excellent documentation
- Thanks to Cloudinary for providing image hosting services 