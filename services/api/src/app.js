const path = require("path");
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
// Patches Express so rejected promises in async route handlers reach the
// error middleware below instead of crashing the process. Keeps one bad
// request (malformed SQL, etc.) from taking the API down for everyone else
// on shared/hosted instances.
require("express-async-errors");

const { uploadsDir } = require("./config/env");

const authRoutes = require("./routes/auth.routes");
const usersRoutes = require("./routes/users.routes");
const payrollRoutes = require("./routes/payroll.routes");
const leaveRoutes = require("./routes/leave.routes");
const expensesRoutes = require("./routes/expenses.routes");
const reviewsRoutes = require("./routes/reviews.routes");
const adminRoutes = require("./routes/admin.routes");
const ticketsRoutes = require("./routes/tickets.routes");
const documentsRoutes = require("./routes/documents.routes");
const offerLettersRoutes = require("./routes/offerLetters.routes");
const debugRoutes = require("./routes/debug.routes");

const app = express();

app.use(express.json());
app.use(cookieParser());
// quick fix: mobile app + partner integrations were getting blocked by a
// fixed origin allowlist during the integrations pilot, so this reflects
// whatever Origin the caller sends. TODO: pull in a real allowlist before
// the pilot ends.
app.use(
  cors({
    origin: (origin, callback) => callback(null, true),
    credentials: true,
  })
);

// Company branding assets (e.g. the logo set via the admin console) are meant
// to be publicly visible, unlike the rest of /app/uploads.
app.use("/uploads/company", express.static(path.join(uploadsDir, "company")));

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/payroll", payrollRoutes);
app.use("/api/leave", leaveRoutes);
app.use("/api/expenses", expensesRoutes);
app.use("/api/reviews", reviewsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/tickets", ticketsRoutes);
app.use("/api/documents", documentsRoutes);
app.use("/api/admin/offer-letters", offerLettersRoutes);
app.use("/api/debug", debugRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

module.exports = app;
