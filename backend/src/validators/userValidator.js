const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const isPhone = (v) => /^\+91[6-9]\d{9}$/.test(v);
const isPin = (v) => /^\d{6}$/.test(String(v));
const isCode = (v) => /^\d{6}$/.test(String(v));

const passwordError = (password) => {
  if (!password || password.length < 8)
    return "Password must be at least 8 characters";
  if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password))
    return "Use upper case, lower case and a number";
  return "";
};

const validateProfileUpdate = ({ name, phone }) => {
  const errors = {};

  if (!name || name.trim().length < 3)
    errors.name = "Name must be at least 3 characters";
  else if (/\d/.test(name)) errors.name = "Name cannot contain numbers";

  if (!phone || !isPhone(phone))
    errors.phone = "Enter a valid +91 mobile number";

  return errors;
};

const validateAddress = ({ name, address, city, pin, phone }) => {
  const errors = {};

  if (!name || name.trim().length < 3) errors.name = "Name is required";
  if (!address || address.trim().length < 6)
    errors.address = "Enter the full address";
  if (!city || city.trim().length < 2) errors.city = "City is required";
  if (!isPin(pin)) errors.pin = "PIN code must be 6 digits";
  if (!isPhone(phone)) errors.phone = "Enter a valid +91 mobile number";

  return errors;
};

const validateChangePassword = ({
  currentPassword,
  password,
  confirmPassword,
}) => {
  const errors = {};

  if (!currentPassword) errors.currentPassword = "Enter your current password";

  const pwError = passwordError(password);
  if (pwError) errors.password = pwError;

  if (password !== confirmPassword)
    errors.confirmPassword = "Passwords do not match";

  return errors;
};

const validateEmailChange = ({ email }) => {
  const errors = {};
  if (!email || !isEmail(email)) errors.email = "Enter a valid email address";
  return errors;
};

const validateEmailChangeCode = ({ email, code }) => {
  const errors = {};
  if (!email || !isEmail(email)) errors.email = "Enter a valid email address";
  if (!isCode(code)) errors.code = "Enter the 6-digit code";
  return errors;
};

module.exports = {
  validateProfileUpdate,
  validateAddress,
  validateChangePassword,
  validateEmailChange,
  validateEmailChangeCode,
};
