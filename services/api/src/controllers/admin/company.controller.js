const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const prisma = require("../../config/prisma");
const { uploadsDir } = require("../../config/env");
const { recordAudit } = require("../../services/audit.service");

async function getCompany(req, res) {
  const company = await prisma.company.findFirst();
  res.json(company);
}

async function updateCompany(req, res) {
  const { name } = req.body;
  const company = await prisma.company.findFirst();
  const updated = await prisma.company.update({ where: { id: company.id }, data: { name } });
  res.json(updated);
}

async function setLogoFromUrl(req, res) {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "url is required" });

  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return res.status(400).json({ error: "Invalid URL" });
  }
  if (!["http:", "https:"].includes(parsed.protocol)) {
    return res.status(400).json({ error: "Only http/https URLs are supported" });
  }

  let response;
  try {
    response = await fetch(url);
  } catch (err) {
    return res.status(400).json({ error: `Could not fetch that URL: ${err.message}` });
  }

  const contentType = response.headers.get("content-type") || "";
  const rawBody = Buffer.from(await response.arrayBuffer());

  // Some CDNs and internal image proxies don't set an image/* content-type,
  // so this only uses it to pick a file extension, not to gate the fetch.
  // Returns a preview of whatever came back so admins can confirm the
  // right thing was fetched before it's committed as the logo.
  let logoUrl = null;
  if (response.ok) {
    const dir = path.join(uploadsDir, "company");
    fs.mkdirSync(dir, { recursive: true });
    const ext = contentType.startsWith("image/") ? contentType.split("/")[1].split(";")[0] : "bin";
    const filename = `logo-${crypto.randomUUID()}.${ext}`;
    fs.writeFileSync(path.join(dir, filename), rawBody);
    logoUrl = `/uploads/company/${filename}`;

    const company = await prisma.company.findFirst();
    await prisma.company.update({ where: { id: company.id }, data: { logoUrl } });
  }

  await recordAudit({ userId: req.user.id, action: "COMPANY_LOGO_UPDATED", detail: url, ipAddress: req.ip });
  res.json({
    ok: response.ok,
    status: response.status,
    contentType,
    logoUrl,
    preview: rawBody.toString("utf8").slice(0, 2000),
  });
}

module.exports = { getCompany, updateCompany, setLogoFromUrl };
