const { DataTypes } = require("sequelize");
const db = require("./db");

const Conversation = db.define(
  "Conversation",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    listingId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    buyerId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    tableName: "conversations",
    underscored: true,
    indexes: [{ unique: true, fields: ["listing_id", "buyer_id"] }],
  },
);

module.exports = Conversation;
