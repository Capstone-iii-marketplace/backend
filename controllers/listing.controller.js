const { Op } = require("sequelize");
const { Listing } = require("../models");
const { validateListing } = require("../utils/validateListing");

// Restricting attributes here keeps passwordHash from ever leaving the
// database, so the models can be returned to the client directly.
const SELLER = { association: "seller", attributes: ["id", "name"] };

async function getListings(req, res, next) {
  try {
    const { q } = req.query;
    const where = { status: "available" };

    if (q?.trim()) {
      where.title = { [Op.iLike]: `%${q.trim()}%` };
    }

    const listings = await Listing.findAll({
      where,
      include: [SELLER],
      order: [["createdAt", "DESC"]],
    });

    res.json({ listings });
  } catch (err) {
    next(err);
  }
}

async function getMyListings(req, res, next) {
  try {
    const listings = await Listing.findAll({
      where: { sellerId: req.user.id },
      include: [SELLER],
      order: [["createdAt", "DESC"]],
    });

    res.json({ listings });
  } catch (err) {
    next(err);
  }
}

async function getListingById(req, res, next) {
  try {
    const listing = await Listing.findByPk(req.params.id, {
      include: [SELLER],
    });

    if (!listing || listing.status === "removed") {
      return res.status(404).json({ error: "Listing not found" });
    }

    res.json({ listing });
  } catch (err) {
    next(err);
  }
}

async function createListing(req, res, next) {
  try {
    const { error, values } = validateListing(req.body);
    if (error) return res.status(400).json({ error });

    // sellerId from the cookie, never the body.
    const listing = await Listing.create({ ...values, sellerId: req.user.id });
    res.status(201).json({ listing });
  } catch (err) {
    next(err);
  }
}

async function updateListing(req, res, next) {
  try {
    const { error, values } = validateListing(req.body, { partial: true });
    if (error) return res.status(400).json({ error });

    await req.listing.update(values);
    res.json({ listing: req.listing });
  } catch (err) {
    next(err);
  }
}

async function deleteListing(req, res, next) {
  try {
    // Soft delete — orders and conversations point at this row.
    await req.listing.update({ status: "removed" });
    res.json({ message: "Listing removed" });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getListings,
  getMyListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
};
