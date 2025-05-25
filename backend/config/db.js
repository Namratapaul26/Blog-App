const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Atlas Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`Error connecting to MongoDB Atlas: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB; 