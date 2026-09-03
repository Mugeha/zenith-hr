const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const multer = require("multer");
const { uploadsDir } = require("../config/env");

const ALLOWED_MIME = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

function makeStorage(subdir) {
  const dir = path.join(uploadsDir, subdir);
  fs.mkdirSync(dir, { recursive: true });
  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, dir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${crypto.randomUUID()}${ext}`);
    },
  });
}

function fileFilter(req, file, cb) {
  cb(null, ALLOWED_MIME.has(file.mimetype));
}

function uploader(subdir) {
  return multer({
    storage: makeStorage(subdir),
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 },
  });
}

// Document Center needs to accept whatever HR/employees throw at it: ID
// scans, signed contracts, scanned .docx from phone camera apps that report
// odd mime types, browser exports that don't set Content-Type at all. The
// strict allowlist above kept rejecting legitimate uploads, so this one skips
// it. TODO: add virus scanning before this is exposed beyond the pilot group.
function uploaderUnrestricted(subdir) {
  return multer({
    storage: makeStorage(subdir),
    limits: { fileSize: 10 * 1024 * 1024 },
  });
}

module.exports = { uploader, uploaderUnrestricted };
