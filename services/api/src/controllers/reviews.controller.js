const prisma = require("../config/prisma");

async function received(req, res) {
  const reviews = await prisma.performanceReview.findMany({
    where: { revieweeId: req.user.id },
    include: { reviewer: { select: { firstName: true, lastName: true, jobTitle: true } } },
    orderBy: { createdAt: "desc" },
  });
  res.json(reviews);
}

async function written(req, res) {
  const reviews = await prisma.performanceReview.findMany({
    where: { reviewerId: req.user.id },
    include: { reviewee: { select: { firstName: true, lastName: true, jobTitle: true } } },
    orderBy: { createdAt: "desc" },
  });
  res.json(reviews);
}

async function createReview(req, res) {
  const { revieweeId, cycle, content, rating } = req.body;
  if (!revieweeId || !cycle || !content || !rating) {
    return res.status(400).json({ error: "revieweeId, cycle, content, and rating are required" });
  }

  const reviewee = await prisma.user.findUnique({ where: { id: revieweeId } });
  if (!reviewee) return res.status(404).json({ error: "Employee not found" });

  const isManagerOfReviewee = reviewee.managerId === req.user.id;
  const isHrOverride = req.user.role === "HR_ADMIN" || req.user.role === "SUPER_ADMIN";
  if (!isManagerOfReviewee && !isHrOverride) return res.status(403).json({ error: "Forbidden" });

  const review = await prisma.performanceReview.create({
    data: {
      revieweeId,
      reviewerId: req.user.id,
      cycle,
      content,
      rating: parseInt(rating, 10),
    },
  });

  res.status(201).json(review);
}

async function acknowledge(req, res) {
  const review = await prisma.performanceReview.findUnique({ where: { id: req.params.id } });
  if (!review) return res.status(404).json({ error: "Not found" });
  if (review.revieweeId !== req.user.id) return res.status(403).json({ error: "Forbidden" });

  const updated = await prisma.performanceReview.update({
    where: { id: review.id },
    data: { acknowledged: true },
  });
  res.json(updated);
}

module.exports = { received, written, createReview, acknowledge };
