const jwt = require("jsonwebtoken");

// Signs the token AND sets it as an httpOnly cookie. Keep the cookie options
// here in one place — logout has to mirror them exactly or the browser won't
// overwrite the cookie.
//
// In production the frontend (Vercel) and backend (Render) are on different
// domains, so this cookie is cross-site: it needs sameSite:"none", which
// browsers only honor alongside secure:true — otherwise mobile browsers
// (Safari/Chrome-iOS ITP in particular) silently drop it. Locally, frontend
// and backend are both on localhost (same-site, just different ports) over
// plain http, where secure:true would stop the cookie from being set at all.
const isProduction = process.env.NODE_ENV === "production";
const cookieOptions = {
  httpOnly: true,
  sameSite: isProduction ? "none" : "lax",
  secure: isProduction,
};

function generateToken(user, res) {
  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
  );

  res.cookie("jwt", token, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return token;
}

module.exports = generateToken;
module.exports.cookieOptions = cookieOptions;
