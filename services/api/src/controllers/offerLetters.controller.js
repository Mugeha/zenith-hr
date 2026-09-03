const ejs = require("ejs");

const DEFAULT_TEMPLATE = `<h1>Offer of Employment</h1>
<p>Dear <%= candidateName %>,</p>
<p>Zenith HR Ltd is pleased to offer you the position of <%= roleTitle %>,
starting <%= startDate %>.</p>
<p>Welcome to the team!</p>`;

async function preview(req, res) {
  const { template, candidateName, roleTitle, startDate } = req.body;

  // HR Admins can customize the offer-letter template with their own EJS
  // markup (mail-merge style placeholders). Rendered straight from the
  // editor so changes preview instantly.
  try {
    const html = ejs.render(template || DEFAULT_TEMPLATE, {
      candidateName: candidateName || "Candidate",
      roleTitle: roleTitle || "New Role",
      startDate: startDate || new Date().toISOString().slice(0, 10),
    });
    res.json({ html });
  } catch (err) {
    res.status(400).json({ error: `Template error: ${err.message}` });
  }
}

module.exports = { preview, DEFAULT_TEMPLATE };
