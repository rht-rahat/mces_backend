const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI not defined in environment variables.');
    }
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000
    });
    isConnected = true;
    console.log('MongoDB Connected successfully!');
  } catch (err) {
    isConnected = false;
    console.log('⚠️ MongoDB Connection Failed or URI not provided.');
  }
};

// Vercel-এ ক্র্যাশ এড়াতে local JSON DB ফাংশনগুলো মক (Mock) করে দেওয়া হলো
const getDB = () => {
  return {
    users: [], passports: [], packages: [], circulars: [],
    sliders: [], reviews: [], blogs: [], notifications: [], messages: []
  };
};

const saveDB = (data) => {
  // Vercel-এ ফাইল সেভ করা বন্ধ রাখা হলো
};

module.exports = {
  connectDB,
  isConnected: () => isConnected,
  getDB,
  saveDB
};