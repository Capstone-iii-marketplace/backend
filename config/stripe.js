const Stripe = require("stripe");

// Constructing Stripe with no key throws at module load, which takes the
// entire server down at boot — auth, chat and browsing included, none of
// which need Stripe. Export null instead and let the two payment handlers
// fail on their own with a 503.
module.exports = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;
