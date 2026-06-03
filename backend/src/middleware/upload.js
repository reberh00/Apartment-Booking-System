const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');
const { createError } = require('./errorHandler');

const UPLOAD_ROOT = path.resolve(__dirname, '../../uploads');
const APARTMENT_PHOTO_DIR = path.join(UPLOAD_ROOT, 'apartments');

fs.mkdirSync(APARTMENT_PHOTO_DIR, { recursive: true });

const ALLOWED_MIME_TYPES = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, APARTMENT_PHOTO_DIR);
  },
  filename: (req, file, cb) => {
    const extension = ALLOWED_MIME_TYPES[file.mimetype] || '';
    const uniqueName = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${extension}`;
    cb(null, uniqueName);
  },
});

function fileFilter(req, file, cb) {
  if (!ALLOWED_MIME_TYPES[file.mimetype]) {
    cb(createError('Dozvoljene su samo slike (JPEG, PNG, WebP, GIF).', 400));
    return;
  }

  cb(null, true);
}

const uploadApartmentPhoto = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
}).single('photo');

function apartmentPhotoFilePath(filename) {
  return path.join(APARTMENT_PHOTO_DIR, filename);
}

module.exports = {
  uploadApartmentPhoto,
  UPLOAD_ROOT,
  APARTMENT_PHOTO_DIR,
  apartmentPhotoFilePath,
  MAX_FILE_SIZE,
};
