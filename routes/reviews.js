const express = require('express');
const router = express.Router();
const { auth, admin } = require('../middleware/auth');
const { uploadSingle, handleUpload } = require('../middleware/upload');
const Review = require('../models/Review'); // সরাসরি Mongoose Model ব্যবহার হবে

// GET /api/reviews - Fetch all client reviews
router.get('/', async (req, res) => {
  try {
    // সরাসরি MongoDB Atlas থেকে সব রিভিউ লেটেস্ট অনুযায়ী সর্ট করে আনা হচ্ছে 🔍
    const list = await Review.find({}).sort({ createdAt: -1 });
    res.json(list);
  } catch (error) {
    console.error('Fetch reviews error:', error);
    res.status(500).json({ error: 'সার্ভার এরর, রিভিউ পাওয়া যায়নি।' });
  }
});

// POST /api/reviews - Add a client review (Admin Only)
router.post('/', auth, admin, uploadSingle, handleUpload, async (req, res) => {
  const { clientName, clientRole, reviewText, rating } = req.body;
  const imageUrl = req.fileUrl;

  if (!clientName || !clientRole || !reviewText || !imageUrl) {
    return res.status(400).json({ error: 'All fields including client image are required' });
  }

  try {
    // সরাসরি MongoDB Atlas-এ নতুন রিভিউ তৈরি করা হচ্ছে 🚀
    const review = await Review.create({
      clientName,
      clientRole,
      reviewText,
      rating: rating ? parseInt(rating, 10) : 5,
      imageUrl
    });
    res.status(201).json(review);
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ error: 'সার্ভার এরর, রিভিউ তৈরি করা যায়নি।' });
  }
});

// PUT /api/reviews/:id - Update review (Admin Only)
router.put('/:id', auth, admin, uploadSingle, handleUpload, async (req, res) => {
  const { clientName, clientRole, reviewText, rating } = req.body;
  const updateFields = {};

  if (clientName) updateFields.clientName = clientName;
  if (clientRole) updateFields.clientRole = clientRole;
  if (reviewText) updateFields.reviewText = reviewText;
  if (rating !== undefined) updateFields.rating = parseInt(rating, 10);
  if (req.fileUrl) updateFields.imageUrl = req.fileUrl;

  try {
    // সরাসরি MongoDB Atlas থেকে আইডি ধরে আপডেট করা হচ্ছে 🛠️
    const updated = await Review.findByIdAndUpdate(
      req.params.id, 
      updateFields, 
      { new: true } // এটি আপডেট হওয়া নতুন ডেটাটি রিটার্ন করবে
    );
    
    if (!updated) {
      return res.status(404).json({ error: 'Review not found' });
    }
    res.json(updated);
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ error: 'সার্ভার এরর, আপডেট করা যায়নি।' });
  }
});

// DELETE /api/reviews/:id - Delete review (Admin Only)
router.delete('/:id', auth, admin, async (req, res) => {
  try {
    // সরাসরি MongoDB Atlas থেকে আইডি ধরে ডিলিট করা হচ্ছে 🗑️
    const deleted = await Review.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Review not found' });
    }
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ error: 'সার্ভার এরর, ডিলিট করা যায়নি।' });
  }
});

module.exports = router;