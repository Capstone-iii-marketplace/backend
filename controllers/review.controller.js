const { fn, col } = require("sequelize");
const { Review, User } = require("../models");

const AUTHOR = { association: "author", attributes: ["id", "name"] };

async function getSellerReviews(req, res, next) {
  try {
    const { sellerId } = req.params;

    const reviews = await Review.findAll({
      where: { sellerId },
      include: [AUTHOR],
      order: [["createdAt", "DESC"]],
    });

    const [stats] = await Review.findAll({
      where: { sellerId },
      attributes: [
        [fn("AVG", col("rating")), "average"],
        [fn("COUNT", col("id")), "count"],
      ],
      raw: true,
    });

    res.json({
      reviews,
      summary: {
        // Postgres returns AVG as a string, and null when there are no rows.
        average: stats.average
          ? Number(Number(stats.average).toFixed(1))
          : null,
        count: Number(stats.count),
      },
    });
  } catch (err) {
    next(err);
  }
}

async function createReview(req, res, next) {
  try {
    const { sellerId, rating, body } = req.body || {};

    if (!sellerId) {
      return res.status(400).json({ error: "sellerId is required" });
    }
    if (sellerId === req.user.id) {
      return res.status(400).json({ error: "You can't review yourself" });
    }
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ error: "Rating must be a whole number from 1 to 5" });
    }

    const seller = await User.findByPk(sellerId);
    if (!seller) {
      return res.status(404).json({ error: "Seller not found" });
    }

    const review = await Review.create({
      sellerId,
      // From the session, never the body.
      authorId: req.user.id,
      rating,
      body: body?.trim() || null,
    });

    res.status(201).json({ review });
  } catch (err) {
    if (err.name === "SequelizeUniqueConstraintError") {
      return res
        .status(409)
        .json({ error: "You've already reviewed this seller" });
    }
    next(err);
  }
}

async function updateReview(req, res, next) {
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) return res.status(404).json({ error: "Review not found" });
    if (review.authorId !== req.user.id) {
      return res.status(403).json({ error: "That review isn't yours" });
    }

    const { rating, body } = req.body || {};
    if (rating !== undefined) {
      if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        return res
          .status(400)
          .json({ error: "Rating must be a whole number from 1 to 5" });
      }
      review.rating = rating;
    }
    if (body !== undefined) review.body = body?.trim() || null;

    await review.save();
    res.json({ review });
  } catch (err) {
    next(err);
  }
}

async function deleteReview(req, res, next) {
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) return res.status(404).json({ error: "Review not found" });
    if (review.authorId !== req.user.id) {
      return res.status(403).json({ error: "That review isn't yours" });
    }

    await review.destroy();
    res.json({ message: "Review removed" });
  } catch (err) {
    next(err);
  }
}

module.exports = { getSellerReviews, createReview, updateReview, deleteReview };
