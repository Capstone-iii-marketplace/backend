const { DataTypes } = require("sequelize");
const db = require("./db");

const Listing = db.define(
  "Listing",
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
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    priceCents: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 0 },
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "available",
      validate: { isIn: [["available", "pending", "sold", "removed"]] },
    },
    // Drives both the category tabs on the dashboard and which purchase
    // button the detail page shows (add-to-cart vs. book-a-session).
    kind: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "item",
      validate: { isIn: [["item", "session", "post"]] },
    },
    // What the seller accepts. A seller with no Stripe setup can only offer
    // in_person, so this is set per listing rather than per account.
    paymentMethods: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "both",
      validate: { isIn: [["online", "in_person", "both"]] },
    },
    // Cloudinary secure_urls. Postgres arrays mean no join and no second
    // table — index 0 is the thumbnail.
    images: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      allowNull: false,
      defaultValue: [],
    },
  },
  {
    tableName: "listings",
    underscored: true,
  },
);

module.exports = Listing;
