const express = require("express");
const { handleStripeWebhook } = require("../controllers/order.controller");

const router = express.Router();

// Stripe signs the raw request body, so this route needs the unparsed
// buffer — it must stay ahead of the app-wide express.json() in app.js,
// or the signature check in the controller always fails.
router.post(
  "/stripe",
  express.raw({ type: "application/json" }),
  handleStripeWebhook,
);

module.exports = router;
