import { Router } from "express";
import authorize from "../middlewares/auth.middleware.js";
import {
  createSubscription,
  getUpcomingRenewals,
  getUserSubscriptions,
} from "../controllers/subscription.controller.js";
import {
  getSubscriptions,
  getSubscription,
  updateSubscription,
  cancelSubscription,
  deleteSubscription,
  getUpcomingRenewals,
} from "../controllers/subscription.controller.js";

const subscriptionRouter = Router();

subscriptionRouter.get(
  "/",
  authorize,
  authorizeRoles("admin"),
  getSubscriptions,
);

subscriptionRouter.get("/user/:id", authorize, getUserSubscriptions);

subscriptionRouter.get("/upcoming-renewals", authorize, getUpcomingRenewals);

subscriptionRouter.get("/:id", authorize, getSubscription);

subscriptionRouter.post("/", authorize, createSubscription);

subscriptionRouter.put("/:id/cancel", authorize, cancelSubscription);

subscriptionRouter.put("/:id", authorize, updateSubscription);

subscriptionRouter.delete("/:id", authorize, deleteSubscription);

export default subscriptionRouter;
