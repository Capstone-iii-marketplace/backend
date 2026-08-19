const PAYMENT_METHODS = ["online", "in_person", "both"];
const KINDS = ["item", "session", "post"];

// Returns { error } or { values }. `partial` skips required-field checks so
// PATCH can send only what changes.
function validateListing(body = {}, { partial = false } = {}) {
  const { title, description, priceCents, paymentMethods, images, kind } =
    body;
  const values = {};

  if (title !== undefined) {
    if (!String(title).trim()) return { error: "Title is required" };
    values.title = String(title).trim();
  } else if (!partial) {
    return { error: "Title is required" };
  }

  if (description !== undefined) {
    values.description = String(description).trim();
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

  if (kind !== undefined) {
    if (!KINDS.includes(kind)) {
      return { error: "Invalid listing kind" };
    }
    values.kind = kind;
  }

  if (images !== undefined) {
    if (!Array.isArray(images))
      return { error: "Images must be an array of URLs" };
    values.images = images;
  }

  return { values };
}

module.exports = { validateListing };
