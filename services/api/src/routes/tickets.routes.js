const express = require("express");
const requireAuth = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");
const ctrl = require("../controllers/tickets.controller");

const router = express.Router();
router.use(requireAuth);

router.get("/me", ctrl.myTickets);
router.get("/all", requireRole("HR_ADMIN", "SUPER_ADMIN"), ctrl.allTickets);
router.post("/", ctrl.createTicket);
router.get("/:id", ctrl.getTicket);
router.post("/:id/comments", ctrl.addComment);
router.patch("/:id/status", ctrl.updateStatus);

module.exports = router;
