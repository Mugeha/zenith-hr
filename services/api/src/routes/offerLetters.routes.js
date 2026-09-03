const express = require("express");
const requireAuth = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");
const ctrl = require("../controllers/offerLetters.controller");

const router = express.Router();
router.use(requireAuth, requireRole("HR_ADMIN", "SUPER_ADMIN"));

router.get("/default-template", (req, res) => res.json({ template: ctrl.DEFAULT_TEMPLATE }));
router.post("/preview", ctrl.preview);

module.exports = router;
