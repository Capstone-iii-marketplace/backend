const { User } = require("../models");

async function getUserProfile(req, res, next) {
  try {
    const profile = await User.findByPk(req.params.id, {
      attributes: [
        "id",
        "name",
        "major",
        "semester",
        "avatarUrl",
        "verifiedAt",
        "createdAt",
      ],
      include: [
        {
          association: "listings",
          where: { status: "available" },
          required: false,
          attributes: [
            "id",
            "title",
            "priceCents",
            "status",
            "kind",
            "images",
            "createdAt",
          ],
        },
      ],
    });

    if (!profile) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ user: profile });
  } catch (err) {
    next(err);
  }
}

module.exports = { getUserProfile };
