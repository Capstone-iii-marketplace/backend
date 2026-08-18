const jwt = require("jsonwebtoken");

// Signs the token AND sets it as an httpOnly cookie. Keep the cookie options
// here in one place — logout has to mirror them exactly or the browser won't
// overwrite the cookie.
function generateToken(user, res) {
  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
  );

  // Frontend and backend live on different domains in production
  // (vercel.app vs onrender.com), so the cookie has to be sent cross-site.
  // "none" requires "secure", which only works over HTTPS — fine in
  // production, but would silently drop the cookie over local http.
  const isProd = process.env.NODE_ENV === "production";
  res.cookie("jwt", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: isProd ? "none" : "strict",
    secure: isProd,
  });

  return token;
}

module.exports = generateToken;
