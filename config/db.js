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

// Vercel-এ ফাইল রাইটিং এরর আটকাতে এবং কোড ব্রেক না করতে মক ফাংশন
const getDB = () => {
  // মঙ্গোডিবি কাজ না করলে ক্র্যাশ এড়াতে জাস্ট একটি ফাঁকা স্ট্রাকচার রিটার্ন করবে
  return {
    users: [],
    passports: [],
    packages: [],
    circulars: [],
    sliders: [],
    reviews: [],
    blogs: [],
    notifications: [],
    messages: []
  };
};

const saveDB = (data) => {
  // Vercel-এ ফাইল রাইট করা যাবে না, তাই ফাংশনটি ফাঁকা থাকবে
};

module.exports = {
  connectDB,
  isConnected: () => isConnected,
  getDB,
  saveDB
};