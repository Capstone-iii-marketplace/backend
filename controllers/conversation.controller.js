const { Op } = require("sequelize");
const { Conversation, Message, Listing, User, db } = require("../models");

const LISTING = {
  association: "listing",
  attributes: [
    "id",
    "title",
    "kind",
    "priceCents",
    "images",
    "sellerId",
    "status",
  ],
  include: [
    { association: "seller", attributes: ["id", "name", "verifiedAt"] },
  ],
};
const BUYER = {
  association: "buyer",
  attributes: ["id", "name", "verifiedAt"],
};

// Conversations don't store a sellerId — the seller is whoever owns the
// listing. Every access check has to load the listing to know that.
async function loadIfParticipant(conversationId, userId) {
  const conversation = await Conversation.findByPk(conversationId, {
    include: [LISTING, BUYER],
  });
  if (!conversation) return null;

  const isBuyer = conversation.buyerId === userId;
  const isSeller = conversation.listing.sellerId === userId;
  return isBuyer || isSeller ? conversation : null;
}

// Every thread this user is in, as buyer or as seller.
async function getMyConversations(req, res, next) {
  try {
    const conversations = await Conversation.findAll({
      include: [LISTING, BUYER],
      where: {
        [Op.or]: [
          { buyerId: req.user.id },
          { "$listing.seller_id$": req.user.id },
        ],
      },
      order: [["updatedAt", "DESC"]],
    });

    // One extra grouped query rather than N+1 — how many unread messages
    // (sent by the other participant) sit in each thread.
    const unreadRows = await Message.findAll({
      attributes: ["conversationId", [db.fn("COUNT", db.col("id")), "count"]],
      where: {
        conversationId: conversations.map((c) => c.id),
        senderId: { [Op.ne]: req.user.id },
        readAt: null,
      },
      group: ["conversationId"],
      raw: true,
    });
    const unreadByConversation = Object.fromEntries(
      unreadRows.map((r) => [r.conversationId, Number(r.count)]),
    );

    const withUnread = conversations.map((c) => ({
      ...c.toJSON(),
      unreadCount: unreadByConversation[c.id] ?? 0,
    }));

    res.json({ conversations: withUnread });
  } catch (err) {
    next(err);
  }
}

// Opening a chat is idempotent — the unique (listing_id, buyer_id) index
// means "message seller" twice returns the same thread, never a duplicate.
async function createOrFindConversation(req, res, next) {
  try {
    const { listingId } = req.body ?? {};
    if (!listingId) {
      return res.status(400).json({ error: "listingId is required" });
    }

    const listing = await Listing.findByPk(listingId);
    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }
    if (listing.sellerId === req.user.id) {
      return res.status(400).json({ error: "You can't message your own listing" });
    }

    const [conversation] = await Conversation.findOrCreate({
      where: { listingId, buyerId: req.user.id },
    });

    const full = await Conversation.findByPk(conversation.id, {
      include: [LISTING, BUYER],
    });

    res.status(201).json({ conversation: full });
  } catch (err) {
    next(err);
  }
}

async function getMessages(req, res, next) {
  try {
    const conversation = await loadIfParticipant(req.params.id, req.user.id);
    if (!conversation) {
      // 404 rather than 403 — don't confirm a thread exists to outsiders.
      return res.status(404).json({ error: "Conversation not found" });
    }

    const messages = await Message.findAll({
      where: { conversationId: conversation.id },
      include: [{ association: "sender", attributes: ["id", "name"] }],
      order: [["createdAt", "ASC"]],
    });

    res.json({ conversation, messages });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getMyConversations,
  createOrFindConversation,
  getMessages,
  loadIfParticipant,
};