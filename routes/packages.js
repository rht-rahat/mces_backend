const express = require('express');
const router = express.Router();
const { auth, admin } = require('../middleware/auth');
const { uploadSingle, handleUpload } = require('../middleware/upload');
const Package = require('../models/Package'); // সরাসরি Mongoose Model ব্যবহার করা হচ্ছে

// GET /api/packages - Fetch all tour packages
router.get('/', async (req, res) => {
  try {
    // সরাসরি MongoDB Atlas থেকে সব প্যাকেজ লেটেস্ট অনুযায়ী সর্ট করে আনা হচ্ছে 🔍
    const list = await Package.find({}).sort({ createdAt: -1 });
    return res.json(list);
  } catch (error) {
    console.error('Fetch packages error:', error);
    return res.status(500).json({ error: 'সার্ভার এরর, প্যাকেজের তথ্য পাওয়া যায়নি।' });
  }
});

// GET /api/packages/:id - Fetch single tour package
router.get('/:id', async (req, res) => {
  try {
    // সরাসরি MongoDB Atlas থেকে আইডি ধরে খোঁজা হচ্ছে
    const item = await Package.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Tour package not found' });
    }
    return res.json(item);
  } catch (error) {
    console.error('Fetch package by ID error:', error);
    return res.status(500).json({ error: 'সার্ভার এরর, প্যাকেজটি পাওয়া যায়নি।' });
  }
});

// POST /api/packages - Create tour package (Admin Only)
router.post('/', auth, admin, uploadSingle, handleUpload, async (req, res) => {
  const { title, destination, duration, price, description, itinerary } = req.body;
  const imageUrl = req.fileUrl;

  if (!title || !destination || !duration || !price || !description || !imageUrl) {
    return res.status(400).json({ error: 'All fields including image are required' });
  }

  try {
    // Parse itinerary if it is stringified JSON array
    let itineraryArray = [];
    if (itinerary) {
      try {
        itineraryArray = typeof itinerary === 'string' ? JSON.parse(itinerary) : itinerary;
      } catch (e) {
        itineraryArray = itinerary.split('\n').filter(Boolean); // fallback to newlines
      }
    }

    // সরাসরি MongoDB Atlas-এ নতুন প্যাকেজ তৈরি করা হচ্ছে 🚀
    const packageItem = await Package.create({
      title,
      destination,
      duration,
      price: parseFloat(price),
      description,
      imageUrl,
      itinerary: itineraryArray
    });
    
    return res.status(201).json(packageItem);
  } catch (error) {
    console.error('Create package error:', error);
    return res.status(500).json({ error: 'সার্ভার এরর, প্যাকেজ তৈরি করা যায়নি।' });
  }
});

// PUT /api/packages/:id - Update tour package (Admin Only)
router.put('/:id', auth, admin, uploadSingle, handleUpload, async (req, res) => {
  const { title, destination, duration, price, description, itinerary } = req.body;
  const updateFields = {};

  if (title) updateFields.title = title;
  if (destination) updateFields.destination = destination;
  if (duration) updateFields.duration = duration;
  if (price !== undefined) updateFields.price = parseFloat(price);
  if (description) updateFields.description = description;
  if (req.fileUrl) updateFields.imageUrl = req.fileUrl;

  if (itinerary !== undefined) {
    try {
      updateFields.itinerary = typeof itinerary === 'string' ? JSON.parse(itinerary) : itinerary;
    } catch (e) {
      updateFields.itinerary = itinerary.split('\n').filter(Boolean);
    }
  }

  try {
    // সরাসরি MongoDB Atlas-এ আইডি ধরে আপডেট করা হচ্ছে 🛠️
    const updated = await Package.findByIdAndUpdate(
      req.params.id, 
      updateFields, 
      { new: true }
    );
    
    if (!updated) {
      return res.status(404).json({ error: 'Tour package not found' });
    }
    return res.json(updated);
  } catch (error) {
    console.error('Update package error:', error);
    return res.status(500).json({ error: 'সার্ভার এরর, আপডেট করা যায়নি।' });
  }
});

// DELETE /api/packages/:id - Delete tour package (Admin Only)
router.delete('/:id', auth, admin, async (req, res) => {
  try {
    // সরাসরি MongoDB Atlas থেকে আইডি ধরে ডিলিট করা হচ্ছে 🗑️
    const deleted = await Package.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Tour package not found' });
    }
    return res.json({ message: 'Tour package deleted successfully' });
  } catch (error) {
    console.error('Delete package error:', error);
    return res.status(500).json({ error: 'সার্ভার এরর, ডিলিট করা যায়নি।' });
  }
});

module.exports = router;