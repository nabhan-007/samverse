const authService = require("../services/authService");
const adminService = require("../services/adminService");

const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    if (result.user.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Admin access only" });
    }
    res.json({ success: true, message: "Admin login success", ...result });
  } catch (err) {
    next(err);
  }
};

const listUsers = async (req, res, next) => {
  try {
    const data = await adminService.listUsers(req.query);
    res.json({ success: true, ...data });
  } catch (err) {
    next(err);
  }
};

const blockUser = async (req, res, next) => {
  try {
    const data = await adminService.setBlocked(req.params.id, true);
    res.json({ success: true, message: "User blocked", data });
  } catch (err) {
    next(err);
  }
};

const unblockUser = async (req, res, next) => {
  try {
    const data = await adminService.setBlocked(req.params.id, false);
    res.json({ success: true, message: "User unblocked", data });
  } catch (err) {
    next(err);
  }
};

module.exports = { login, listUsers, blockUser, unblockUser };
