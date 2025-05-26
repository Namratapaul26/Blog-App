const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const createUploadsDirectory = () => {
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  return uploadsDir;
};

// Ensure uploads directory exists
createUploadsDirectory();

module.exports = {
  uploadsPath: path.join(__dirname, '..', 'uploads'),
  createUploadsDirectory
}; 