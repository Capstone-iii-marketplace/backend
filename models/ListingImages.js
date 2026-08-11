const { DataTypes } = require("sequelize");
const db = require("./db");

const ListingImage = db.define(
  "ListingImage",
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
    url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // Display order. The lowest position is the thumbnail shown in the feed.
    position: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    tableName: "listing_images",
    underscored: true,
  },
);

module.exports = ListingImage;
