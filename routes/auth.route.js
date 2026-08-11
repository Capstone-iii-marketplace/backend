const express = require("express");
const { signup, login, logout, me } = require("../controllers/auth.controller");
const { requireAuth } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
// No requireAuth — clearing an already-invalid cookie should still succeed.
router.post("/logout", logout);
router.get("/me", requireAuth, me);

module.exports = router;
