const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Corrected import path
const authMiddleware = require('../middleware/auth');
const JWT_SECRET = authMiddleware.JWT_SECRET;

// Login Route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid email or password' });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    return res.status(500).json({ error: 'Login failed' });
  }
});

// Auto-Admin Creator
const ensureAdminExists = async () => {
  try {
    const adminExists = await User.findOne({ email: 'admin@mces.com' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin', 10);
      await User.create({ name: 'Admin', email: 'admin@mces.com', password: hashedPassword, role: 'admin' });
      console.log('Admin account created successfully.');
    }
  } catch (error) {
    console.error('Error creating admin:', error);
  }
};

module.exports = { router, ensureAdminExists };