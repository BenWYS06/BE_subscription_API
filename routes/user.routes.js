import { Router } from "express";

import authorize from "../middlewares/auth.middleware.js";
import { getUser, getUsers } from "../controllers/user.controller.js";
import { authorizeRoles } from "../middlewares/auth.middleware.js";

const userRouter = Router();

userRouter.get("/", authorize, authorizeRoles("admin"), getUsers);

userRouter.get("/:id", authorize, getUser);

userRouter.put("/:id", (req, res) => res.send({ title: "Updated user" }));

userRouter.delete("/:id", (req, res) => res.send({ title: "DELETE user" }));

export default userRouter;
