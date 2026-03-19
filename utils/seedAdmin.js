import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } from "../config/env.js";

export const seedAdmin = async () => {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) return;

  const exists = await User.findOne({ email: ADMIN_EMAIL });
  if (exists) return;

  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(ADMIN_PASSWORD, salt);

  await User.create({
    name: ADMIN_NAME || "Admin",
    email: ADMIN_EMAIL,
    password: hashed,
    role: "admin",
  });
};
