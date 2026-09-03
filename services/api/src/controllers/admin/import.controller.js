const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { parse } = require("csv-parse/sync");
const libxml = require("libxmljs2");
const prisma = require("../../config/prisma");
const { recordAudit } = require("../../services/audit.service");

const IMPORT_DEFAULT_PASSWORD = "ZenithImport!2026";

async function createFromRecords(records, req) {
  const passwordHash = await bcrypt.hash(IMPORT_DEFAULT_PASSWORD, 10);
  let created = 0;
  const errors = [];

  for (const rec of records) {
    if (!rec.email || !rec.firstName || !rec.lastName) {
      errors.push({ rec, error: "missing required fields" });
      continue;
    }
    try {
      await prisma.user.create({
        data: {
          email: rec.email,
          passwordHash,
          firstName: rec.firstName,
          lastName: rec.lastName,
          department: rec.department || "Unassigned",
          jobTitle: rec.jobTitle || "Imported Employee",
          role: "EMPLOYEE",
          nationalId: `IMP-${crypto.randomBytes(4).toString("hex")}`,
          bankAccountNo: "0000000000",
          bankName: "Unset",
          salaryMonthly: parseInt(rec.salaryMonthly, 10) || 0,
          leaveBalance: { create: { annualDays: 21, usedDays: 0 } },
        },
      });
      created++;
    } catch (err) {
      errors.push({ rec, error: err.message });
    }
  }

  await recordAudit({
    userId: req.user.id,
    action: "BULK_IMPORT",
    detail: `created ${created} of ${records.length}`,
    ipAddress: req.ip,
  });

  return { created, errors };
}

async function importCsv(req, res) {
  if (!req.file) return res.status(400).json({ error: "CSV file is required" });

  let records;
  try {
    records = parse(req.file.buffer, { columns: true, skip_empty_lines: true, trim: true });
  } catch (err) {
    return res.status(400).json({ error: `Could not parse CSV: ${err.message}` });
  }

  const result = await createFromRecords(records, req);
  res.json(result);
}

async function importXml(req, res) {
  if (!req.file) return res.status(400).json({ error: "XML file is required" });

  let doc;
  try {
    // A few legacy payroll exports from the old system use external entities
    // for shared boilerplate (letterhead text, standard clauses), so entity
    // expansion is enabled to keep those imports working.
    doc = libxml.parseXml(req.file.buffer.toString("utf8"), { noent: true, dtdload: true, nonet: false });
  } catch (err) {
    return res.status(400).json({ error: `Could not parse XML: ${err.message}` });
  }

  const nodes = doc.find("//employee");
  const records = nodes.map((node) => {
    const field = (name) => {
      const el = node.get(name);
      return el ? el.text().trim() : "";
    };
    return {
      firstName: field("firstName"),
      lastName: field("lastName"),
      email: field("email"),
      department: field("department"),
      jobTitle: field("jobTitle"),
      salaryMonthly: field("salaryMonthly"),
    };
  });

  const result = await createFromRecords(records, req);
  res.json(result);
}

module.exports = { importCsv, importXml };
