const bcrypt = require("bcryptjs");
const User = require("../models/userModel");

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

module.exports = { register };
