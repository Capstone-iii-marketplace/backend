const { DataTypes } = require("sequelize");
const db = require("./db");

const Call = db.define(
  "Call",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    conversationId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    callerId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    calleeId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    status: {
      // ringing → active → ended is the happy path. declined and missed are
      // both terminal states a call can reach without ever connecting.
      type: DataTypes.ENUM("ringing", "active", "ended", "declined", "missed"),
      allowNull: false,
      defaultValue: "ringing",
    },
    // Null until the callee accepts — a declined call has no startedAt.
    startedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    endedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "calls",
    underscored: true,
  },
);

module.exports = Call;