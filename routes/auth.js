const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // আপনার মঙ্গুজ মডেল

// মিডেলওয়্যার থেকে JWT_SECRET ইম্পোর্ট
const authMiddleware = require('../middleware/auth-middleware');
const JWT_SECRET = authMiddleware.JWT_SECRET;

// ১. রেজিস্টার রাউট (নতুন ইউজার তৈরির জন্য)
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'user'
    });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    
    return res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ error: 'রেজিস্ট্রেশন ব্যর্থ হয়েছে।' });
  }
});

// ২. লগইন রাউট (সব ইউজারের জন্য কমন এবং সিকিউর)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'লগইন ব্যর্থ হয়েছে।' });
  }
});

// ৩. অটো-অ্যাডমিন তৈরির ফাংশন (সার্ভার স্টার্ট হলে এটি কল হয়)
const ensureAdminExists = async () => {
  try {
    const adminEmail = 'admin@mces.com';
    const adminExists = await User.findOne({ email: adminEmail });
    
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin', 10); // পাসওয়ার্ড 'admin'
      await User.create({
        name: 'Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin'
      });
      console.log('Admin account created successfully.');
    }
  } catch (error) {
    console.error('Error in ensureAdminExists:', error);
  }
};

// ৪. বর্তমান ইউজারের তথ্য পাওয়ার রাউট
router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json(user);
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = { router, ensureAdminExists };