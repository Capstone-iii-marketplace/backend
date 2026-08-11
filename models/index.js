const db = require("./db");
const User = require("./Users");
const Listing = require("./Listings");
const Conversation = require("./Conversations");
const Message = require("./Messages");
const Order = require("./Orders");

User.hasMany(Listing, { foreignKey: "sellerId", as: "listings" });
Listing.belongsTo(User, { foreignKey: "sellerId", as: "seller" });

Listing.hasMany(Conversation, { foreignKey: "listingId", as: "conversations" });
Conversation.belongsTo(Listing, { foreignKey: "listingId", as: "listing" });

User.hasMany(Conversation, {
  foreignKey: "buyerId",
  as: "buyingConversations",
});
Conversation.belongsTo(User, { foreignKey: "buyerId", as: "buyer" });

Conversation.hasMany(Message, { foreignKey: "conversationId", as: "messages" });
Message.belongsTo(Conversation, {
  foreignKey: "conversationId",
  as: "conversation",
});

User.hasMany(Message, { foreignKey: "senderId", as: "messages" });
Message.belongsTo(User, { foreignKey: "senderId", as: "sender" });

Listing.hasMany(Order, { foreignKey: "listingId", as: "orders" });
Order.belongsTo(Listing, { foreignKey: "listingId", as: "listing" });

User.hasMany(Order, { foreignKey: "buyerId", as: "orders" });
Order.belongsTo(User, { foreignKey: "buyerId", as: "buyer" });

module.exports = {
  db,
  User,
  Listing,
  Conversation,
  Message,
  Order,
};
