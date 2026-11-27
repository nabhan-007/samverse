const bcrypt = require("bcryptjs");
const User = require("../models/userModel");
const { signToken } = require("../utils/token");

const register = async ({ name, email, phone, password }) => {
  const existing = await User.findOne({ email });
  if (existing) {
    const err = new Error("Email already registered");
    err.status = 409;
    throw err;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, phone, passwordHash });

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
  };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) {
    const err = new Error("Invalid email or password");
    err.status = 401;
    throw err;
  }
  if (user.isBlocked) {
    const err = new Error("Account blocked. Contact support.");
    err.status = 403;
    throw err;
  }

  const matches = await bcrypt.compare(password, user.passwordHash);
  if (!matches) {
    const err = new Error("Invalid email or password");
    err.status = 401;
    throw err;
  }

  return {
    token: signToken(user),
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  };
};

module.exports = { register, login };
