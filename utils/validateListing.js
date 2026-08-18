const PAYMENT_METHODS = ["online", "in_person", "both"];

// Returns { error } or { values }. `partial` skips required-field checks so
// PATCH can send only what changes.
function validateListing(body = {}, { partial = false } = {}) {
  const { title, priceCents, paymentMethods, images } = body;
  const values = {};

  if (title !== undefined) {
    if (!String(title).trim()) return { error: "Title is required" };
    values.title = String(title).trim();
  } else if (!partial) {
    return { error: "Title is required" };
  }

  if (priceCents !== undefined) {
    if (!Number.isInteger(priceCents) || priceCents < 0) {
      return { error: "Price must be a whole number of cents" };
    }
    values.priceCents = priceCents;
  } else if (!partial) {
    return { error: "Price is required" };
  }

  if (paymentMethods !== undefined) {
    if (!PAYMENT_METHODS.includes(paymentMethods)) {
      return { error: "Invalid payment method" };
    }
    values.paymentMethods = paymentMethods;
  }

  if (images !== undefined) {
    if (!Array.isArray(images))
      return { error: "Images must be an array of URLs" };
    values.images = images;
  }

  return { values };
}

module.exports = { validateListing };
