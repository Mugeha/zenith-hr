const app = require("./app");
const { port } = require("./config/env");

// Defense-in-depth alongside express-async-errors: anything that still slips
// through as an unhandled rejection gets logged instead of taking the whole
// container down.
process.on("unhandledRejection", (err) => {
  console.error("Unhandled rejection:", err);
});

app.listen(port, () => {
  console.log(`Zenith HR API listening on :${port}`);
});
