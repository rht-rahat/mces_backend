const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const Appointment = require('../models/Appointment');
const { sendNotificationToAdmins } = require('./notifications');

router.post('/', async (req, res) => {
  const { name, email, phone, message, type, serviceName, date } = req.body;
  try {
    const newAppointment = await Appointment.create({ name, email, phone, message, serviceName, date, status: 'pending' });
    sendNotificationToAdmins({ type: 'appointment', title: 'New Appointment', message: `Request from ${name}` });
    res.status(201).json(newAppointment);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id/status', async (req, res) => {
  try {
    const updated = await Appointment.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;