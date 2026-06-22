const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const Appointment = require('../models/Appointment');
const { sendNotificationToAdmins } = require('./notifications');

router.post('/', async (req, res) => {
  const { name, email, phone, message, type, serviceName, date } = req.body;
  try {
    const newAppointment = await Appointment.create({ name, email, phone, message, serviceName, date, status: 'pending' });
    
    // Create and save real notification in MongoDB database
    const notification = await Notification.create({
      type: 'appointment',
      title: 'New Appointment Booked',
      message: `${name} has requested an appointment for ${serviceName || 'general consulting'} on ${date || 'unscheduled date'}`
    });

    sendNotificationToAdmins(notification);
    res.status(201).json(newAppointment);
  } catch (error) {
    console.error('Contact reservation error:', error);
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