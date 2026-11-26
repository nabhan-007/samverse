const express = require("express");
const { register } = require("../controllers/authController");
const validate = require("../middlewares/validateMiddleware");
const { validateRegister } = require("../validators/authValidator");

const router = express.Router();

router.post("/register", validate(validateRegister), register);

module.exports = router;
