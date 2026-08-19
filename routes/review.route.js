const express = require("express");
const {
  getSellerReviews,
  createReview,
  updateReview,
  deleteReview,
} = require("../controllers/review.controller");
const { requireAuth } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/seller/:sellerId", requireAuth, getSellerReviews);
router.post("/", requireAuth, createReview);
router.patch("/:id", requireAuth, updateReview);
router.delete("/:id", requireAuth, deleteReview);

module.exports = router;
