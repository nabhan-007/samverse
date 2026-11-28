const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const isPhone = (v) => /^\+91[6-9]\d{9}$/.test(v);
const isCode = (v) => /^\d{6}$/.test(String(v));

const passwordError = (password) => {
  if (!password || password.length < 8)
    return "Password must be at least 8 characters";
  if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password))
    return "Use upper case, lower case and a number";
  return "";
};

const validateRegister = ({
  name,
  email,
  phone,
  password,
  confirmPassword,
}) => {
  const errors = {};

  if (!name || name.trim().length < 3)
    errors.name = "Name must be at least 3 characters";
  else if (/\d/.test(name)) errors.name = "Name cannot contain numbers";

  if (!email || !isEmail(email)) errors.email = "Enter a valid email address";
  if (!phone || !isPhone(phone))
    errors.phone = "Enter a valid +91 mobile number";

  const pwError = passwordError(password);
  if (pwError) errors.password = pwError;

  if (password !== confirmPassword)
    errors.confirmPassword = "Passwords do not match";

  return errors;
};

const validateLogin = ({ email, password }) => {
  const errors = {};
  if (!email || !isEmail(email)) errors.email = "Enter a valid email address";
  if (!password) errors.password = "Password is required";
  return errors;
};

const validateVerifyOtp = ({ email, code }) => {
  const errors = {};
  if (!email || !isEmail(email)) errors.email = "Enter a valid email address";
  if (!isCode(code)) errors.code = "Enter the 6-digit code";
  return errors;
};

const validateEmailOnly = ({ email }) => {
  const errors = {};
  if (!email || !isEmail(email)) errors.email = "Enter a valid email address";
  return errors;
};

const validateNewPassword = ({ email, code, password, confirmPassword }) => {
  const errors = {};
  if (!email || !isEmail(email)) errors.email = "Enter a valid email address";
  if (!isCode(code)) errors.code = "Enter the 6-digit code";

  const pwError = passwordError(password);
  if (pwError) errors.password = pwError;

  if (password !== confirmPassword)
    errors.confirmPassword = "Passwords do not match";

  return errors;
};

module.exports = {
  validateRegister,
  validateLogin,
  validateVerifyOtp,
  validateEmailOnly,
  validateNewPassword,
};
