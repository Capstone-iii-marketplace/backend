require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { db } = require("./models");
// routes
const authRoute = require("./routes/auth.route");
const listingRoute = require("./routes/listing.route");
const orderRoute = require("./routes/order.route");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    // Required, or the browser refuses to send or store the auth cookie.
    credentials: true,
  }),
);
// Listing photos are sent as base64 data URLs, which run well past
// express's 100kb default body limit.
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.json({ message: "Marketplace API is running" });
});

app.get("/health", async (req, res) => {
  try {
    await db.authenticate();
    res.json({ status: "ok", database: "connected" });
  } catch (err) {
    res.status(503).json({ status: "error", database: err.message });
  }
});

app.use("/api/auth", authRoute);
app.use("/api/listings", listingRoute);
app.use("/api/orders", orderRoute);

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Anything a controller passes to next(err) lands here.
app.use((err, req, res, next) => {
  console.error(err);
  if (err.name === "SequelizeUniqueConstraintError") {
    return res.status(409).json({ error: "That value is already taken" });
  }
  if (err.name === "SequelizeValidationError") {
    return res
      .status(400)
      .json({ error: err.errors.map((e) => e.message).join(", ") });
  }
  res.status(500).json({ error: "Something went wrong" });
});

// connect to db
const start = async () => {
  try {
    await db.sync();
    console.log("Database connected");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.error("Unable to connect:", error);
    process.exit(1);
  }
};

start();
