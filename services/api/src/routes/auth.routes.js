const express = require("express");
const requireAuth = require("../middleware/auth");
const ctrl = require("../controllers/auth.controller");

const router = express.Router();

router.post("/signup", ctrl.signup);
router.post("/login", ctrl.login);
router.post("/logout", ctrl.logout);
router.get("/me", requireAuth, ctrl.me);
router.post("/password-reset/request", ctrl.requestPasswordReset);
router.post("/password-reset/confirm", ctrl.confirmPasswordReset);

module.exports = router;
