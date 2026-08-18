const express = require("express");
const { getUserProfile } = require("../controllers/users.controller");
const { requireAuth } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/:id", requireAuth, getUserProfile);

module.exports = router;
