const { User } = require("../models");

// Public profile fields only — email and passwordHash must never leave the
// server. defaultScope excludes passwordHash but not email, so this has to
// be listed explicitly rather than relying on the model's default scope.
const PUBLIC_ATTRIBUTES = ["id", "name", "verifiedAt", "createdAt"];

const AVAILABLE_LISTINGS = {
  association: "listings",
  attributes: [
    "id",
    "title",
    "kind",
    "priceCents",
    "images",
    "status",
    "createdAt",
  ],
  where: { status: "available" },
  required: false,
  include: [
    { association: "seller", attributes: ["id", "name", "verifiedAt"] },
  ],
};

async function getPublicUser(req, res, next) {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: PUBLIC_ATTRIBUTES,
      include: [AVAILABLE_LISTINGS],
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ user });
  } catch (err) {
    next(err);
  }
}

module.exports = { getPublicUser };
