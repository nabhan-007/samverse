const authService = require("../services/authService");

const register = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;
    const data = await authService.requestSignup({
      name,
      email,
      phone,
      password,
    });
    res
      .status(201)
      .json({ success: true, message: "OTP sent to your email", data });
  } catch (err) {
    next(err);
  }
};

const verifyOtp = async (req, res, next) => {
  try {
    const { email, code } = req.body;
    const data = await authService.verifySignup({ email, code });
    res.json({ success: true, message: "Email verified", ...data });
  } catch (err) {
    next(err);
  }
};

const resendOtp = async (req, res, next) => {
  try {
    const data = await authService.resendSignup({ email: req.body.email });
    res.json({ success: true, message: "New code sent", data });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login({ email, password });
    res.json({ success: true, message: "Login success", ...result });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, verifyOtp, resendOtp, login };
