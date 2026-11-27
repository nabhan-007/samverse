const express = require("express");
const validate = require("../middlewares/validateMiddleware");
const {
  validateRegister,
  validateLogin,
} = require("../validators/authValidator");
const { register, login } = require("../controllers/authController");

const router = express.Router();

router.post("/register", validate(validateRegister), register);
router.post("/login", validate(validateLogin), login);

module.exports = router;
