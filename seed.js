require("dotenv").config();
const bcrypt = require("bcrypt");
const { db, User, Listing, Conversation, Message, Order } = require("./models");

async function seed() {
  // force: true drops and recreates every table — dev only.
  await db.sync({ force: true });
  console.log("Tables created");

  const passwordHash = await bcrypt.hash("password123", 10);

  const [alice, bob, carlos, dana, jayden, sofia] = await User.bulkCreate(
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
      {
        email: "jayden@bmcc.cuny.edu",
        passwordHash,
        name: "Jayden Osei",
        verifiedAt: new Date(),
      },
      {
        email: "sofia@hunter.cuny.edu",
        passwordHash,
        name: "Sofia Ramirez",
        verifiedAt: new Date(),
      },
    ],
    { returning: true },
  );

  // Real photos from picsum.photos. The seed in the URL keeps each listing's
  // image stable across reseeds, so the demo looks the same every run.
  const listings = await Listing.bulkCreate(
    [
      // ---- item: textbooks ----
      {
        sellerId: alice.id,
        kind: "item",
        title: "Calculus: Early Transcendentals, 8th ed.",
        description:
          "Used for MAT 201/202. Some highlighting in ch. 1-4, rest is clean. Comes with the WebAssign access code still unused (didn't end up needing it).",
        priceCents: 4500,
        paymentMethods: "both",
        images: [
          "https://picsum.photos/seed/calculus1/600/400",
          "https://picsum.photos/seed/calculus2/600/400",
          "https://picsum.photos/seed/calculus3/600/400",
        ],
      },
      {
        sellerId: alice.id,
        kind: "item",
        title: "Organic Chemistry as a Second Language",
        description:
          "The supplement everyone actually reads instead of the $300 textbook. Spine's a little cracked but every page is intact.",
        priceCents: 2200,
        paymentMethods: "in_person",
        images: ["https://picsum.photos/seed/orgo1/600/400"],
      },
      {
        sellerId: alice.id,
        kind: "item",
        title: "TI-84 Plus graphing calculator",
        description:
          "Had this since high school, still works perfectly. Wiping it back to factory before handoff. Comes with the USB cable and a case.",
        priceCents: 6000,
        paymentMethods: "both",
        images: [
          "https://picsum.photos/seed/ti84a/600/400",
          "https://picsum.photos/seed/ti84b/600/400",
        ],
      },
      {
        sellerId: bob.id,
        kind: "item",
        title: "IKEA desk lamp, barely used",
        description:
          "Bought for the dorm, ended up using the overhead light instead. Warm/cool switch still works, no flicker.",
        priceCents: 1200,
        paymentMethods: "in_person",
        images: ["https://picsum.photos/seed/desklamp/600/400"],
      },
      {
        sellerId: bob.id,
        kind: "item",
        title: "Mini fridge, 3.2 cu ft",
        description:
          "Moving out of the dorm and can't take this home on the train. Runs quiet, freezer tray included. Pickup only — it's heavier than it looks.",
        priceCents: 8500,
        paymentMethods: "in_person",
        images: [
          "https://picsum.photos/seed/fridge1/600/400",
          "https://picsum.photos/seed/fridge2/600/400",
        ],
      },
      {
        sellerId: bob.id,
        kind: "item",
        title: "Campbell Biology, 12th ed.",
        description:
          "Needed for BIO 201/202 sequence. Bought new, sold no highlighter marks — I typed my notes instead.",
        priceCents: 5500,
        status: "pending",
        paymentMethods: "both",
        images: ["https://picsum.photos/seed/biology1/600/400"],
      },
      {
        sellerId: carlos.id,
        kind: "item",
        title: "Winter coat, size M",
        description:
          "North Face knockoff but genuinely warm — survived two winters commuting from the Bronx. No rips, zipper's solid.",
        priceCents: 3000,
        paymentMethods: "both",
        images: [
          "https://picsum.photos/seed/coat1/600/400",
          "https://picsum.photos/seed/coat2/600/400",
        ],
      },
      {
        sellerId: carlos.id,
        kind: "item",
        title: "Mechanical keyboard, brown switches",
        description:
          "Used it through two semesters of CS problem sets. Keycaps a little shiny on WASD, everything else like new. Quiet-ish for a mech board.",
        priceCents: 4000,
        paymentMethods: "online",
        images: ["https://picsum.photos/seed/keyboard1/600/400"],
      },
      {
        sellerId: carlos.id,
        kind: "item",
        title: "Intro to Psychology, 5th ed.",
        description: "PSY 100 textbook, sold already but leaving this up as a reference for the price.",
        priceCents: 1800,
        status: "sold",
        paymentMethods: "both",
        images: ["https://picsum.photos/seed/psych1/600/400"],
      },
      {
        sellerId: dana.id,
        kind: "item",
        title: "Desk chair, ergonomic",
        description:
          "Lumbar support actually works — my back thanks me. Selling because I'm switching to a standing desk, not because anything's wrong with it.",
        priceCents: 5000,
        paymentMethods: "in_person",
        images: ["https://picsum.photos/seed/chair1/600/400"],
      },
      {
        sellerId: jayden.id,
        kind: "item",
        title: "TI-Nspire CX CAS (color screen)",
        description:
          "Nicer than the TI-84 if your professor allows CAS calculators — check your syllabus first. Charger included.",
        priceCents: 7000,
        paymentMethods: "both",
        images: ["https://picsum.photos/seed/nspire1/600/400"],
      },
      {
        sellerId: sofia.id,
        kind: "item",
        title: "Twin XL sheets + comforter set (navy)",
        description:
          "Dorm-sized twin XL, washed once. Comforter, fitted sheet, flat sheet, one pillowcase. No stains, just downsizing before I move off-campus.",
        priceCents: 2500,
        paymentMethods: "in_person",
        images: ["https://picsum.photos/seed/sheets1/600/400"],
      },
      {
        sellerId: jayden.id,
        kind: "item",
        title: "Financial Accounting (BMCC custom edition) + access code",
        description:
          "The overpriced custom-bundle edition required for ACC 122. Access code is unused/unscratched — this is the expensive part, the book itself is secondary.",
        priceCents: 9500,
        paymentMethods: "both",
        images: ["https://picsum.photos/seed/accounting1/600/400"],
      },
      {
        sellerId: sofia.id,
        kind: "item",
        title: "Mini microwave, dorm-safe (700W)",
        description:
          "Under the wattage cap for most dorm policies — check yours before buying. Interior's clean, turntable spins fine.",
        priceCents: 3500,
        paymentMethods: "in_person",
        images: ["https://picsum.photos/seed/microwave1/600/400"],
      },

      // ---- session: tutoring, priced per hour, delivered over video call ----
      {
        sellerId: alice.id,
        kind: "session",
        title: "Calc II tutoring — series, integration tricks, exam prep",
        description:
          "I TA'd for MAT 202 last semester. Best for u-sub/by-parts practice and getting series convergence tests to actually click. Bring your homework or a past exam and we'll work through it live.",
        priceCents: 2500,
        paymentMethods: "online",
        images: ["https://picsum.photos/seed/calctutor/600/400"],
      },
      {
        sellerId: alice.id,
        kind: "session",
        title: "Organic Chem problem-set walkthroughs",
        description:
          "Mechanisms, not memorization — I'll show you how to reason through a synthesis instead of flashcarding it. One hour, screen-share, your problem set open.",
        priceCents: 3000,
        paymentMethods: "online",
        images: ["https://picsum.photos/seed/orgotutor/600/400"],
      },
      {
        sellerId: carlos.id,
        kind: "session",
        title: "Intro Stats (MAT 150) homework help",
        description:
          "Hypothesis testing, confidence intervals, and reading the output your professor's software spits out without panicking. I passed with a 94.",
        priceCents: 2000,
        paymentMethods: "online",
        images: ["https://picsum.photos/seed/stattutor/600/400"],
      },
      {
        sellerId: bob.id,
        kind: "session",
        title: "Python debugging + CSC 210 concepts",
        description:
          "Stuck on a recursion bug at 1am? Same. I'll help you actually understand the traceback instead of just fixing the one line. Loops, recursion, basic data structures.",
        priceCents: 2800,
        paymentMethods: "online",
        images: ["https://picsum.photos/seed/pythontutor/600/400"],
      },
      {
        sellerId: jayden.id,
        kind: "session",
        title: "Excel & Google Sheets for accounting majors",
        description:
          "VLOOKUP, pivot tables, and the formulas ACC 122/222 actually test you on. I work part-time doing bookkeeping so this isn't just textbook stuff.",
        priceCents: 1800,
        paymentMethods: "online",
        images: ["https://picsum.photos/seed/exceltutor/600/400"],
      },
      {
        sellerId: sofia.id,
        kind: "session",
        title: "Essay editing & MLA/APA formatting help",
        description:
          "I'll read your draft beforehand and we'll go through structure, citations, and the sentences that are doing too much. Good for ENG 101/201 papers.",
        priceCents: 1500,
        paymentMethods: "online",
        images: ["https://picsum.photos/seed/essaytutor/600/400"],
      },

      // ---- post: free guides, chat/call only ----
      {
        sellerId: jayden.id,
        kind: "post",
        title: "BMCC → Columbia GS transfer: what actually matters",
        description:
          "I transferred last fall. Short version: your GPA in the last 30 credits matters more than your cumulative, get to know one professor well enough for a real letter, and the essay wants a reason, not a résumé. Message me if you want the longer version or want to see my actual application.",
        priceCents: 0,
        paymentMethods: "online",
        images: ["https://picsum.photos/seed/transferguide/600/400"],
      },
      {
        sellerId: carlos.id,
        kind: "post",
        title: "What TTP actually is (and whether you should apply)",
        description:
          "The CUNY Tech Talent Pipeline gets mentioned a lot and explained badly. It's a paid internship + coursework track, not a class you can just add. I'll lay out the timeline, what the technical screen is actually like, and who I've seen get in.",
        priceCents: 0,
        paymentMethods: "online",
        images: ["https://picsum.photos/seed/ttpguide/600/400"],
      },
      {
        sellerId: bob.id,
        kind: "post",
        title: "Which CS professors to take (and which to avoid)",
        description:
          "Based on three semesters in the CS department. Naming names for the intro sequence and data structures — who curves, who actually holds office hours, and who you should only take if the schedule forces it.",
        priceCents: 0,
        paymentMethods: "online",
        images: ["https://picsum.photos/seed/profguide/600/400"],
      },
      {
        sellerId: dana.id,
        kind: "post",
        title: "How financial aid actually disburses — timeline & gotchas",
        description:
          "Nobody explains why your refund is late or your balance suddenly changed. Walking through the real timeline: when TAP/Pell actually posts, why a schedule change can trigger a recalculation, and what to do if your disbursement is stuck.",
        priceCents: 0,
        paymentMethods: "online",
        images: ["https://picsum.photos/seed/aidguide/600/400"],
      },
      {
        sellerId: sofia.id,
        kind: "post",
        title: "Where to find free food on campus (realistic list)",
        description:
          "Not just 'check the club fairs.' The food pantry hours that are actually kept, which department events over-order catering, and the one office that always has snacks and doesn't card you for major.",
        priceCents: 0,
        paymentMethods: "online",
        images: ["https://picsum.photos/seed/foodguide/600/400"],
      },
    ],
    { returning: true },
  );

  const byTitle = (title) => listings.find((l) => l.title === title);
  const calculus = byTitle("Calculus: Early Transcendentals, 8th ed.");
  const fridge = byTitle("Mini fridge, 3.2 cu ft");
  const biology = byTitle("Campbell Biology, 12th ed.");
  const psych = byTitle("Intro to Psychology, 5th ed.");
  const calcTutoring = byTitle(
    "Calc II tutoring — series, integration tricks, exam prep",
  );
  const excelTutoring = byTitle("Excel & Google Sheets for accounting majors");

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

  // A thread for a booked session, so "My sessions" has a real conversation
  // behind the "Join session" button rather than needing one created live.
  const sessionConversation = await Conversation.create({
    listingId: calcTutoring.id,
    buyerId: bob.id,
  });

  await Message.bulkCreate([
    {
      conversationId: sessionConversation.id,
      senderId: bob.id,
      body: "Booked the Calc II session — looking forward to it!",
    },
    {
      conversationId: sessionConversation.id,
      senderId: alice.id,
      body: "Great, bring your last problem set and we'll start there.",
    },
  ]);

  // A second booked session, with no messages — mirrors what the Stripe
  // webhook now does automatically for any paid session order: the
  // conversation exists (so "Join session" is never stuck disabled) even
  // when the buyer went straight to "Book session" without messaging first.
  await Conversation.create({
    listingId: excelTutoring.id,
    buyerId: alice.id,
  });

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
    // Bob booked a session with Alice — shows up in Bob's "booked" bucket
    // and Alice's "to deliver" bucket on the account page.
    {
      listingId: calcTutoring.id,
      buyerId: bob.id,
      amountCents: calcTutoring.priceCents,
      method: "online",
      status: "paid",
      stripeSessionId: "cs_test_seeded_session_0001",
    },
    // Alice booked a session with Jayden.
    {
      listingId: excelTutoring.id,
      buyerId: alice.id,
      amountCents: excelTutoring.priceCents,
      method: "online",
      status: "paid",
      stripeSessionId: "cs_test_seeded_session_0002",
    },
  ]);

  const check = await Conversation.findOne({
    where: { id: conversation.id },
    include: [
      { association: "messages" },
      { association: "buyer" },
      { association: "listing", include: [{ association: "seller" }] },
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
    available: await Listing.count({ where: { status: "available" } }),
    items: await Listing.count({ where: { kind: "item" } }),
    sessions: await Listing.count({ where: { kind: "session" } }),
    posts: await Listing.count({ where: { kind: "post" } }),
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
