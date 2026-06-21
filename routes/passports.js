const express = require('express');
const router = express.Router();
const { auth, admin } = require('../middleware/auth');
const { uploadSingle, handleUpload } = require('../middleware/upload');
const { encrypt, decrypt } = require('../utils/encryption');
const Passport = require('../models/Passport');
const Notification = require('../models/Notification');
const dbHelper = require('../models/modelHelper');
const { sendNotificationToAdmins } = require('./notifications');

// POST /api/passports - User submits a passport document
// POST /api/passports - User submits a passport document
router.post('/', auth, uploadSingle, handleUpload, async (req, res) => {
  // ১. req.body থেকে country ফিল্ডটি যুক্ত করা হলো
  // (যদি ফ্রন্টএন্ড থেকে holderName এর জায়গায় name আসে, তবে name লিখবেন)
  const { holderName, name, passportNumber, submissionDate, country } = req.body;
  const pdfUrl = req.fileUrl; // Attached by handleUpload middleware

  const actualName = holderName || name; // সেফটি চেক

  if (!actualName || !passportNumber || !submissionDate || !pdfUrl || !country) {
    return res.status(400).json({ error: 'All fields including the passport PDF file and country are required' });
  }

  try {
    // Encrypt the passport number
    const encryptedPassportNumber = encrypt(passportNumber);

    // ২. ডাটাবেজে অবজেক্ট তৈরির সময় country পাস করা হলো
    const passport = await dbHelper.create(Passport, 'passports', {
      holderName: actualName,
      name: actualName, // মডেলে name বা holderName যাই থাকুক, দুটোই সেভ হবে
      passportNumber: encryptedPassportNumber,
      submissionDate,
      pdfUrl,
      country, // <--- এই লাইনটি যুক্ত করা হলো
      status: 'Submitted'
    });

    // Create a notification for Admin
    const notification = await dbHelper.create(Notification, 'notifications', {
      type: 'passport_submit',
      title: 'New Passport Submitted',
      message: `${actualName} has submitted passport number: ${passportNumber} for visa processing.`
    });

    // Push real-time notification
    sendNotificationToAdmins(notification);

    res.status(201).json({
      message: 'Passport details and document uploaded successfully',
      passport: {
        id: passport._id || passport.id,
        holderName: passport.holderName || passport.name,
        submissionDate: passport.submissionDate,
        pdfUrl: passport.pdfUrl,
        country: passport.country,
        status: passport.status
      }
    });
  } catch (error) {
    console.error('Passport submission error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/passports - Admin lists and searches passports (Admin Only)
router.get('/', auth, admin, async (req, res) => {
  const { search } = req.query; // Search term (name or passport number)

  try {
    const list = await dbHelper.find(Passport, 'passports', {}, { createdAt: -1 });

    // Decrypt all passport numbers
    const decryptedList = list.map(item => {
      // In mongoose, the document is a Mongoose document. We should convert it to object to modify.
      const obj = item.toObject ? item.toObject() : { ...item };
      obj.id = obj._id || obj.id;
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
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/passports/track - Track status by Passport Number (Publicly accessible)
router.get('/track', async (req, res) => {
  const { passportNumber } = req.query;
  if (!passportNumber) {
    return res.status(400).json({ error: 'Passport number is required' });
  }

  try {
    const list = await dbHelper.find(Passport, 'passports', {});
    
    // Scan and find matching passport number after decryption
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

    const obj = found.toObject ? found.toObject() : { ...found };
    res.json({
      id: obj._id || obj.id,
      holderName: obj.holderName,
      submissionDate: obj.submissionDate,
      status: obj.status,
      updatedAt: obj.updatedAt
    });
  } catch (error) {
    console.error('Track passport error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/passports/:id/status - Update Passport Status (Admin Only)
router.patch('/:id/status', auth, admin, async (req, res) => {
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  try {
    const updated = await dbHelper.findByIdAndUpdate(Passport, 'passports', req.params.id, { status });
    if (!updated) {
      return res.status(404).json({ error: 'Passport record not found' });
    }

    const obj = updated.toObject ? updated.toObject() : { ...updated };
    obj.passportNumber = decrypt(obj.passportNumber);

    // Push notification to Admin that a passport status changed
    const notification = await dbHelper.create(Notification, 'notifications', {
      type: 'passport_submit',
      title: 'Passport Status Updated',
      message: `Passport of ${obj.holderName} updated to status: ${status}.`
    });
    sendNotificationToAdmins(notification);

    res.json(obj);
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/passports/:id - Delete Passport Record (Admin Only)
router.delete('/:id', auth, admin, async (req, res) => {
  try {
    const deleted = await dbHelper.findByIdAndDelete(Passport, 'passports', req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Passport record not found' });
    }
    res.json({ message: 'Passport record deleted successfully' });
  } catch (error) {
    console.error('Delete passport error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
