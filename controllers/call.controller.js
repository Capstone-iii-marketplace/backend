const { Op } = require("sequelize");
const { Call } = require("../models");

const CALLER = { association: "caller", attributes: ["id", "name"] };
const CALLEE = { association: "callee", attributes: ["id", "name"] };
const CONVERSATION_WITH_LISTING = {
  association: "conversation",
  attributes: ["id"],
  include: [{ association: "listing", attributes: ["id", "title"] }],
};

async function getMyCalls(req, res, next) {
  try {
    const calls = await Call.findAll({
      where: {
        [Op.or]: [{ callerId: req.user.id }, { calleeId: req.user.id }],
      },
      include: [CALLER, CALLEE, CONVERSATION_WITH_LISTING],
      order: [["createdAt", "DESC"]],
      limit: 10,
    });

    res.json({ calls });
  } catch (err) {
    next(err);
  }
}

module.exports = { getMyCalls };
