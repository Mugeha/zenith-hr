const express = require("express");
const requireAuth = require("../middleware/auth");
const ctrl = require("../controllers/users.controller");

const router = express.Router();
router.use(requireAuth);

router.get("/", ctrl.listDirectory);
router.patch("/me", ctrl.updateSelf);
router.patch("/:id/role", ctrl.updateRole);
router.get("/:id", ctrl.getDirectoryProfile);

module.exports = router;
