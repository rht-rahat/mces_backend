const express = require('express');
const router = express.Router();
const { auth, admin } = require('../middleware/auth');
const Notification = require('../models/Notification');

let adminClients = [];

const sendNotificationToAdmins = (notification) => {
  const payload = JSON.stringify(notification);
  adminClients.forEach(client => client.res.write(`data: ${payload}\n\n`));
};

router.get('/stream', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' });
  const clientId = Date.now();
  adminClients.push({ id: clientId, res });
  req.on('close', () => adminClients = adminClients.filter(c => c.id !== clientId));
});

router.get('/', auth, admin, async (req, res) => {
  try {
    const list = await Notification.find({}).sort({ createdAt: -1 });
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/:id/read', auth, admin, async (req, res) => {
  try {
    const updated = await Notification.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/clear', auth, admin, async (req, res) => {
  try {
    await Notification.deleteMany({});
    res.json({ message: 'All notifications cleared' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = { router, sendNotificationToAdmins };