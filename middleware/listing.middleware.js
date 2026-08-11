const { Listing } = require("../models");

// Loads the listing and proves it's the caller's, then hands it to the
// controller as req.listing.
async function loadOwnedListing(req, res, next) {
  try {
    const listing = await Listing.findByPk(req.params.id);

    if (!listing || listing.status === "removed") {
      return res.status(404).json({ error: "Listing not found" });
    }
    if (listing.sellerId !== req.user.id) {
      return res.status(403).json({ error: "That listing isn't yours" });
    }

    req.listing = listing;
    next();
  } catch (err) {
    next(err);
  }
}

// Editing an item someone already reserved or bought changes settled terms.
function requireActive(req, res, next) {
  if (req.listing.status !== "active") {
    return res
      .status(409)
      .json({ error: `A ${req.listing.status} listing can't be edited` });
  }
  next();
}

module.exports = { loadOwnedListing, requireActive };
