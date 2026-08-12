const express = require("express");
const {
  getListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
} = require("../controllers/listing.controller");
const { requireAuth } = require("../middleware/auth.middleware");
const {
  loadOwnedListing,
  requireActive,
} = require("../middleware/listing.middleware");

const router = express.Router();

router.get("/", requireAuth, getListings);
router.post("/", requireAuth, createListing);
router.get("/:id", requireAuth, getListingById);
router.patch(
  "/:id",
  requireAuth,
  loadOwnedListing,
  requireActive,
  updateListing,
);
router.delete("/:id", requireAuth, loadOwnedListing, deleteListing);

module.exports = router;
