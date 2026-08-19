const jwt = require("jsonwebtoken");

function requireAuth(req, res, next) {
  const token = req.cookies?.jwt; // will crash if the cookies are undefined

  if (!token) {
    return res.status(401).json({ error: "Not signed in" });
  }

  try {
    // Throws on a bad signature or an expired token.
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

module.exports = { requireAuth };
