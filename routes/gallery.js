const express = require("express");
const router = express.Router();
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const Gallery = require("../models/Gallery");
const dbHelper = require("../models/modelHelper");

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
    folder: "mces_gallery", // ক্লাউডিনারিতে এই ফোল্ডারে ইমেজ সেভ হবে
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  },
});

const upload = multer({ storage: storage });

// ১. সব ছবি গেট করা
router.get("/", async (req, res) => {
  try {
    const images = await dbHelper.find(Gallery, "gallery");
    res.json(images);
  } catch (err) {
    res.status(500).json({ error: "গ্যালারির ডেটা পাওয়া যায়নি।" });
  }
});

// ২. ক্লাউডিনারিতে নতুন ছবি আপলোড ও ডাটাবেজে সেভ (Create)
router.post("/", upload.single("file"), async (req, res) => {
  try {
    const { title, caption } = req.body;
    if (!req.file) return res.status(400).json({ error: "একটি ছবি ফাইল প্রদান করুন।" });

    // Cloudinary সরাসরি সিডিএন https লিংকটি req.file.path-এ রিটার্ন করে
    const imageUrl = req.file.path; 

    const newImage = await dbHelper.create(Gallery, "gallery", { title, caption, imageUrl });
    res.status(201).json({ message: "ছবি ক্লাউডিনারিতে সফলভাবে আপলোড হয়েছে!", data: newImage });
  } catch (err) {
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

    const updatedImage = await Gallery.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json({ message: "গ্যালারি সফলভাবে আপডেট হয়েছে!", data: updatedImage });
  } catch (err) {
    res.status(500).json({ error: "আপডেট করা সম্ভব হয়নি।" });
  }
});

// ৪. গ্যালারি ছবি মুছে ফেলা (Delete)
router.delete("/:id", async (req, res) => {
  try {
    await Gallery.findByIdAndDelete(req.params.id);
    res.json({ message: "ছবিটি সফলভাবে মুছে ফেলা হয়েছে।" });
  } catch (err) {
    res.status(500).json({ error: "মুছে ফেলা ব্যর্থ হয়েছে।" });
  }
});

module.exports = router;