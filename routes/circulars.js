const express = require('express');
const router = express.Router();
const { auth, admin } = require('../middleware/auth');
const { uploadSingle, handleUpload } = require('../middleware/upload');
const Circular = require('../models/Circular'); // সরাসরি Mongoose Model ব্যবহার

// GET /api/circulars - Fetch all circulars with dynamic filter support
router.get('/', async (req, res) => {
  const { country, jobCategory } = req.query;
  const filter = {};

  if (country) filter.country = country;
  if (jobCategory) filter.jobCategory = jobCategory;

  try {
    // সরাসরি MongoDB Atlas থেকে ফিল্টার অনুযায়ী ডেটা আনা হচ্ছে 🔍
    const list = await Circular.find(filter).sort({ createdAt: -1 });
    return res.json(list);
  } catch (error) {
    console.error('Fetch circulars error:', error);
    return res.status(500).json({ error: 'সার্ভার এরর, নিয়োগ বিজ্ঞপ্তি পাওয়া যায়নি।' });
  }
});

// GET /api/circulars/:id - Fetch single circular
router.get('/:id', async (req, res) => {
  try {
    // সরাসরি MongoDB Atlas থেকে আইডি ধরে খোঁজা হচ্ছে
    const item = await Circular.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Circular not found' });
    }
    return res.json(item);
  } catch (error) {
    console.error('Fetch circular by ID error:', error);
    return res.status(500).json({ error: 'সার্ভার এরর, বিজ্ঞপ্তিটি পাওয়া যায়নি।' });
  }
});

// POST /api/circulars - Create circular (Admin Only)
router.post('/', auth, admin, uploadSingle, handleUpload, async (req, res) => {
  const { title, country, jobCategory, salaryRange, requirements } = req.body;
  const imageUrl = req.fileUrl;

  if (!title || !country || !jobCategory || !salaryRange || !imageUrl) {
    return res.status(400).json({ error: 'All fields including image are required' });
  }

  try {
    // Requirements পার্সিং
    let reqArray = [];
    if (requirements) {
      try {
        reqArray = typeof requirements === 'string' ? JSON.parse(requirements) : requirements;
      } catch (e) {
        reqArray = requirements.split('\n').filter(Boolean);
      }
    }

    // সরাসরি MongoDB Atlas-এ নতুন বিজ্ঞপ্তি তৈরি 🚀
    const circular = await Circular.create({
      title,
      country,
      jobCategory,
      salaryRange,
      imageUrl,
      requirements: reqArray
    });
    
    return res.status(201).json(circular);
  } catch (error) {
    console.error('Create circular error:', error);
    return res.status(500).json({ error: 'সার্ভার এরর, বিজ্ঞপ্তি তৈরি করা যায়নি।' });
  }
});

// PUT /api/circulars/:id - Update circular (Admin Only)
router.put('/:id', auth, admin, uploadSingle, handleUpload, async (req, res) => {
  const { title, country, jobCategory, salaryRange, requirements } = req.body;
  const updateFields = {};

  if (title) updateFields.title = title;
  if (country) updateFields.country = country;
  if (jobCategory) updateFields.jobCategory = jobCategory;
  if (salaryRange) updateFields.salaryRange = salaryRange;
  if (req.fileUrl) updateFields.imageUrl = req.fileUrl;

  if (requirements !== undefined) {
    try {
      updateFields.requirements = typeof requirements === 'string' ? JSON.parse(requirements) : requirements;
    } catch (e) {
      updateFields.requirements = requirements.split('\n').filter(Boolean);
    }
  }

  try {
    // সরাসরি MongoDB Atlas-এ আইডি ধরে আপডেট 🛠️
    const updated = await Circular.findByIdAndUpdate(
      req.params.id, 
      updateFields, 
      { new: true }
    );
    
    if (!updated) {
      return res.status(404).json({ error: 'Circular not found' });
    }
    return res.json(updated);
  } catch (error) {
    console.error('Update circular error:', error);
    return res.status(500).json({ error: 'সার্ভার এরর, আপডেট করা যায়নি।' });
  }
});

// DELETE /api/circulars/:id - Delete circular (Admin Only)
router.delete('/:id', auth, admin, async (req, res) => {
  try {
    // সরাসরি MongoDB Atlas থেকে ডিলিট 🗑️
    const deleted = await Circular.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Circular not found' });
    }
    return res.json({ message: 'Circular deleted successfully' });
  } catch (error) {
    console.error('Delete circular error:', error);
    return res.status(500).json({ error: 'সার্ভার এরর, ডিলিট করা যায়নি।' });
  }
});

module.exports = router;