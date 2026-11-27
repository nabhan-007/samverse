const express = require("express");
const protect = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/profile", protect, (req, res) => {
  res.json({ success: true, data: req.user });
});

module.exports = router;
