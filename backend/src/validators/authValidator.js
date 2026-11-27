const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const isPhone = (v) => /^\+91[6-9]\d{9}$/.test(v);

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

  if (!password || password.length < 8)
    errors.password = "Password must be at least 8 characters";
  else if (
    !/[A-Z]/.test(password) ||
    !/[a-z]/.test(password) ||
    !/\d/.test(password)
  )
    errors.password = "Use upper case, lower case and a number";

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

module.exports = { validateRegister, validateLogin };
