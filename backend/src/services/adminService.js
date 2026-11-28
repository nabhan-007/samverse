const User = require("../models/userModel");

const escapeRx = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const listUsers = async ({
  search = "",
  page = 1,
  limit = 10,
  sort = "latest",
} = {}) => {
  const filter = { role: "user" };

  if (search.trim()) {
    const rx = new RegExp(escapeRx(search.trim()), "i");
    filter.$or = [{ name: rx }, { email: rx }, { phone: rx }];
  }

  const sortMap = {
    latest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    name: { name: 1 },
  };
  const pageNum = Number(page) || 1;
  const limitNum = Number(limit) || 10;

  const [users, total] = await Promise.all([
    User.find(filter)
      .select("name email phone isBlocked createdAt")
      .sort(sortMap[sort] || sortMap.latest)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    User.countDocuments(filter),
  ]);

  return {
    users,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  };
};

const setBlocked = async (id, isBlocked) => {
  const user = await User.findById(id);
  if (!user) {
    const err = new Error("User not found");
    err.status = 404;
    throw err;
  }
  user.isBlocked = isBlocked;
  await user.save();
  return { id: user._id, isBlocked: user.isBlocked };
};

module.exports = { listUsers, setBlocked };
