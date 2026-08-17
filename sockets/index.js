const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");
const { Message, User } = require("../models");
const { loadIfParticipant } = require("../controllers/conversation.controller");
const { registerCallHandlers } = require("./call");

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

      // Personal room so a user can be reached by id from anywhere — used to
    // ring them and to address signaling payloads.
    socket.join(`user:${socket.user.id}`);
    registerCallHandlers(io, socket);

    // Rooms are per-conversation. Membership is checked here, server-side —
    // a client asking to join a thread it isn't part of gets nothing.
    socket.on("conversation:join", async (conversationId, ack) => {
      const conversation = await loadIfParticipant(
        conversationId,
        socket.user.id,
      );
      if (!conversation) {
        return ack?.({ error: "Conversation not found" });
      }

      socket.join(`conversation:${conversationId}`);
      ack?.({ ok: true });
    });

    socket.on("conversation:leave", (conversationId) => {
      socket.leave(`conversation:${conversationId}`);
    });

    socket.on("message:send", async ({ conversationId, body } = {}, ack) => {
      try {
        if (!body?.trim()) return ack?.({ error: "Message can't be empty" });

        // Re-check on every send. Joining a room once doesn't license
        // sending forever — the listing could have changed hands.
        const conversation = await loadIfParticipant(
          conversationId,
          socket.user.id,
        );
        if (!conversation) return ack?.({ error: "Conversation not found" });

        // Persist before broadcast: a refresh has to show history, and an
        // offline recipient can't lose the message.
        const saved = await Message.create({
          conversationId,
          senderId: socket.user.id,
          body: body.trim(),
        });

        // Bumps updatedAt so the inbox sorts by most recent activity.
        await conversation.changed("updatedAt", true);
        await conversation.save();

          // The JWT payload only carries id and email, so the display name
        // has to come from the database.
        const sender = await User.findByPk(socket.user.id, {
          attributes: ["id", "name"],
        });

       const payload = {
          id: saved.id,
          conversationId,
          body: saved.body,
          createdAt: saved.createdAt,
          sender: { id: sender.id, name: sender.name },
        };

    io.to(`conversation:${conversationId}`).emit("message:new", payload);

        const recipientId =
          conversation.buyerId === socket.user.id
            ? conversation.listing.sellerId
            : conversation.buyerId;

        // Anyone in the conversation room already got message:new above.
        // Only ping the recipient's personal room if they aren't viewing
        // the thread — otherwise they'd receive the same message twice.
        const room = io.sockets.adapter.rooms.get(
          `conversation:${conversationId}`,
        );
        const recipientSockets = await io
          .in(`user:${recipientId}`)
          .fetchSockets();
        const isViewing = recipientSockets.some((s) => room?.has(s.id));

        if (!isViewing) {
          io.to(`user:${recipientId}`).emit("notification:message", {
            ...payload,
            listingTitle: conversation.listing.title,
          });
        }

        ack?.({ ok: true, message: payload });

        io.to(`conversation:${conversationId}`).emit("message:new", payload);
        ack?.({ ok: true, message: payload });
      } catch (err) {
        console.error("message:send failed", err);
        ack?.({ error: "Could not send message" });
      }
    });

    socket.on("disconnect", (reason) => {
      console.log(`socket disconnected: ${socket.user.email} (${reason})`);
    });
  });

  return io;
}

module.exports = { initSockets };