const express = require("express");
const {
  getMyOrders,
  createCheckoutSession,
} = require("../controllers/order.controller");
const { requireAuth } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/mine", requireAuth, getMyOrders);
router.post("/checkout-session", requireAuth, createCheckoutSession);

module.exports = router;
