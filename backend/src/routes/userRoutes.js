const express = require("express");
const protect = require("../middlewares/authMiddleware");
const validate = require("../middlewares/validateMiddleware");
const { avatarUpload } = require("../middlewares/uploadMiddleware");
const {
  validateProfileUpdate,
  validateAddress,
  validateChangePassword,
  validateEmailChange,
  validateEmailChangeCode,
} = require("../validators/userValidator");
const {
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
} = require("../controllers/userController");

const router = express.Router();

router.use(protect);

router.get("/profile", getProfile);
router.put("/profile", validate(validateProfileUpdate), updateProfile);
router.post("/profile/avatar", avatarUpload.single("avatar"), updateAvatar);

router.put("/change-password", validate(validateChangePassword), changePassword);

router.post("/email-change", validate(validateEmailChange), requestEmailChange);
router.post(
  "/email-change/verify",
  validate(validateEmailChangeCode),
  confirmEmailChange,
);

router.get("/addresses", listAddresses);
router.post("/addresses", validate(validateAddress), createAddress);
router.put("/addresses/:id", validate(validateAddress), updateAddress);
router.delete("/addresses/:id", deleteAddress);

module.exports = router;
