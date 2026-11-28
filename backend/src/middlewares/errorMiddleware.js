const errorHandler = (err, req, res, next) => {
  let status = err.status || 500;
  let message = err.message || "Server error";

  if (err.code === "LIMIT_FILE_SIZE") {
    status = 400;
    message = "Image must be under 2MB";
  }

  if (err.code === 11000) {
    status = 409;
    message = "That value is already taken";
  }

  if (status === 500) console.error(err);

  res.status(status).json({ success: false, message });
};

module.exports = errorHandler;
