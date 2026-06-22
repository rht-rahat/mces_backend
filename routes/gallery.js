const express = require("express");
const router = express.Router();
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const Gallery = require("../models/Gallery"); // সরাসরি Mongoose মডেল

// Cloudinary কনফিগারেশন
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cloudinary Storage কনফিগারেশন
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "mces_gallery",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  },
});

const upload = multer({ storage: storage });

// ১. সব ছবি গেট করা
router.get("/", async (req, res) => {
  try {
    // সরাসরি Mongoose ব্যবহার করে সব ডেটা আনা হচ্ছে 🔍
    const images = await Gallery.find({}).sort({ createdAt: -1 });
    res.json(images);
  } catch (err) {
    console.error('Fetch gallery error:', err);
    res.status(500).json({ error: "গ্যালারির ডেটা পাওয়া যায়নি।" });
  }
});

// ২. নতুন ছবি আপলোড ও ডাটাবেজে সেভ (Create)
router.post("/", upload.single("file"), async (req, res) => {
  try {
    const { title, caption } = req.body;
    if (!req.file) return res.status(400).json({ error: "একটি ছবি ফাইল প্রদান করুন।" });

    const imageUrl = req.file.path; 

    // সরাসরি Mongoose ব্যবহার করে সেভ 🚀
    const newImage = await Gallery.create({ title, caption, imageUrl });
    res.status(201).json({ message: "ছবি ক্লাউডিনারিতে সফলভাবে আপলোড হয়েছে!", data: newImage });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: "আপলোড ব্যর্থ হয়েছে।" });
  }
});

// ৩. গ্যালারি আইটেম আপডেট (Update)
router.put("/:id", upload.single("file"), async (req, res) => {
  try {
    const { title, caption } = req.body;
    let updateData = { title, caption };

    if (req.file) {
      updateData.imageUrl = req.file.path;
    }

    // সরাসরি Mongoose ব্যবহার করে আপডেট 🛠️
    const updatedImage = await Gallery.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json({ message: "গ্যালারি সফলভাবে আপডেট হয়েছে!", data: updatedImage });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ error: "আপডেট ব্যর্থ হয়েছে।" });
  }
});

// ৪. গ্যালারি আইটেম ডিলিট (Delete)
router.delete("/:id", async (req, res) => {
  try {
    await Gallery.findByIdAndDelete(req.params.id);
    res.json({ message: "গ্যালারি আইটেম সফলভাবে ডিলিট করা হয়েছে!" });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: "ডিলিট করা সম্ভব হয়নি।" });
  }
});

module.exports = router;