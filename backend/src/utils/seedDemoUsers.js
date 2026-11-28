require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/userModel");

// Demo rows so the admin table has more than one page to page through.
const COUNT = 9;
const DAY = 24 * 60 * 60 * 1000;

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const passwordHash = await bcrypt.hash("Test@1234", 10);
  const base = Date.now() - COUNT * DAY;

  await User.deleteMany({ email: /^demo\d+@samverse\.test$/ });
  await User.insertMany(
    Array.from({ length: COUNT }, (_, i) => ({
      name: `Demo User ${i + 1}`,
      email: `demo${i + 1}@samverse.test`,
      phone: `+919876543${String(i).padStart(3, "0")}`,
      passwordHash,
      emailVerified: true,
      createdAt: new Date(base + i * DAY),
      updatedAt: new Date(base + i * DAY),
    })),
    { timestamps: false },
  );

  const total = await User.countDocuments({ role: "user" });
  console.log(`${COUNT} demo users ready (password Test@1234), ${total} user rows`);
  console.log("remove them with: deleteMany({ email: /^demo\\d+@samverse\\.test$/ })");
  await mongoose.disconnect();
})();
