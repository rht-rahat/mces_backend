const express = require('express');
const router = express.Router();
const { auth, admin } = require('../middleware/auth');
const { uploadSingle, handleUpload } = require('../middleware/upload');
const Blog = require('../models/Blog'); // সরাসরি Mongoose মডেল

// GET /api/blogs - Fetch all blogs
router.get('/', async (req, res) => {
  try {
    // সরাসরি MongoDB Atlas থেকে লেটেস্ট ব্লগগুলো আনা হচ্ছে 🔍
    const list = await Blog.find({}).sort({ createdAt: -1 });
    return res.json(list);
  } catch (error) {
    console.error('Fetch blogs error:', error);
    return res.status(500).json({ error: 'সার্ভার এরর, ব্লগ পোস্টগুলো পাওয়া যায়নি।' });
  }
});

// GET /api/blogs/:id - Fetch single blog details
router.get('/:id', async (req, res) => {
  try {
    // সরাসরি MongoDB Atlas থেকে আইডি ধরে ব্লগ খোঁজা হচ্ছে
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ error: 'Blog post not found' });
    }
    return res.json(blog);
  } catch (error) {
    console.error('Fetch blog by ID error:', error);
    return res.status(500).json({ error: 'সার্ভার এরর, ব্লগটি পাওয়া যায়নি।' });
  }
});

// POST /api/blogs - Create blog post (Admin Only)
router.post('/', auth, admin, uploadSingle, handleUpload, async (req, res) => {
  const { title, content, author } = req.body;
  const imageUrl = req.fileUrl;

  if (!title || !content || !imageUrl) {
    return res.status(400).json({ error: 'Title, content, and image are required' });
  }

  try {
    // সরাসরি MongoDB Atlas-এ নতুন ব্লগ তৈরি 🚀
    const blog = await Blog.create({
      title,
      content,
      imageUrl,
      author: author || 'Admin'
    });
    return res.status(201).json(blog);
  } catch (error) {
    console.error('Create blog error:', error);
    return res.status(500).json({ error: 'সার্ভার এরর, ব্লগ তৈরি করা যায়নি।' });
  }
});

// PUT /api/blogs/:id - Update blog post (Admin Only)
router.put('/:id', auth, admin, uploadSingle, handleUpload, async (req, res) => {
  const { title, content, author } = req.body;
  const updateFields = {};

  if (title) updateFields.title = title;
  if (content) updateFields.content = content;
  if (author) updateFields.author = author;
  if (req.fileUrl) updateFields.imageUrl = req.fileUrl;

  try {
    // সরাসরি MongoDB Atlas-এ আইডি ধরে আপডেট 🛠️
    const updated = await Blog.findByIdAndUpdate(
      req.params.id, 
      updateFields, 
      { new: true }
    );
    
    if (!updated) {
      return res.status(404).json({ error: 'Blog post not found' });
    }
    return res.json(updated);
  } catch (error) {
    console.error('Update blog error:', error);
    return res.status(500).json({ error: 'সার্ভার এরর, আপডেট করা যায়নি।' });
  }
});

// DELETE /api/blogs/:id - Delete blog post (Admin Only)
router.delete('/:id', auth, admin, async (req, res) => {
  try {
    // সরাসরি MongoDB Atlas থেকে আইডি ধরে ডিলিট 🗑️
    const deleted = await Blog.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Blog post not found' });
    }
    return res.json({ message: 'Blog post deleted successfully' });
  } catch (error) {
    console.error('Delete blog error:', error);
    return res.status(500).json({ error: 'সার্ভার এরর, ডিলিট করা যায়নি।' });
  }
});

module.exports = router;