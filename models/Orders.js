const { DataTypes } = require("sequelize");
const db = require("./db");

// One table for both payment paths. They differ by `method`, not by shape:
// online orders carry a stripe_session_id, in-person orders carry expires_at.
const Order = db.define(
  "Order",
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
    // Copied from the listing at purchase time — the seller may edit the
    // price later, and an order has to record what was actually agreed.
    amountCents: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 0 },
    },
    method: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { isIn: [["online", "in_person"]] },
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "pending",
      validate: { isIn: [["pending", "paid", "cancelled"]] },
    },
    // Unique so a retried Stripe webhook hits the constraint instead of
    // marking the same listing sold twice.
    stripeSessionId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    // In-person holds only: when the reservation lapses back to active.
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "orders",
    underscored: true,
  },
);

module.exports = Order;
