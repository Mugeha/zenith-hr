const express = require("express");
const requireAuth = require("../middleware/auth");
const { uploaderUnrestricted } = require("../middleware/upload");
const ctrl = require("../controllers/documents.controller");

const router = express.Router();
router.use(requireAuth);

const documentUpload = uploaderUnrestricted("documents");

router.get("/me", ctrl.myDocuments);
router.post("/", documentUpload.single("file"), ctrl.uploadDocument);
router.get("/download", ctrl.downloadDocument);

module.exports = router;
