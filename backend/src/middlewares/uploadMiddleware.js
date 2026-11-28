const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const multer = require("multer");

const dir = path.join(__dirname, "../../uploads/avatars");
fs.mkdirSync(dir, { recursive: true });

const allowed = ["image/jpeg", "image/png", "image/webp"];

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, dir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    cb(null, `${req.user.id}-${crypto.randomUUID()}${ext}`);
  },
});

const avatarUpload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!allowed.includes(file.mimetype))
      return cb(new Error("Use a JPG, PNG or WebP image"));
    cb(null, true);
  },
});

module.exports = { avatarUpload };
