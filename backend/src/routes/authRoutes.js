const express = require("express");
const validate = require("../middlewares/validateMiddleware");
const {
  validateRegister,
  validateLogin,
  validateVerifyOtp,
  validateEmailOnly,
} = require("../validators/authValidator");
const {
  register,
  verifyOtp,
  resendOtp,
  login,
} = require("../controllers/authController");

const router = express.Router();

router.post("/register", validate(validateRegister), register);
router.post("/verifyotp", validate(validateVerifyOtp), verifyOtp);
router.post("/resendotp", validate(validateEmailOnly), resendOtp);
router.post("/login", validate(validateLogin), login);

module.exports = router;
