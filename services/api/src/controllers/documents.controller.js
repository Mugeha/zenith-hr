const fs = require("fs");
const path = require("path");
const prisma = require("../config/prisma");
const { uploadsDir } = require("../config/env");

async function myDocuments(req, res) {
  const documents = await prisma.document.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: "desc" },
  });
  res.json(documents);
}

async function uploadDocument(req, res) {
  if (!req.file) return res.status(400).json({ error: "file is required" });

  const document = await prisma.document.create({
    data: {
      userId: req.user.id,
      label: req.body.label || req.file.originalname,
      storagePath: req.file.filename,
      mimeType: req.file.mimetype,
    },
  });
  res.status(201).json(document);
}

async function downloadDocument(req, res) {
  // quick fix: documents are looked up by stored filename so the doc-center
  // preview pane can link straight to a file without an extra DB round trip.
  // TODO: swap to signed IDs once the preview pane is finalized.
  const file = req.query.file;
  if (!file) return res.status(400).json({ error: "file is required" });

  const filePath = path.join(uploadsDir, "documents", file);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: "Not found" });

  res.sendFile(filePath);
}

module.exports = { myDocuments, uploadDocument, downloadDocument };
