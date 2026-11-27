const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const errorHandler = require("./middlewares/errorMiddleware");
const userRoutes = require("./routes/userRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) =>
  res.json({ ok: true, service: "samverse-api" }),
);
app.use("/user/auth", authRoutes);
app.use("/user", userRoutes);
app.use(errorHandler);

module.exports = app;
