const express = require('express');
const router = express.Router();
const { auth, admin } = require('../middleware/auth');
const Message = require('../models/Message');
const { sendNotificationToAdmins } = require('./notifications');

// POST /api/messages - Send message
router.post('/', async (req, res) => {
  try {
    const { userId, senderName, message, sender } = req.body;
    const msgObj = await Message.create({ userId, senderName, message, sender });
    
    if (typeof sendNotificationToAdmins === 'function') {
      sendNotificationToAdmins({ type: 'chat_message', chat: msgObj });
    }
    return res.status(201).json(msgObj);
  } catch (error) {
    console.error('Send message error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/messages/history/:userId
router.get('/history/:userId', async (req, res) => {
  try {
    const list = await Message.find({ userId: req.params.userId }).sort({ createdAt: 1 });
    return res.json(list);
  } catch (error) {
    console.error('Fetch chat history error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/messages/threads
router.get('/threads', auth, admin, async (req, res) => {
  try {
    const list = await Message.find({}).sort({ createdAt: -1 });
    const threadsMap = {};
    list.forEach(msg => {
      if (!threadsMap[msg.userId]) {
        threadsMap[msg.userId] = { userId: msg.userId, senderName: msg.senderName, lastMessage: msg.message, updatedAt: msg.createdAt };
      }
    });
    return res.json(Object.values(threadsMap));
  } catch (error) {
    console.error('Fetch threads error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;