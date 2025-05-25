require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('MongoDB Atlas Connection Successful!');
    console.log(`Connected to database: ${conn.connection.name}`);
    console.log(`Host: ${conn.connection.host}`);
    
    // Close the connection
    await mongoose.connection.close();
    console.log('Connection closed successfully');
    
  } catch (error) {
    console.error('MongoDB Atlas Connection Error:', error.message);
    if (error.message.includes('ENOTFOUND')) {
      console.error('Could not reach MongoDB Atlas. Check your internet connection or MongoDB Atlas status.');
    } else if (error.message.includes('Authentication failed')) {
      console.error('Authentication failed. Check your username and password in the connection string.');
    } else if (error.message.includes('timed out')) {
      console.error('Connection timed out. Check your network or whitelist your IP address.');
    }
    process.exit(1);
  }
};

console.log('Testing MongoDB Atlas connection...');
connectDB(); 