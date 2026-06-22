const express = require('express');
const router = express.Router();
const { auth, admin } = require('../middleware/auth');
const { uploadSingle, handleUpload } = require('../middleware/upload');
const { encrypt, decrypt } = require('../utils/encryption');
const Passport = require('../models/Passport');
const Notification = require('../models/Notification');
const { sendNotificationToAdmins } = require('./notifications');

// POST /api/passports - User submits a passport document
router.post('/', auth, uploadSingle, handleUpload, async (req, res) => {
  const { holderName, name, passportNumber, submissionDate, country } = req.body;
  const pdfUrl = req.fileUrl; // Attached by handleUpload middleware

  const actualName = holderName || name; // সেফটি চেক

  if (!actualName || !passportNumber || !submissionDate || !pdfUrl || !country) {
    return res.status(400).json({ error: 'All fields including the passport PDF file and country are required' });
  }

  try {
    // Encrypt the passport number
    const encryptedPassportNumber = encrypt(passportNumber);

    // সরাসরি Passport Model ব্যবহার করে MongoDB Atlas-এ সেভ করা হচ্ছে 🚀
    const passport = await Passport.create({
      holderName: actualName,
      name: actualName,
      passportNumber: encryptedPassportNumber,
      submissionDate,
      pdfUrl,
      country,
      status: 'Submitted'
    });

    // সরাসরি Notification Model ব্যবহার করে নোটিফিকেশন তৈরি হচ্ছে
    const notification = await Notification.create({
      type: 'passport_submit',
      title: 'New Passport Submitted',
      message: `${actualName} has submitted passport number: ${passportNumber} for visa processing.`
    });

    // Push real-time notification
    sendNotificationToAdmins(notification);

    res.status(201).json({
      message: 'Passport details and document uploaded successfully',
      passport: {
        id: passport._id,
        holderName: passport.holderName || passport.name,
        submissionDate: passport.submissionDate,
        pdfUrl: passport.pdfUrl,
        country: passport.country,
        status: passport.status
      }
    });
  } catch (error) {
    console.error('Passport submission error:', error);
    res.status(500).json({ error: 'সার্ভার এরর, পাসপোর্ট সাবমিট করা যায়নি।' });
  }
});

// GET /api/passports - Admin lists and searches passports (Admin Only)
router.get('/', auth, admin, async (req, res) => {
  const { search } = req.query;

  try {
    // সরাসরি মঙ্গোডিবি থেকে সব পাসপোর্ট ডেটা তুলে আনা হচ্ছে 🔍
    const list = await Passport.find({}).sort({ createdAt: -1 });

    // Decrypt all passport numbers
    const decryptedList = list.map(item => {
      const obj = item.toObject();
      obj.id = obj._id;
      obj.passportNumber = decrypt(obj.passportNumber);
      return obj;
    });

    // Apply filtering in memory
    let filteredList = decryptedList;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredList = decryptedList.filter(item => {
        const nameMatch = item.holderName && item.holderName.toLowerCase().includes(searchLower);
        const passportMatch = item.passportNumber && item.passportNumber.toLowerCase().includes(searchLower);
        return nameMatch || passportMatch;
      });
    }

    res.json(filteredList);
  } catch (error) {
    console.error('Fetch passports error:', error);
    res.status(500).json({ error: 'সার্ভার এরর, পাসপোর্ট লিস্ট পাওয়া যায়নি।' });
  }
});

// GET /api/passports/track - Track status by Passport Number (Publicly accessible)
router.get('/track', async (req, res) => {
  const { passportNumber } = req.query;
  if (!passportNumber) {
    return res.status(400).json({ error: 'Passport number is required' });
  }

  try {
    // সরাসরি MongoDB থেকে সব পাসপোর্ট নিয়ে আসা হচ্ছে ট্র্যাকিং ম্যাচ করার জন্য
    const list = await Passport.find({});
    
    let found = null;
    for (const item of list) {
      const decryptedNum = decrypt(item.passportNumber);
      if (decryptedNum === passportNumber) {
        found = item;
        break;
      }
    }

    if (!found) {
      return res.status(404).json({ error: 'Passport not found or invalid passport number.' });
    }

    const obj = found.toObject();
    res.json({
      id: obj._id,
      holderName: obj.holderName,
      submissionDate: obj.submissionDate,
      status: obj.status,
      updatedAt: obj.updatedAt
    });
  } catch (error) {
    console.error('Track passport error:', error);
    res.status(500).json({ error: 'সার্ভার এরর, ট্র্যাক করা সম্ভব হয়নি।' });
  }
});

// PATCH /api/passports/:id/status - Update Passport Status (Admin Only)
router.patch('/:id/status', auth, admin, async (req, res) => {
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  try {
    // সরাসরি MongoDB Atlas-এ আইডি ধরে স্ট্যাটাস আপডেট করা হচ্ছে 🛠️
    const updated = await Passport.findByIdAndUpdate(
      req.params.id, 
      { status }, 
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Passport record not found' });
    }

    const obj = updated.toObject();
    obj.passportNumber = decrypt(obj.passportNumber);

    // নতুন নোটিফিকেশন রেকর্ড তৈরি হচ্ছে
    const notification = await Notification.create({
      type: 'passport_submit',
      title: 'Passport Status Updated',
      message: `Passport of ${obj.holderName} updated to status: ${status}.`
    });
    sendNotificationToAdmins(notification);

    res.json(obj);
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ error: 'সার্ভার এরর, স্ট্যাটাস আপডেট করা যায়নি।' });
  }
});

// DELETE /api/passports/:id - Delete Passport Record (Admin Only)
router.delete('/:id', auth, admin, async (req, res) => {
  try {
    // সরাসরি MongoDB Atlas থেকে পাসপোর্ট রেকর্ড ডিলিট করা হচ্ছে 🗑️
    const deleted = await Passport.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Passport record not found' });
    }
    res.json({ message: 'Passport record deleted successfully' });
  } catch (error) {
    console.error('Delete passport error:', error);
    res.status(500).json({ error: 'সার্ভার এরর, রেকর্ড ডিলিট করা যায়নি।' });
  }
});

module.exports = router;