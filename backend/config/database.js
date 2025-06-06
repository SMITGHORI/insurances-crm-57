
const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    // Default MongoDB URI for demo purposes
    const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://demo:demo123@cluster0.mongodb.net/insurance_db?retryWrites=true&w=majority';
    
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);
    
    // Set up connection event listeners
    mongoose.connection.on('connected', () => {
      console.log('Mongoose connected to MongoDB');
    });

    mongoose.connection.on('error', (err) => {
      console.error('Mongoose connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('Mongoose disconnected from MongoDB');
    });

    // Handle application termination
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    console.log('Falling back to local MongoDB...');
    
    // Fallback to local MongoDB
    try {
      const localConn = await mongoose.connect('mongodb://localhost:27017/insurance_db', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log(`Local MongoDB Connected: ${localConn.connection.host}`);
    } catch (localError) {
      console.error('Failed to connect to local MongoDB as well:', localError);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
