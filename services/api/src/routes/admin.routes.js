const express = require("express");
const multer = require("multer");
const requireAuth = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");

const adminUsers = require("../controllers/admin/adminUsers.controller");
const company = require("../controllers/admin/company.controller");
const integrations = require("../controllers/admin/integrations.controller");
const importCtrl = require("../controllers/admin/import.controller");
const audit = require("../controllers/admin/audit.controller");
const reports = require("../controllers/admin/reports.controller");

const router = express.Router();
const memoryUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.use(requireAuth, requireRole("HR_ADMIN", "SUPER_ADMIN"));

router.get("/users", adminUsers.listUsers);
router.patch("/users/:id", adminUsers.updateUser);
router.patch("/users/:id/role", requireRole("SUPER_ADMIN"), adminUsers.updateRole);

router.get("/company", company.getCompany);
router.patch("/company", company.updateCompany);
router.post("/company/logo-from-url", company.setLogoFromUrl);

router.get("/api-keys", integrations.listApiKeys);
router.post("/api-keys", integrations.createApiKey);
router.delete("/api-keys/:id", integrations.deleteApiKey);
router.get("/webhooks", integrations.listWebhooks);
router.post("/webhooks", integrations.createWebhook);
router.delete("/webhooks/:id", integrations.deleteWebhook);

router.post("/import/csv", memoryUpload.single("file"), importCtrl.importCsv);
router.post("/import/xml", memoryUpload.single("file"), importCtrl.importXml);

router.get("/audit-log", audit.listAuditLog);

router.get("/reports/employees/search", reports.searchEmployees);
router.get("/reports/employees/csv", reports.exportCsv);
router.post("/reports/employees/pdf", reports.exportPdf);
router.get("/reports/saved", reports.listSavedConfigs);
router.post("/reports/saved", reports.createSavedConfig);
router.get("/reports/saved/:id", reports.loadSavedConfig);

module.exports = router;
