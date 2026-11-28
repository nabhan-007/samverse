const crypto = require("crypto");
const Otp = require("../models/otpModel");
const { sendOtpMail } = require("../utils/mailer");

const TTL_SECONDS = 120;
const MAX_ATTEMPTS = 5;

const fail = (message, status) => {
  const err = new Error(message);
  err.status = status;
  throw err;
};

const issue = async ({ email, purpose = "signup", payload = {} }) => {
  const code = String(crypto.randomInt(100000, 1000000));

  await Otp.findOneAndUpdate(
    { email, purpose },
    {
      code,
      payload,
      attempts: 0,
      expiresAt: new Date(Date.now() + TTL_SECONDS * 1000),
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
  );

  await sendOtpMail(email, code, purpose);
  return { email, expiresIn: TTL_SECONDS };
};

const resend = async ({ email, purpose = "signup" }) => {
  const existing = await Otp.findOne({ email, purpose });
  if (!existing) fail("Nothing to resend. Start again.", 404);
  return issue({ email, purpose, payload: existing.payload });
};

const verify = async ({ email, purpose = "signup", code }) => {
  const otp = await Otp.findOne({ email, purpose });
  if (!otp) fail("No active code. Request a new one.", 400);

  if (otp.expiresAt.getTime() < Date.now()) {
    fail("Code expired. Request a new one.", 410);
  }

  if (otp.attempts >= MAX_ATTEMPTS) {
    fail("Too many wrong attempts. Request a new one.", 429);
  }

  if (otp.code !== code) {
    otp.attempts += 1;
    await otp.save();
    const left = MAX_ATTEMPTS - otp.attempts;
    fail(`Invalid code. ${left} attempt${left === 1 ? "" : "s"} left.`, 400);
  }

  await Otp.deleteOne({ _id: otp._id });
  return otp.payload;
};

module.exports = { issue, resend, verify, TTL_SECONDS, MAX_ATTEMPTS };
