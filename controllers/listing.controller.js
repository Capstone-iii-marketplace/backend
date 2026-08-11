const { Op } = require("sequelize");
const { Listing } = require("../models");

// Restricting attributes here keeps passwordHash from ever leaving the
// database, so the models can be returned to the client directly.
const SELLER = { association: "seller", attributes: ["id", "name"] };

async function getListings(req, res, next) {
  try {
    const { q } = req.query;
    const where = { status: "active" };

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

module.exports = { getListings, getListingById };
