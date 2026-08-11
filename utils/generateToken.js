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

  res.cookie("jwt", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });

  return token;
}

module.exports = generateToken;
