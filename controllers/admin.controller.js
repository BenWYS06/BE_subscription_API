import User from "../models/user.model.js";

export const promoteUserToAdmin = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: "admin" },
      { new: true },
    ).select("-password");

    if (!user) {
      const err = new Error(" User Not found ");
      err.statusCode = 404;
      throw err;
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};
