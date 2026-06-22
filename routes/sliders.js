const express = require('express');
const router = express.Router();
const Slider = require('../models/Slider'); // মঙ্গোডিবি স্লাইডার মডেল

// Get all sliders from MongoDB
router.get('/', async (req, res) => {
  try {
    // সরাসরি MongoDB Atlas থেকে স্লাইডার ডেটা তুলে আনা হচ্ছে
    const sliders = await Slider.find({}).sort({ order: 1 });
    res.json(sliders);
  } catch (err) {
    console.error("Error fetching sliders:", err);
    res.status(500).json({ message: "সার্ভার এরর, স্লাইডার পাওয়া যায়নি।" });
  }
});

module.exports = router;