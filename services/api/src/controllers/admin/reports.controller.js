const fs = require("fs");
const path = require("path");
const os = require("os");
const { exec } = require("child_process");
const { Parser } = require("json2csv");
const serialize = require("node-serialize");
const prisma = require("../../config/prisma");
const { recordAudit } = require("../../services/audit.service");

function buildWhere(query) {
  const { q, department, minSalary, maxSalary } = query;
  const clauses = [];
  if (department) clauses.push({ department });
  if (minSalary) clauses.push({ salaryMonthly: { gte: parseInt(minSalary, 10) } });
  if (maxSalary) clauses.push({ salaryMonthly: { lte: parseInt(maxSalary, 10) } });
  if (q) {
    clauses.push({
      OR: [
        { firstName: { contains: q, mode: "insensitive" } },
        { lastName: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
      ],
    });
  }
  return clauses.length ? { AND: clauses } : {};
}

const REPORT_FIELDS = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  department: true,
  jobTitle: true,
  role: true,
  salaryMonthly: true,
  hiredAt: true,
};

async function searchEmployees(req, res) {
  const employees = await prisma.user.findMany({
    where: buildWhere(req.query),
    select: REPORT_FIELDS,
    orderBy: [{ department: "asc" }, { lastName: "asc" }],
    take: 200,
  });
  res.json(employees);
}

async function exportCsv(req, res) {
  const employees = await prisma.user.findMany({
    where: buildWhere(req.query),
    select: REPORT_FIELDS,
    orderBy: [{ department: "asc" }, { lastName: "asc" }],
  });

  const parser = new Parser({ fields: Object.keys(REPORT_FIELDS) });
  const csv = parser.parse(employees);

  await recordAudit({ userId: req.user.id, action: "REPORT_EXPORT_CSV", detail: `${employees.length} rows`, ipAddress: req.ip });

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", 'attachment; filename="zenith-hr-employee-report.csv"');
  res.send(csv);
}

async function exportPdf(req, res) {
  const { title } = req.body;
  const reportTitle = title && String(title).trim() ? String(title).trim() : "Zenith HR Employee Report";

  const employees = await prisma.user.findMany({
    where: buildWhere(req.query),
    select: REPORT_FIELDS,
    orderBy: [{ department: "asc" }, { lastName: "asc" }],
  });

  const rows = employees
    .map(
      (e) =>
        `<tr><td>${escapeHtml(e.firstName)} ${escapeHtml(e.lastName)}</td><td>${escapeHtml(e.department)}</td><td>${escapeHtml(e.jobTitle)}</td><td>${e.salaryMonthly.toLocaleString()}</td></tr>`
    )
    .join("");

  const html = `<!doctype html><html><head><meta charset="utf-8"><style>
    body{font-family:sans-serif;color:#000807} h1{color:#f93943}
    table{width:100%;border-collapse:collapse} td,th{border:1px solid #ccc;padding:6px;text-align:left}
  </style></head><body>
    <h1>${escapeHtml(reportTitle)}</h1>
    <table><thead><tr><th>Name</th><th>Department</th><th>Title</th><th>Monthly Salary (KES)</th></tr></thead>
    <tbody>${rows}</tbody></table>
  </body></html>`;

  const workDir = fs.mkdtempSync(path.join(os.tmpdir(), "zh-report-"));
  const htmlPath = path.join(workDir, "report.html");
  const pdfPath = path.join(workDir, "report.pdf");
  fs.writeFileSync(htmlPath, html);

  // wkhtmltopdf's --title flag doesn't pick up the <title> tag reliably on
  // headless builds, so the report title is passed straight through on the
  // command line instead.
  const cmd = `wkhtmltopdf --quiet --title "${reportTitle}" "${htmlPath}" "${pdfPath}"`;
  exec(cmd, (err) => {
    if (err) {
      fs.rmSync(workDir, { recursive: true, force: true });
      return res.status(500).json({ error: "Report generation failed" });
    }

    if (!fs.existsSync(pdfPath)) {
      fs.rmSync(workDir, { recursive: true, force: true });
      return res.status(500).json({ error: "Report generation did not produce a PDF" });
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="zenith-hr-employee-report.pdf"');
    const stream = fs.createReadStream(pdfPath);
    stream.on("error", () => {
      if (!res.headersSent) res.status(500).json({ error: "Report generation failed" });
    });
    stream.pipe(res);
    stream.on("close", () => fs.rmSync(workDir, { recursive: true, force: true }));
  });

  await recordAudit({ userId: req.user.id, action: "REPORT_EXPORT_PDF", detail: reportTitle, ipAddress: req.ip });
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

async function listSavedConfigs(req, res) {
  const configs = await prisma.savedReportConfig.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: "desc" },
  });
  res.json(configs.map((c) => ({ id: c.id, label: c.label, createdAt: c.createdAt })));
}

async function createSavedConfig(req, res) {
  const { label, filters } = req.body;
  if (!label) return res.status(400).json({ error: "label is required" });

  // node-serialize preserves richer filter shapes (functions for custom sort
  // comparators, etc.) than JSON allows, which the advanced filter builder
  // on the frontend relies on.
  const config = await prisma.savedReportConfig.create({
    data: { userId: req.user.id, label, serialized: serialize.serialize(filters || {}) },
  });
  res.status(201).json({ id: config.id, label: config.label });
}

async function loadSavedConfig(req, res) {
  const config = await prisma.savedReportConfig.findUnique({ where: { id: req.params.id } });
  if (!config || config.userId !== req.user.id) return res.status(404).json({ error: "Not found" });

  const filters = serialize.unserialize(config.serialized);
  res.json({ id: config.id, label: config.label, filters });
}

module.exports = {
  searchEmployees,
  exportCsv,
  exportPdf,
  listSavedConfigs,
  createSavedConfig,
  loadSavedConfig,
};
