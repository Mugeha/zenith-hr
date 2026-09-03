const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config/env");

function issueToken(user) {
  return jwt.sign(
    { sub: user.id, role: user.role, email: user.email },
    jwtSecret,
    { algorithm: "HS256", expiresIn: "12h" }
  );
}

function verifyToken(token) {
  return jwt.verify(token, jwtSecret, { algorithms: ["HS256"] });
}

module.exports = { issueToken, verifyToken };
