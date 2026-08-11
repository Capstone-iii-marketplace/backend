require("dotenv").config();
const bcrypt = require("bcrypt");
const {
  db,
  User,
  Listing,
  ListingImage,
  Conversation,
  Message,
  Order,
} = require("./models");

async function seed() {
  // force: true drops and recreates every table — dev only.
  await db.sync({ force: true });
  console.log("Tables created");

  const passwordHash = await bcrypt.hash("password123", 10);

  const [alice, bob, carlos, dana] = await User.bulkCreate(
    [
      {
        email: "alice@qc.cuny.edu",
        passwordHash,
        name: "Alice Chen",
        verifiedAt: new Date(),
      },
      {
        email: "bob@qc.cuny.edu",
        passwordHash,
        name: "Bob Rivera",
        verifiedAt: new Date(),
      },
      {
        email: "carlos@qc.cuny.edu",
        passwordHash,
        name: "Carlos Mendez",
        verifiedAt: new Date(),
      },
      {
        email: "dana@brooklyn.cuny.edu",
        passwordHash,
        name: "Dana Okafor",
        verifiedAt: null, // unverified — use this one to test the gate
      },
    ],
    { returning: true },
  );

  const listings = await Listing.bulkCreate(
    [
      {
        sellerId: alice.id,
        title: "Calculus: Early Transcendentals, 8th ed.",
        priceCents: 4500,
        paymentMethods: "both",
      },
      {
        sellerId: alice.id,
        title: "Organic Chemistry as a Second Language",
        priceCents: 2200,
        paymentMethods: "in_person",
      },
      {
        sellerId: alice.id,
        title: "TI-84 Plus graphing calculator",
        priceCents: 6000,
        paymentMethods: "both",
      },
      {
        sellerId: bob.id,
        title: "IKEA desk lamp, barely used",
        priceCents: 1200,
        paymentMethods: "in_person",
      },
      {
        sellerId: bob.id,
        title: "Mini fridge, 3.2 cu ft",
        priceCents: 8500,
        paymentMethods: "in_person",
      },
      {
        sellerId: bob.id,
        title: "Campbell Biology, 12th ed.",
        priceCents: 5500,
        status: "pending",
        paymentMethods: "both",
      },
      {
        sellerId: carlos.id,
        title: "Winter coat, size M",
        priceCents: 3000,
        paymentMethods: "both",
      },
      {
        sellerId: carlos.id,
        title: "Mechanical keyboard, brown switches",
        priceCents: 4000,
        paymentMethods: "online",
      },
      {
        sellerId: carlos.id,
        title: "Intro to Psychology, 5th ed.",
        priceCents: 1800,
        status: "sold",
        paymentMethods: "both",
      },
      {
        sellerId: dana.id,
        title: "Desk chair, ergonomic",
        priceCents: 5000,
        paymentMethods: "in_person",
      },
    ],
    { returning: true },
  );

  const [calculus, orgo, calculator, lamp, fridge, biology] = listings;
  const psych = listings[8];

  // Placeholder images. Real ones land in S3/Cloudinary once uploads exist.
  await ListingImage.bulkCreate([
    { listingId: calculus.id, url: "https://placehold.co/600x400?text=Calculus", position: 0 },
    { listingId: calculus.id, url: "https://placehold.co/600x400?text=Back+cover", position: 1 },
    { listingId: calculus.id, url: "https://placehold.co/600x400?text=Inside", position: 2 },
    { listingId: orgo.id, url: "https://placehold.co/600x400?text=Orgo", position: 0 },
    { listingId: calculator.id, url: "https://placehold.co/600x400?text=TI-84", position: 0 },
    { listingId: calculator.id, url: "https://placehold.co/600x400?text=Screen", position: 1 },
    { listingId: lamp.id, url: "https://placehold.co/600x400?text=Lamp", position: 0 },
    { listingId: fridge.id, url: "https://placehold.co/600x400?text=Fridge", position: 0 },
  ]);

  const conversation = await Conversation.create({
    listingId: calculus.id,
    buyerId: bob.id,
  });

  await Message.bulkCreate([
    {
      conversationId: conversation.id,
      senderId: bob.id,
      body: "Hi! Is this still available?",
    },
    { conversationId: conversation.id, senderId: alice.id, body: "Yes it is." },
    {
      conversationId: conversation.id,
      senderId: bob.id,
      body: "Would you take $35?",
    },
    {
      conversationId: conversation.id,
      senderId: alice.id,
      body: "$40 and it's yours.",
    },
  ]);

  // A second thread, so the inbox has more than one row.
  const secondConversation = await Conversation.create({
    listingId: fridge.id,
    buyerId: carlos.id,
  });

  await Message.bulkCreate([
    {
      conversationId: secondConversation.id,
      senderId: carlos.id,
      body: "Does it still have the shelf inside?",
    },
    {
      conversationId: secondConversation.id,
      senderId: bob.id,
      body: "It does, and the freezer tray too.",
    },
  ]);

  // Orders that match the listing statuses above — a sold listing with no
  // order behind it describes a sale that never happened.
  await Order.bulkCreate([
    {
      listingId: psych.id,
      buyerId: bob.id,
      amountCents: psych.priceCents,
      method: "online",
      status: "paid",
      stripeSessionId: "cs_test_seeded_example_0001",
    },
    {
      listingId: biology.id,
      buyerId: carlos.id,
      amountCents: biology.priceCents,
      method: "in_person",
      status: "pending",
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  ]);

  // Prove the associations actually work.
  const check = await Conversation.findOne({
    where: { id: conversation.id },
    include: [
      { association: "messages" },
      { association: "buyer" },
      {
        association: "listing",
        include: [{ association: "seller" }, { association: "images" }],
      },
    ],
    order: [[{ model: Message, as: "messages" }, "createdAt", "ASC"]],
  });

  console.log(
    `\nListing: ${check.listing.title} — sold by ${check.listing.seller.name}`,
  );
  console.log(`Photos: ${check.listing.images.length}`);
  console.log(`Buyer: ${check.buyer.name}`);
  check.messages.forEach((m) => {
    const who =
      m.senderId === check.buyerId
        ? check.buyer.name
        : check.listing.seller.name;
    console.log(`  ${who}: ${m.body}`);
  });

  const counts = {
    users: await User.count(),
    listings: await Listing.count(),
    active: await Listing.count({ where: { status: "active" } }),
    images: await ListingImage.count(),
    conversations: await Conversation.count(),
    messages: await Message.count(),
    orders: await Order.count(),
  };
  console.log("\nSeeded:", counts);

  await db.close();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
