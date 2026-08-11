const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const { User } = require("../models");
const { sendWelcomeEmail } = require("../services/email.service");

function signToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

// Never return the model directly — that leaks passwordHash.
function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
  };
}

async function signup(req, res, next) {
  try {
    // `|| {}` because Express 5 leaves req.body undefined when the request
    // arrives without a JSON content-type.
    const { email = "", password = "", name = "" } = req.body || {};
    const cleanEmail = email.toLowerCase().trim();

    if (!validator.isEmail(cleanEmail)) {
      return res.status(400).json({ error: "Enter a valid email address" });
    }
    if (validator.isEmpty(name.trim())) {
      return res.status(400).json({ error: "Name is required" });
    }
    if (!validator.isLength(password, { min: 8 })) {
      return res
        .status(400)
        .json({ error: "Password must be at least 8 characters" });
    }

    const existing = await User.findOne({ where: { email: cleanEmail } });
    if (existing) {
      return res
        .status(409)
        .json({ error: "That email is already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      email: cleanEmail,
      passwordHash,
      name: name.trim(),
    });

    // Fire and forget: a failed email must never fail a successful signup.
    sendWelcomeEmail(user).catch((err) =>
      console.error("Welcome email failed:", err.message),
    );

    res.status(201).json({ token: signToken(user), user: publicUser(user) });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email = "", password = "" } = req.body || {};
    const cleanEmail = email.toLowerCase().trim();

    if (!validator.isEmail(cleanEmail) || validator.isEmpty(password)) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // scope(null) bypasses the defaultScope that hides passwordHash —
    // without it, bcrypt.compare gets undefined and every login fails.
    const user = await User.scope(null).findOne({
      where: { email: cleanEmail },
    });

    // Same response either way, so this can't be used to discover which
    // emails have accounts.
    const ok = user && (await bcrypt.compare(password, user.passwordHash));
    if (!ok) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    res.json({ token: signToken(user), user: publicUser(user) });
  } catch (err) {
    next(err);
  }
}

// todo logout

async function me(req, res, next) {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(401).json({ error: "Not signed in" });
    }
    res.json({ user: publicUser(user) });
  } catch (err) {
    next(err);
  }
}

module.exports = { signup, login, me };
