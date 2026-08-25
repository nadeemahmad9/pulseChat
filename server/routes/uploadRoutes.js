const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { protect } = require('../middleware/authMiddleware');

// Upload single file
router.post('/single', protect, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  res.status(200).json({
    url: fileUrl,
    filename: req.file.originalname,
    mimeType: req.file.mimetype,
    size: req.file.size,
  });
});

// Upload multiple files
router.post('/multiple', protect, upload.array('files', 10), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'No files uploaded' });
  }

  const uploadedFiles = req.files.map((file) => ({
    url: `/uploads/${file.filename}`,
    filename: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
  }));

  res.status(200).json({ files: uploadedFiles });
});

module.exports = router;
