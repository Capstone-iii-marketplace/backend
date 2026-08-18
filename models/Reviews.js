const { DataTypes } = require("sequelize");
const db = require("./db");

const Review = db.define(
  "Review",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    sellerId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    authorId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1, max: 5, isInt: true },
    },
    // Optional — a rating with no words is still worth keeping.
    body: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "reviews",
    underscored: true,
    // One review per person per seller, enforced by the database so no
    // code path can create a duplicate.
    indexes: [{ unique: true, fields: ["seller_id", "author_id"] }],
  },
);

module.exports = Review;
