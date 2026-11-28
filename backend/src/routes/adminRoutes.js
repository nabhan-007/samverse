const express = require("express");
const protect = require("../middlewares/authMiddleware");
const adminOnly = require("../middlewares/adminMiddleware");
const validate = require("../middlewares/validateMiddleware");
const { validateLogin } = require("../validators/authValidator");
const {
  login,
  listUsers,
  blockUser,
  unblockUser,
} = require("../controllers/adminController");

const router = express.Router();

router.post("/auth/login", validate(validateLogin), login);
router.get("/users", protect, adminOnly, listUsers);
router.patch("/users/:id/block", protect, adminOnly, blockUser);
router.patch("/users/:id/unblock", protect, adminOnly, unblockUser);

module.exports = router;
