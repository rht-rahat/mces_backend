const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

let isConnected = false;
const dbFilePath = path.join(__dirname, '../db.json');

// Initialize local JSON DB if it doesn't exist
if (!fs.existsSync(dbFilePath)) {
  fs.writeFileSync(dbFilePath, JSON.stringify({
    users: [],
    passports: [],
    packages: [],
    circulars: [],
    sliders: [],
    reviews: [],
    blogs: [],
    notifications: [],
    messages: []
  }, null, 2));
}

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
    console.log('🔄 Running in LOCAL JSON DATABASE FALLBACK mode!');
  }
};

const getDB = () => {
  try {
    const data = fs.readFileSync(dbFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading local DB file, resetting...', error);
    const initialData = {
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
    fs.writeFileSync(dbFilePath, JSON.stringify(initialData, null, 2));
    return initialData;
  }
};

const saveDB = (data) => {
  fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2));
};

module.exports = {
  connectDB,
  isConnected: () => isConnected,
  getDB,
  saveDB
};
