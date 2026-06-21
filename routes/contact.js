const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const Appointment = require('../models/Appointment'); // 👈 সরাসরি Appointment মডেল ইমপোর্ট করা হলো
const { sendNotificationToAdmins } = require('./notifications');

// ১. POST /api/contact - সরাসরি MongoDB-তে ডেটা সেভ করা (Appointment ও Contact Form আলাদা করে)
router.post('/', async (req, res) => {
  const { name, email, phone, message, type, serviceName, date } = req.body;

  if (!name || !message) {
    return res.status(400).json({ error: 'Name and message are required' });
  }

  try {
    const isAppointment = type === 'appointment';

    if (isAppointment) {
      // 🚀 অ্যাপয়েন্টমেন্ট হলে সরাসরি Appointment কালেকশনে সেভ হবে
      const newAppointment = new Appointment({
        name,
        phone: phone || 'N/A',
        email: email || 'N/A',
        serviceName: serviceName || 'General Consultation',
        date: date || 'Not Set',
        message: message,
        status: 'pending'
      });

      const savedAppointment = await newAppointment.save();

      // রিয়েল-টাইম নোটিফিকেশন পুশ (SSE) এর জন্য অবজেক্ট পাঠানো
      sendNotificationToAdmins({
        _id: savedAppointment._id,
        type: 'appointment',
        title: 'New Appointment Request',
        message: `Appointment requested by ${name} (${phone || 'No phone'}) for service: ${serviceName || 'General Consultation'}`,
        status: 'pending'
      });

      return res.json({
        message: 'Appointment request submitted successfully. We will contact you soon.'
      });

    } else {
      // ✉️ সাধারণ কন্টাক্ট ফর্ম হলে Notification কালেকশনে সেভ হবে
      const newNotification = new Notification({
        type: 'contact_form',
        title: 'New Contact Submission',
        message: `${name} (${email}) sent a message: "${message}"`,
        status: 'read',
        metadata: {
          name,
          email: email || 'N/A',
          phone: phone || 'N/A',
          userMessage: message
        }
      });

      const savedNotification = await newNotification.save();
      sendNotificationToAdmins(savedNotification);

      return res.json({
        message: 'Message sent successfully. Thank you for contacting us.'
      });
    }

  } catch (error) {
    console.error('Contact submission error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});


// ২. GET /api/contact - অ্যাপয়েন্টমেন্ট টেবিল বা নোটিফিকেশনের ডেটা মঙ্গোডিবি থেকে আনা
router.get('/', async (req, res) => {
  try {
    const { type } = req.query;

    // যদি টাইপ 'appointment' হয়, তবে সরাসরি Appointment কালেকশন থেকে ডেটা আসবে
    if (type === 'appointment') {
      const appointments = await Appointment.find().sort({ createdAt: -1 }).lean();
      return res.json(appointments);
    } 
    
    // অন্যথায় নোটিফিকেশন কালেকশন থেকে ডেটা ফিল্টার হবে
    let query = {};
    if (type) query.type = type;

    const notifications = await Notification.find(query).sort({ createdAt: -1 }).lean();
    
    // আগের ফলব্যাক মেকানিজম ঠিক রাখা হলো যদি নোটিফিকেশন টেবিল থেকে ডেটা পড়তে হয়
    const formattedNotifications = notifications.map(notif => {
      let parsedName = notif.metadata?.name;
      let parsedPhone = notif.metadata?.phone;
      let parsedService = notif.metadata?.serviceName;
      let parsedDate = notif.metadata?.date;

      if (!parsedName && notif.message) {
        try {
          const matchName = notif.message.match(/requested by (.*?) \(/);
          const matchPhone = notif.message.match(/\((.*?)\) for service/);
          const matchService = notif.message.match(/for service: (.*?) on Date/);
          const matchDate = notif.message.match(/on Date: (.*?)(\. Info|$)/);

          if (matchName) parsedName = matchName[1];
          if (matchPhone) parsedPhone = matchPhone[1];
          if (matchService) parsedService = matchService[1];
          if (matchDate) parsedDate = matchDate[1];
        } catch (e) {
          console.log("Text parsing failed, using defaults");
        }
      }

      return {
        _id: notif._id,
        name: parsedName || notif.title || 'Unknown Customer',
        phone: parsedPhone || 'N/A',
        email: notif.metadata?.email || 'N/A',
        serviceName: parsedService || 'General Consultation',
        date: parsedDate || 'Not Set',
        message: notif.metadata?.userMessage || notif.message,
        status: notif.status || 'pending'
      };
    });

    res.json(formattedNotifications);
  } catch (error) {
    console.error('Fetch data error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});


// ৩. PUT /api/contact/:id/status - অ্যাপয়েন্টমেন্টের স্ট্যাটাস পরিবর্তন করার জন্য (MongoDB Direct Fix)
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'accepted' অথবা 'rejected'

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    // প্রথমে Appointment কালেকশনে আপডেট করার চেষ্টা করবে
    let updatedData = await Appointment.findByIdAndUpdate(
      id,
      { $set: { status: status } },
      { new: true }
    );

    // যদি Appointment কালেকশনে না পায়, তবে ওল্ড ডাটাবেজ স্ট্রাকচার (Notification) এ আপডেট করবে
    if (!updatedData) {
      updatedData = await Notification.findByIdAndUpdate(
        id,
        { $set: { status: status } },
        { new: true, strict: false }
      );
    }

    if (!updatedData) {
      return res.status(404).json({ error: 'Appointment or Notification not found' });
    }

    res.json({ 
      message: `অ্যাপয়েন্টমেন্ট সফলভাবে ${status === 'accepted' ? 'গৃহীত' : 'প্রত্যাখ্যাত'} হয়েছে।`,
      data: updatedData 
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;