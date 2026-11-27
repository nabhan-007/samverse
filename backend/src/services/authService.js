const bcrypt = require("bcryptjs");
const User = require("../models/userModel");
const otpService = require("./otpService");
const { signToken } = require("../utils/token");

const fail = (message, status) => {
  const err = new Error(message);
  err.status = status;
  throw err;
};

const requestSignup = async ({ name, email, phone, password }) => {
  const existing = await User.findOne({ email });
  if (existing) fail("Email already registered", 409);

  const passwordHash = await bcrypt.hash(password, 10);
  return otpService.issue({
    email,
    purpose: "signup",
    payload: { name, email, phone, passwordHash },
  });
};

const verifySignup = async ({ email, code }) => {
  const payload = await otpService.verify({ email, purpose: "signup", code });

  if (await User.findOne({ email })) fail("Email already registered", 409);

  const user = await User.create({
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
    passwordHash: payload.passwordHash,
    emailVerified: true,
  });

  return {
    token: signToken(user),
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  };
};

const resendSignup = async ({ email }) =>
  otpService.resend({ email, purpose: "signup" });

const login = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) fail("Invalid email or password", 401);
  if (user.isBlocked) fail("Account blocked. Contact support.", 403);

  const matches = await bcrypt.compare(password, user.passwordHash);
  if (!matches) fail("Invalid email or password", 401);

  return {
    token: signToken(user),
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  };
};

module.exports = { requestSignup, verifySignup, resendSignup, login };
