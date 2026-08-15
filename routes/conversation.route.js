const express = require("express");
const {
  getMyConversations,
  createOrFindConversation,
  getMessages,
} = require("../controllers/conversation.controller");
const { requireAuth } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/", requireAuth, getMyConversations);
router.post("/", requireAuth, createOrFindConversation);
router.get("/:id/messages", requireAuth, getMessages);

module.exports = router;