const express = require("express");
const {
  getListings,
  getListingById,
} = require("../controllers/listing.controller");
const { requireAuth } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/", requireAuth, getListings);
router.get("/:id", requireAuth, getListingById);

module.exports = router;
