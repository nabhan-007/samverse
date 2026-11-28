const express = require("express");
const validate = require("../middlewares/validateMiddleware");
const {
  validateRegister,
  validateLogin,
  validateVerifyOtp,
  validateEmailOnly,
  validateNewPassword,
} = require("../validators/authValidator");
const {
  register,
  verifyOtp,
  resendOtp,
  forgotPassword,
  newPassword,
  login,
} = require("../controllers/authController");

const router = express.Router();

router.post("/register", validate(validateRegister), register);
router.post("/verifyotp", validate(validateVerifyOtp), verifyOtp);
router.post("/resendotp", validate(validateEmailOnly), resendOtp);
router.post("/forgotpassword", validate(validateEmailOnly), forgotPassword);
router.post("/newpassword", validate(validateNewPassword), newPassword);
router.post("/login", validate(validateLogin), login);

module.exports = router;
