const validate = (validator) => (req, res, next) => {
  const errors = validator(req.body);
  if (Object.keys(errors).length > 0) {
    return res
      .status(400)
      .json({ success: false, message: "Validation failed", errors });
  }
  next();
};

module.exports = validate;
