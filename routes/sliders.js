const express = require('express');
const router = express.Router();
const { auth, admin } = require('../middleware/auth');
const { uploadSingle, handleUpload } = require('../middleware/upload');
const Slider = require('../models/Slider'); // সরাসরি Mongoose Model ব্যবহার হবে

// GET /api/sliders - Fetch all slider banners
router.get('/', async (req, res) => {
  try {
    // সরাসরি MongoDB Atlas থেকে সব স্লাইডার 'order' অনুযায়ী সর্ট করে আনা হচ্ছে 🔍
    const list = await Slider.find({}).sort({ order: 1 });
    res.json(list);
  } catch (error) {
    console.error('Fetch sliders error:', error);
    res.status(500).json({ error: 'সার্ভার এরর, স্লাইডার পাওয়া যায়নি।' });
  }
});

// POST /api/sliders - Create slider banner (Admin Only)
router.post('/', auth, admin, uploadSingle, handleUpload, async (req, res) => {
  const { title, subtitle, actionUrl, order } = req.body;
  const imageUrl = req.fileUrl; // From handleUpload middleware

  if (!title || !subtitle || !imageUrl) {
    return res.status(400).json({ error: 'Title, subtitle, and image are required' });
  }

  try {
    // সরাসরি MongoDB Atlas-এ নতুন স্লাইডার তৈরি করা হচ্ছে 🚀
    const slider = await Slider.create({
      title,
      subtitle,
      imageUrl,
      actionUrl: actionUrl || '/',
      order: order ? parseInt(order, 10) : 0
    });
    res.status(201).json(slider);
  } catch (error) {
    console.error('Create slider error:', error);
    res.status(500).json({ error: 'সার্ভার এরর, স্লাইডার তৈরি করা যায়নি।' });
  }
});

// PUT /api/sliders/:id - Update slider banner (Admin Only)
router.put('/:id', auth, admin, uploadSingle, handleUpload, async (req, res) => {
  const { title, subtitle, actionUrl, order } = req.body;
  const updateFields = {};

  if (title) updateFields.title = title;
  if (subtitle) updateFields.subtitle = subtitle;
  if (actionUrl) updateFields.actionUrl = actionUrl;
  if (order !== undefined) updateFields.order = parseInt(order, 10);
  if (req.fileUrl) updateFields.imageUrl = req.fileUrl;

  try {
    // সরাসরি MongoDB Atlas থেকে আইডি ধরে আপডেট করা হচ্ছে 🛠️
    const updated = await Slider.findByIdAndUpdate(
      req.params.id, 
      updateFields, 
      { new: true } // এটি আপডেট হওয়া নতুন ডেটাটি রিটার্ন করবে
    );
    
    if (!updated) {
      return res.status(404).json({ error: 'Slider banner not found' });
    }
    res.json(updated);
  } catch (error) {
    console.error('Update slider error:', error);
    res.status(500).json({ error: 'সার্ভার এরর, আপডেট করা যায়নি।' });
  }
});

// DELETE /api/sliders/:id - Delete slider banner (Admin Only)
router.delete('/:id', auth, admin, async (req, res) => {
  try {
    // সরাসরি MongoDB Atlas থেকে আইডি ধরে ডিলিট করা হচ্ছে 🗑️
    const deleted = await Slider.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Slider banner not found' });
    }
    res.json({ message: 'Slider banner deleted successfully' });
  } catch (error) {
    console.error('Delete slider error:', error);
    res.status(500).json({ error: 'সার্ভার এরর, ডিলিট করা যায়নি।' });
  }
});

module.exports = router;