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
const oauth = require("../controllers/oauthController");

const router = express.Router();

router.post("/register", validate(validateRegister), register);
router.post("/verifyotp", validate(validateVerifyOtp), verifyOtp);
router.post("/resendotp", validate(validateEmailOnly), resendOtp);
router.post("/forgotpassword", validate(validateEmailOnly), forgotPassword);
router.post("/newpassword", validate(validateNewPassword), newPassword);
router.post("/login", validate(validateLogin), login);

router.get("/google", oauth.start("google"));
router.get("/google/callback", oauth.callback("google"));
router.get("/facebook", oauth.start("facebook"));
router.get("/facebook/callback", oauth.callback("facebook"));

module.exports = router;
