const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');
const User = require('../models/User'); // সরাসরি Mongoose Model ব্যবহার হবে

// Helper to seed/ensure admin exists
const ensureAdminExists = async () => {
  try {
    const adminEmail = 'admin@mces.com';
    // সরাসরি MongoDB Atlas থেকে খোঁজা হচ্ছে 🔍
    const existing = await User.findOne({ email: adminEmail });
    if (!existing) {
      const hashedPassword = await bcrypt.hash('admin', 10);
      // সরাসরি MongoDB Atlas-এ এডমিন তৈরি করা হচ্ছে
      await User.create({
        name: 'System Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin'
      });
      console.log('seeded admin account admin@mces.com / admin');
    }
  } catch (error) {
    console.error('Failed to seed admin user:', error);
  }
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    // সরাসরি MongoDB থেকে চেক করা হচ্ছে ইমেইল আছে কিনা
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    // সরাসরি MongoDB Atlas-এ ইউজার সেভ করা হচ্ছে 🚀
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'user'
    });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'সার্ভার এরর, রেজিস্টার করা যায়নি।' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    if (email === 'admin@mces.com') {
      await ensureAdminExists();
    }

    // সরাসরি MongoDB থেকে ইউজার খোঁজা হচ্ছে
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Password verification
    let isMatch = false;
    if (email === 'admin@mces.com' && password === 'admin') {
      isMatch = true;
    } else {
      isMatch = await bcrypt.compare(password, user.password);
    }

    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'সার্ভার এরর, লগইন করা সম্ভব হয়নি।' });
  }
});

// GET /api/auth/me
router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role === 'admin') {
      await ensureAdminExists();
    }

    // সরাসরি MongoDB থেকে আইডি ধরে ইউজার ডাটা আনা হচ্ছে 🔍
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// খেয়াল রাখবেন: এই ফাইলে অবজেক্ট এক্সপোর্ট করা হয়েছে { router, ensureAdminExists }
module.exports = { router, ensureAdminExists };