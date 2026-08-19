const db = require("./db");
const User = require("./Users");
const Listing = require("./Listings");
const Conversation = require("./Conversations");
const Message = require("./Messages");
const Order = require("./Orders");
const Call = require("./Calls");
const Review = require("./Reviews");

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

Conversation.hasMany(Call, { foreignKey: "conversationId", as: "calls" });
Call.belongsTo(Conversation, {
  foreignKey: "conversationId",
  as: "conversation",
});

User.hasMany(Call, { foreignKey: "callerId", as: "outgoingCalls" });
Call.belongsTo(User, { foreignKey: "callerId", as: "caller" });

User.hasMany(Call, { foreignKey: "calleeId", as: "incomingCalls" });
Call.belongsTo(User, { foreignKey: "calleeId", as: "callee" });

User.hasMany(Review, { foreignKey: "sellerId", as: "reviewsReceived" });
Review.belongsTo(User, { foreignKey: "sellerId", as: "seller" });

User.hasMany(Review, { foreignKey: "authorId", as: "reviewsWritten" });
Review.belongsTo(User, { foreignKey: "authorId", as: "author" });

module.exports = {
  db,
  User,
  Listing,
  Conversation,
  Message,
  Order,
  Call,
  Review,
};
