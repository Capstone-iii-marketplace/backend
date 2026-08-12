const { Order } = require("../models");

const LISTING_WITH_SELLER = {
  association: "listing",
  include: [{ association: "seller", attributes: ["id", "name"] }],
};

async function getMyOrders(req, res, next) {
  try {
    const orders = await Order.findAll({
      where: { buyerId: req.user.id },
      include: [LISTING_WITH_SELLER],
      order: [["createdAt", "DESC"]],
    });

    res.json({ orders });
  } catch (err) {
    next(err);
  }
}

module.exports = { getMyOrders };
