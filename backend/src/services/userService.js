const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const User = require("../models/userModel");
const Address = require("../models/addressModel");
const otpService = require("./otpService");

const fail = (message, status) => {
  const err = new Error(message);
  err.status = status;
  throw err;
};

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  avatar: user.avatar?.url || null,
  provider: user.provider,
  emailVerified: user.emailVerified,
  createdAt: user.createdAt,
});

const getProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) fail("User not found", 404);
  return publicUser(user);
};

const updateProfile = async (userId, { name, phone }) => {
  const user = await User.findById(userId);
  if (!user) fail("User not found", 404);

  user.name = name;
  user.phone = phone;
  await user.save();

  return publicUser(user);
};

const updateAvatar = async (userId, file) => {
  if (!file) fail("Choose an image to upload", 400);

  const user = await User.findById(userId);
  if (!user) fail("User not found", 404);

  const previous = user.avatar?.publicId;
  user.avatar = {
    url: `/uploads/avatars/${file.filename}`,
    publicId: file.filename,
  };
  await user.save();

  if (previous) {
    const old = path.join(__dirname, "../../uploads/avatars", previous);
    fs.promises.unlink(old).catch(() => {});
  }

  return publicUser(user);
};

const changePassword = async (userId, { currentPassword, password }) => {
  const user = await User.findById(userId);
  if (!user) fail("User not found", 404);

  if (user.provider !== "local")
    fail(`Your account signs in with ${user.provider}. Set a password from there.`, 400);

  const matches = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!matches) fail("Current password is wrong", 401);

  user.passwordHash = await bcrypt.hash(password, 10);
  user.mustChangePassword = false;
  await user.save();
};

const requestEmailChange = async (userId, { email }) => {
  const user = await User.findById(userId);
  if (!user) fail("User not found", 404);

  if (email.toLowerCase() === user.email)
    fail("That is already your email address", 400);

  if (await User.findOne({ email })) fail("Email already registered", 409);

  return otpService.issue({
    email,
    purpose: "email-change",
    payload: { userId: String(user._id) },
  });
};

const confirmEmailChange = async (userId, { email, code }) => {
  const payload = await otpService.verify({
    email,
    purpose: "email-change",
    code,
  });

  if (payload.userId !== String(userId))
    fail("This code belongs to another account", 403);

  if (await User.findOne({ email })) fail("Email already registered", 409);

  const user = await User.findById(userId);
  if (!user) fail("User not found", 404);

  user.email = email;
  user.emailVerified = true;
  user.pendingEmail = null;
  await user.save();

  return publicUser(user);
};

const listAddresses = async (userId) =>
  Address.find({ userId }).sort({ isDefault: -1, createdAt: -1 });

const normaliseDefault = async (userId, addressId) => {
  await Address.updateMany(
    { userId, _id: { $ne: addressId } },
    { isDefault: false },
  );
};

const createAddress = async (userId, body) => {
  const count = await Address.countDocuments({ userId });
  const isDefault = body.isDefault === true || count === 0;

  const address = await Address.create({ ...body, userId, isDefault });
  if (isDefault) await normaliseDefault(userId, address._id);

  return address;
};

const updateAddress = async (userId, addressId, body) => {
  const address = await Address.findOne({ _id: addressId, userId });
  if (!address) fail("Address not found", 404);

  Object.assign(address, body);
  await address.save();

  if (address.isDefault) await normaliseDefault(userId, address._id);

  return address;
};

const deleteAddress = async (userId, addressId) => {
  const address = await Address.findOneAndDelete({
    _id: addressId,
    userId,
  });
  if (!address) fail("Address not found", 404);

  if (address.isDefault) {
    const next = await Address.findOne({ userId }).sort({ createdAt: -1 });
    if (next) {
      next.isDefault = true;
      await next.save();
    }
  }
};

module.exports = {
  getProfile,
  updateProfile,
  updateAvatar,
  changePassword,
  requestEmailChange,
  confirmEmailChange,
  listAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
};
