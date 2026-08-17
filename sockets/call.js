const { Call, Conversation, User } = require("../models");
const { Op } = require("sequelize");
const { loadIfParticipant } = require("../controllers/conversation.controller");

// The other participant in a conversation: buyer and seller are the only two,
// and the seller is whoever owns the listing.
function otherParticipantId(conversation, userId) {
  return conversation.buyerId === userId
    ? conversation.listing.sellerId
    : conversation.buyerId;
}

// Signaling only — the server relays SDP and ICE between two authenticated
// users and never touches media. Payloads are addressed by user id rather
// than broadcast to the room, so the same events work unchanged when a
// stream has several peers instead of one.
function registerCallHandlers(io, socket) {
  const userId = socket.user.id;

  socket.on("call:invite", async ({ conversationId } = {}, ack) => {
    try {
      const conversation = await loadIfParticipant(conversationId, userId);
      if (!conversation) return ack?.({ error: "Conversation not found" });

      const calleeId = otherParticipantId(conversation, userId);

      const call = await Call.create({
        conversationId,
        callerId: userId,
        calleeId,
        status: "ringing",
      });

      const caller = await User.findByPk(userId, { attributes: ["id", "name"] });

      // Personal room, not the conversation room — the callee should ring
      // even if they don't have the thread open.
      io.to(`user:${calleeId}`).emit("call:incoming", {
        callId: call.id,
        conversationId,
        from: { id: caller.id, name: caller.name },
      });

      ack?.({ ok: true, callId: call.id, calleeId });
    } catch (err) {
      console.error("call:invite failed", err);
      ack?.({ error: "Could not start call" });
    }
  });

  socket.on("call:accept", async ({ callId } = {}, ack) => {
    try {
      const call = await Call.findByPk(callId);
      if (!call || call.calleeId !== userId) {
        return ack?.({ error: "Call not found" });
      }
      if (call.status !== "ringing") {
        return ack?.({ error: "Call is no longer ringing" });
      }

      await call.update({ status: "active", startedAt: new Date() });

      // The caller creates the offer once the callee is ready to receive it.
      io.to(`user:${call.callerId}`).emit("call:accepted", {
        callId: call.id,
        peerId: userId,
      });

      ack?.({ ok: true, callId: call.id, peerId: call.callerId });
    } catch (err) {
      console.error("call:accept failed", err);
      ack?.({ error: "Could not accept call" });
    }
  });

  socket.on("call:decline", async ({ callId } = {}) => {
    const call = await Call.findByPk(callId);
    if (!call || call.calleeId !== userId || call.status !== "ringing") return;

    await call.update({ status: "declined", endedAt: new Date() });
    io.to(`user:${call.callerId}`).emit("call:ended", {
      callId: call.id,
      reason: "declined",
    });
  });

  socket.on("call:end", async ({ callId } = {}) => {
    const call = await Call.findByPk(callId);
    if (!call) return;
    if (call.callerId !== userId && call.calleeId !== userId) return;
    if (call.status === "ended" || call.status === "declined") return;

    // A call that never connected was missed, not ended.
    await call.update({
      status: call.status === "ringing" ? "missed" : "ended",
      endedAt: new Date(),
    });

    const otherId = call.callerId === userId ? call.calleeId : call.callerId;
    io.to(`user:${otherId}`).emit("call:ended", {
      callId: call.id,
      reason: "hangup",
    });
  });

  // Relay. Each payload carries `to` so the same three events serve a 1:1
  // call and a multi-peer stream without changes.
  for (const event of ["signal:offer", "signal:answer", "signal:ice"]) {
    socket.on(event, ({ to, callId, data } = {}) => {
      if (!to) return;
      io.to(`user:${to}`).emit(event, { from: userId, callId, data });
    });
  }

  socket.on("disconnect", async () => {
    // A user can be connected from several places at once. Only clean up
    // when their last session goes — otherwise closing one tab would kill
    // a call still running in another.
    const remaining = io.sockets.adapter.rooms.get(`user:${userId}`)?.size ?? 0;
    if (remaining > 0) return;

    const open = await Call.findAll({
      where: {
        status: { [Op.in]: ["ringing", "active"] },
        [Op.or]: [{ callerId: userId }, { calleeId: userId }],
      },
    });

    for (const call of open) {
      await call.update({
        status: call.status === "ringing" ? "missed" : "ended",
        endedAt: new Date(),
      });

      const otherId = call.callerId === userId ? call.calleeId : call.callerId;
      io.to(`user:${otherId}`).emit("call:ended", {
        callId: call.id,
        reason: "peer-disconnected",
      });
    }
  });
}

module.exports = { registerCallHandlers };