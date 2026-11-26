const authService = require("../services/authService");

const register = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;
    const user = await authService.register({ name, email, phone, password });
    res
      .status(201)
      .json({ success: true, message: "Account created", data: user });
  } catch (err) {
    next(err);
  }
};

module.exports = { register };
