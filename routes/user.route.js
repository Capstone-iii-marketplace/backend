const express = require("express");
const { getPublicUser } = require("../controllers/user.controller");

const router = express.Router();

// Public — no requireAuth. Anyone can view a seller's profile.
router.get("/:id", getPublicUser);

module.exports = router;
