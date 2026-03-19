import { Router } from "express";
import { promoteUserToAdmin } from "../controllers/admin.controller.js";
import authorize, { authorizeRoles } from "../middlewares/auth.middleware.js";

const adminRoute = Router();

adminRoute.patch(
  "/user/:id/role",
  authorize,
  authorizeRoles("admin"),
  promoteUserToAdmin,
);

export default adminRoute;
