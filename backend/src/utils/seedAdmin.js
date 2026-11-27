require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/userModel");

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const email = "admin@samverse.in";
  const passwordHash = await bcrypt.hash("Admin@1234", 10);

  const admin = await User.findOneAndUpdate(
    { email },
    {
      name: "Samverse Admin",
      email,
      phone: "+919800000000",
      passwordHash,
      role: "admin",
    },
    { upsert: true, returnDocument: "after" },
  );

  console.log(`Admin ready: ${admin.email} / Admin@1234`);
  await mongoose.disconnect();
})();
