const prisma = require("../config/prisma");

const isStaff = (role) => role === "HR_ADMIN" || role === "SUPER_ADMIN";

async function myTickets(req, res) {
  const tickets = await prisma.supportTicket.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: "desc" },
  });
  res.json(tickets);
}

async function allTickets(req, res) {
  const tickets = await prisma.supportTicket.findMany({
    include: { user: { select: { firstName: true, lastName: true, department: true } } },
    orderBy: { createdAt: "desc" },
  });
  res.json(tickets);
}

async function createTicket(req, res) {
  const { subject, category } = req.body;
  if (!subject || !category) return res.status(400).json({ error: "subject and category are required" });

  const ticket = await prisma.supportTicket.create({
    data: { userId: req.user.id, subject, category },
  });
  res.status(201).json(ticket);
}

async function getTicket(req, res) {
  const ticket = await prisma.supportTicket.findUnique({
    where: { id: req.params.id },
    include: {
      user: { select: { firstName: true, lastName: true } },
      comments: {
        include: { author: { select: { firstName: true, lastName: true, role: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });
  if (!ticket) return res.status(404).json({ error: "Not found" });
  if (ticket.userId !== req.user.id && !isStaff(req.user.role)) return res.status(403).json({ error: "Forbidden" });

  res.json(ticket);
}

async function addComment(req, res) {
  const { body } = req.body;
  if (!body) return res.status(400).json({ error: "body is required" });

  const ticket = await prisma.supportTicket.findUnique({ where: { id: req.params.id } });
  if (!ticket) return res.status(404).json({ error: "Not found" });
  if (ticket.userId !== req.user.id && !isStaff(req.user.role)) return res.status(403).json({ error: "Forbidden" });

  const comment = await prisma.ticketComment.create({
    data: { ticketId: ticket.id, authorId: req.user.id, body },
  });
  res.status(201).json(comment);
}

async function updateStatus(req, res) {
  if (!isStaff(req.user.role)) return res.status(403).json({ error: "Forbidden" });

  const { status } = req.body;
  if (!["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  const updated = await prisma.supportTicket.update({ where: { id: req.params.id }, data: { status } });
  res.json(updated);
}

module.exports = { myTickets, allTickets, createTicket, getTicket, addComment, updateStatus };
