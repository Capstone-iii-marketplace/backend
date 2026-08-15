const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");

// The handshake gives us the raw Cookie header, not parsed cookies —
// cookie-parser is Express middleware and doesn't run here.
function parseCookies(header = "") {
  return Object.fromEntries(
    header
      .split(";")
      .map((c) => c.trim().split("="))
      .filter(([k, v]) => k && v)
      .map(([k, ...v]) => [k, decodeURIComponent(v.join("="))]),
  );
}

function initSockets(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      // Without this the browser won't send the auth cookie on the handshake.
      credentials: true,
    },
  });

  // Runs once per connection, before any event handlers. Same token, same
  // secret as requireAuth — one source of truth for who a user is.
  io.use((socket, next) => {
    const { jwt: token } = parseCookies(socket.handshake.headers.cookie);
    if (!token) return next(new Error("Not signed in"));

    try {
      socket.user = jwt.verify(token, process.env.JWT_SECRET);
      next();
    } catch {
      next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`socket connected: ${socket.user.email}`);

    socket.on("disconnect", (reason) => {
      console.log(`socket disconnected: ${socket.user.email} (${reason})`);
    });
  });

  return io;
}

module.exports = { initSockets };