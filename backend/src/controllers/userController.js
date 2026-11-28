const userService = require("../services/userService");

const ok = (res, data, message) =>
  res.json({ success: true, ...(message ? { message } : {}), data });

const getProfile = async (req, res, next) => {
  try {
    ok(res, await userService.getProfile(req.user.id));
  } catch (err) {
    next(err);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    ok(
      res,
      await userService.updateProfile(req.user.id, { name, phone }),
      "Profile updated",
    );
  } catch (err) {
    next(err);
  }
};

const updateAvatar = async (req, res, next) => {
  try {
    ok(res, await userService.updateAvatar(req.user.id, req.file), "Photo updated");
  } catch (err) {
    next(err);
  }
};

const changePassword = async (req, res, next) => {
  try {
    await userService.changePassword(req.user.id, req.body);
    res.json({ success: true, message: "Password updated" });
  } catch (err) {
    next(err);
  }
};

const requestEmailChange = async (req, res, next) => {
  try {
    const data = await userService.requestEmailChange(req.user.id, req.body);
    res.json({ success: true, message: "Code sent to your new email", data });
  } catch (err) {
    next(err);
  }
};

const confirmEmailChange = async (req, res, next) => {
  try {
    ok(
      res,
      await userService.confirmEmailChange(req.user.id, req.body),
      "Email updated",
    );
  } catch (err) {
    next(err);
  }
};

const listAddresses = async (req, res, next) => {
  try {
    ok(res, await userService.listAddresses(req.user.id));
  } catch (err) {
    next(err);
  }
};

const createAddress = async (req, res, next) => {
  try {
    res
      .status(201)
      .json({
        success: true,
        message: "Address added",
        data: await userService.createAddress(req.user.id, req.body),
      });
  } catch (err) {
    next(err);
  }
};

const updateAddress = async (req, res, next) => {
  try {
    ok(
      res,
      await userService.updateAddress(req.user.id, req.params.id, req.body),
      "Address updated",
    );
  } catch (err) {
    next(err);
  }
};

const deleteAddress = async (req, res, next) => {
  try {
    await userService.deleteAddress(req.user.id, req.params.id);
    res.json({ success: true, message: "Address removed" });
  } catch (err) {
    next(err);
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
