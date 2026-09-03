// Decoy "internal-only" service standing in for a cloud metadata endpoint
// (e.g. 169.254.169.254). Only reachable from the Docker-internal network,
// never published to the host or the reverse proxy. Exists so testers can
// demonstrate real SSRF impact without the box needing internet egress.
const express = require("express");

const app = express();

app.get("/latest/meta-data/iam/security-credentials/", (req, res) => {
  res.type("text/plain").send("zenith-hr-payroll-service-role");
});

app.get("/latest/meta-data/iam/security-credentials/zenith-hr-payroll-service-role", (req, res) => {
  res.json({
    Code: "Success",
    AccessKeyId: "AKIA-DECOY-EXAMPLE00000",
    SecretAccessKey: "decoy/secret/never-a-real-credential/0000000000000000",
    Token: "decoy-session-token-for-training-purposes-only",
    Expiration: new Date(Date.now() + 3600_000).toISOString(),
  });
});

app.get("/", (req, res) => {
  res.type("text/plain").send("internal-metadata decoy service (Zenith HR training environment)");
});

app.listen(8080, () => console.log("internal-metadata decoy listening on :8080"));
