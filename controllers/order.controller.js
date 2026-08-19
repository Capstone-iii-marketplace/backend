const { Order, Listing } = require("../models");
const stripe = require("../config/stripe");

// Stripe's product image field only accepts a hosted http(s) URL under 2048
// chars — listings can carry a base64 data: URL instead (uploaded photo
// with no CDN behind it yet), which Stripe rejects outright.
function stripeSafeImage(listing) {
  const image = listing.images?.[0];
  if (image && /^https?:\/\//.test(image) && image.length <= 2048) {
    return [image];
  }
  return [];
}

const LISTING_WITH_SELLER = {
  association: "listing",
  include: [{ association: "seller", attributes: ["id", "name"] }],
};

async function getMyOrders(req, res, next) {
  try {
    const orders = await Order.findAll({
      where: { buyerId: req.user.id },
      include: [LISTING_WITH_SELLER],
      order: [["createdAt", "DESC"]],
    });

    res.json({ orders });
  } catch (err) {
    next(err);
  }
}

// Starts a Stripe Checkout for every listing in the cart in one payment.
// Orders aren't created here — only once the webhook below confirms the
// payment actually went through — so an abandoned checkout never leaves a
// "paid" looking row behind. Listings are locked to "pending" immediately
// though, so two buyers can't check out with the same item at once.
async function createCheckoutSession(req, res, next) {
  try {
    if (!stripe) {
      return res
        .status(503)
        .json({ error: "Payments aren't configured on this server" });
    }

    const { listingIds } = req.body;

    if (!Array.isArray(listingIds) || listingIds.length === 0) {
      return res.status(400).json({ error: "listingIds is required" });
    }

    const listings = await Listing.findAll({
      where: { id: listingIds, status: "available" },
    });

    if (listings.length !== listingIds.length) {
      return res.status(409).json({
        error: "One or more items in your cart are no longer available",
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: listings.map((listing) => ({
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: listing.priceCents,
          product_data: {
            name: listing.title,
            images: stripeSafeImage(listing),
          },
        },
      })),
      success_url: `${process.env.CLIENT_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/checkout`,
      metadata: {
        buyerId: req.user.id,
        listingIds: listingIds.join(","),
      },
    });

    await Listing.update(
      { status: "pending" },
      { where: { id: listingIds } },
    );

    res.json({ url: session.url });
  } catch (err) {
    next(err);
  }
}

// Stripe calls this directly — no cookie, no req.user. Signature
// verification (in the raw-body middleware upstream) is what proves the
// request actually came from Stripe.
async function handleStripeWebhook(req, res) {
  if (!stripe) {
    return res.status(503).send("Payments aren't configured on this server");
  }

  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const { buyerId, listingIds } = session.metadata;
    const ids = listingIds.split(",");

    const listings = await Listing.findAll({ where: { id: ids } });

    for (const listing of listings) {
      // Composite id, not the bare session id: one Checkout Session can
      // cover several listings, but the id column is unique per row, so
      // each order needs its own value. A retried webhook recomputes the
      // same ids and hits findOrCreate's existing row instead of
      // double-selling the listing.
      await Order.findOrCreate({
        where: { stripeSessionId: `${session.id}:${listing.id}` },
        defaults: {
          listingId: listing.id,
          buyerId,
          amountCents: listing.priceCents,
          method: "online",
          status: "paid",
        },
      });
    }

    await Listing.update({ status: "sold" }, { where: { id: ids } });
  }

  if (
    event.type === "checkout.session.expired" ||
    event.type === "checkout.session.async_payment_failed"
  ) {
    const session = event.data.object;
    const ids = session.metadata.listingIds.split(",");
    // Only release listings that are still mid-checkout — a listing
    // already flipped to "sold" by a completed session must not be
    // reopened by a late/duplicate expiry event.
    await Listing.update(
      { status: "available" },
      { where: { id: ids, status: "pending" } },
    );
  }

  res.json({ received: true });
}

module.exports = { getMyOrders, createCheckoutSession, handleStripeWebhook };
