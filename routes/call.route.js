const express = require("express");
const { getMyCalls } = require("../controllers/call.controller");
const { requireAuth } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/mine", requireAuth, getMyCalls);

module.exports = router;
