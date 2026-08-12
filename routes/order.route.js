const express = require("express");
const { getMyOrders } = require("../controllers/order.controller");
const { requireAuth } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/mine", requireAuth, getMyOrders);

module.exports = router;
