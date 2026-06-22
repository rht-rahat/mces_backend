const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Mongoose User model
const { JWT_SECRET } = require('../middleware/auth-middleware');

// ১. রেজিস্টার রাউট
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword, role: 'user' });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// ২. লগইন রাউট (সংশোধিত এবং সুরক্ষিত)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid email or password' });

    // bcrypt দিয়ে হ্যাশ চেক
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid email or password' });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// ৩. অ্যাডমিন এক্সিস্টেন্স চেকার (এটি আপনার server.js এ কল হয়)
const ensureAdminExists = async () => {
  const adminEmail = 'admin@mces.com';
  const adminExists = await User.findOne({ email: adminEmail });
  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('admin', 10);
    const adminUser = new User({
      name: 'Admin',
      email: adminEmail,
      password: hashedPassword,
      role: 'admin'
    });
    await adminUser.save();
    console.log('Admin account created successfully.');
  }
};

// GET /me রাউট
router.get('/me', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    res.json(user);
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = { router, ensureAdminExists };