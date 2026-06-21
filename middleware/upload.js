const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { cloudinary, isConfigured } = require('../config/cloudinary');

// Ensure local uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Memory storage for parsing file stream, or local disk storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Middleware function that handles the upload and attaches the file URL to req.fileUrl
const handleUpload = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  try {
    const fileBuffer = req.file.buffer;
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    const uniqueFilename = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}${fileExtension}`;

    if (isConfigured()) {
      // Upload to Cloudinary using stream
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto', // Auto-detect image vs PDF vs other raw files
          folder: 'mces_platform',
          public_id: path.basename(uniqueFilename, fileExtension)
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary stream upload error:', error);
            // Fallback to local upload if Cloudinary service error
            console.log('🔄 Cloudinary error! Falling back to local upload...');
            saveLocal(fileBuffer, uniqueFilename, req, next);
          } else {
            req.fileUrl = result.secure_url;
            req.filePublicId = result.public_id;
            next();
          }
        }
      );
      uploadStream.end(fileBuffer);
    } else {
      // Local storage fallback
      saveLocal(fileBuffer, uniqueFilename, req, next);
    }
  } catch (error) {
    console.error('Upload middleware error:', error);
    res.status(500).json({ error: 'File upload processing failed.' });
  }
};

const saveLocal = (buffer, filename, req, next) => {
  const filePath = path.join(uploadDir, filename);
  fs.writeFile(filePath, buffer, (err) => {
    if (err) {
      console.error('Local file write error:', err);
      return next(err);
    }
    // Set URL relative to the backend server (e.g., http://localhost:5000/uploads/filename)
    req.fileUrl = `/uploads/${filename}`;
    next();
  });
};

module.exports = {
  uploadSingle: upload.single('file'),
  handleUpload
};
