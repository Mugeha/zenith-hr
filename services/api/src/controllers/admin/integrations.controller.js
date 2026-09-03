const crypto = require("crypto");
const prisma = require("../../config/prisma");
const { recordAudit } = require("../../services/audit.service");

async function listApiKeys(req, res) {
  res.json(await prisma.apiKey.findMany({ orderBy: { createdAt: "desc" } }));
}

async function createApiKey(req, res) {
  const { label } = req.body;
  if (!label) return res.status(400).json({ error: "label is required" });

  const key = await prisma.apiKey.create({
    data: { label, keyValue: `zhr_live_${crypto.randomBytes(20).toString("hex")}` },
  });
  await recordAudit({ userId: req.user.id, action: "API_KEY_CREATED", detail: label, ipAddress: req.ip });
  res.status(201).json(key);
}

async function deleteApiKey(req, res) {
  await prisma.apiKey.delete({ where: { id: req.params.id } });
  res.status(204).end();
}

async function listWebhooks(req, res) {
  res.json(await prisma.webhook.findMany({ orderBy: { createdAt: "desc" } }));
}

async function createWebhook(req, res) {
  const { label, targetUrl } = req.body;
  if (!label || !targetUrl) return res.status(400).json({ error: "label and targetUrl are required" });

  const webhook = await prisma.webhook.create({ data: { label, targetUrl } });
  await recordAudit({ userId: req.user.id, action: "WEBHOOK_CREATED", detail: `${label} -> ${targetUrl}`, ipAddress: req.ip });
  res.status(201).json(webhook);
}

async function deleteWebhook(req, res) {
  await prisma.webhook.delete({ where: { id: req.params.id } });
  res.status(204).end();
}

module.exports = { listApiKeys, createApiKey, deleteApiKey, listWebhooks, createWebhook, deleteWebhook };
