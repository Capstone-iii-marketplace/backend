const { DataTypes } = require("sequelize");
const db = require("./db");

const User = db.define(
  "User",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },

    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    verifiedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "users",
    underscored: true,

    defaultScope: {
      attributes: {
        exclude: ["passwordHash"],
      },
    },

    hooks: {
      beforeSave(user) {
        if (user.email) {
          user.email = user.email.toLowerCase().trim();
        }
      },
    },
  },
);

module.exports = User;
