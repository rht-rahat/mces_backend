const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');
const User = require('../models/User');

// Helper to seed/ensure admin exists
const ensureAdminExists = async () => {
  try {
    const adminEmail = 'admin@mces.com';
    // সরাসরি MongoDB Atlas থেকে খোঁজা হচ্ছে
    const existing = await User.findOne({ email: adminEmail });
    if (!existing) {
      const hashedPassword = await bcrypt.hash('admin', 10);
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
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ error: 'সার্ভার এরর, রেজিস্টার করা যায়নি।' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    // ১. এডমিন লগইনের জন্য সরাসরি হার্ডকোডেড চেক (Bcrypt ক্র্যাশ এড়াতে)
    if (email === 'admin@mces.com' && password === 'admin') {
      let adminUser = await User.findOne({ email: 'admin@mces.com' });
      
      // যদি কোনো কারণে ডাটাবেসে এডমিন না থাকে, তবে তৈরি করে নেওয়া হবে
      if (!adminUser) {
        await ensureAdminExists();
        adminUser = await User.findOne({ email: 'admin@mces.com' });
      }
      
      if (adminUser) {
        const token = jwt.sign({ id: adminUser._id, role: adminUser.role }, JWT_SECRET, { expiresIn: '7d' });
        return res.json({
          token,
          user: {
            id: adminUser._id,
            name: adminUser.name,
            email: adminUser.email,
            role: adminUser.role
          }
        });
      }
    }

    // ২. সাধারণ ইউজারদের জন্য রেগুলার লগইন প্রসেস
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // পাসওয়ার্ড ভেরিফিকেশন
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({
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
    return res.status(500).json({ error: 'সার্ভার এরর, লগইন করা সম্ভব হয়নি।' });
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

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = { router, ensureAdminExists };