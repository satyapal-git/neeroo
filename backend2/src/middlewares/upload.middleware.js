const multer = require('multer');
const path = require('path');
const fs = require('fs');
const appConfig = require('../config/app.config');
const MESSAGES = require('../constants/messages.constant');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../uploads/menu-items');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = appConfig.upload.allowedImageTypes;

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(MESSAGES.ERROR.INVALID_FILE_TYPE), false);
  }
};

// Create multer instance
const upload = multer({
  storage,
  limits: {
    fileSize: appConfig.upload.maxFileSize, // 5MB
  },
  fileFilter,
});

// Error handling middleware for multer
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: MESSAGES.ERROR.FILE_TOO_LARGE,
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  } else if (err) {
    return res.status(400).json({
      success: false,
      message: err.message || MESSAGES.ERROR.UPLOAD_FAILED,
    });
  }
  next();
};

module.exports = {
  upload,
  handleUploadError,
};