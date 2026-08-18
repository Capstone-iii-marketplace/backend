const bcrypt = require("bcrypt");
const validator = require("validator");
const { User } = require("../models");
const { sendWelcomeEmail } = require("../services/email.service");
const generateToken = require("../utils/generateToken");

// Never return the model directly — that leaks passwordHash.
function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    major: user.major,
    semester: user.semester,
    avatarUrl: user.avatarUrl,
    verifiedAt: user.verifiedAt,
    createdAt: user.createdAt,
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

    generateToken(user, res);
    res.status(201).json({ user: publicUser(user) });
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

    generateToken(user, res);
    res.json({ user: publicUser(user) });
  } catch (err) {
    next(err);
  }
}

function logout(_, res) {
  // The browser only overwrites a cookie when httpOnly/sameSite/secure match
  // the ones it was set with, so these must mirror generateToken().
  res.cookie("jwt", "", {
    maxAge: 0,
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });
  res.status(200).json({ message: "Logged out successfully" });
}

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

async function updateMe(req, res, next) {
  try {
    const { name, major, semester, avatarUrl } = req.body || {};
    const user = await User.findByPk(req.user.id);

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({ error: "Name can't be empty" });
      }
      user.name = name.trim();
    }
    if (major !== undefined) user.major = major?.trim() || null;
    if (semester !== undefined) user.semester = semester?.trim() || null;
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl?.trim() || null;

    await user.save();
    res.json({ user: publicUser(user) });
  } catch (err) {
    next(err);
  }
}

module.exports = { signup, login, logout, me, updateMe };
