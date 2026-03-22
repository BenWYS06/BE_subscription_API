import Subscription from "../models/subscription.model.js";
import { workflowClient } from "../config/upstash.js";
import { SERVER_URL } from "../config/env.js";
import { Error } from "mongoose";
import dayjs from "dayjs";

export const createSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.create({
      ...req.body,
      user: req.user._id,
    });

    const { workflowRunId } = await workflowClient.trigger({
      url: `${SERVER_URL}/api/v1/workflows/subscription/reminder`,
      body: {
        subscriptionId: subscription.id,
      },
      headers: {
        "content-type": "application/json",
      },
      retries: 0,
    });

    res
      .status(201)
      .json({ success: true, data: { subscription, workflowRunId } });
  } catch (e) {
    next(e);
  }
};

export const getSubscriptions = async (req, res, next) => {
  try {
    const subScriptions = await Subscription.find();

    res.status(200).json({ success: true, data: subScriptions });
  } catch (err) {
    next(err);
  }
};

export const getSubscription = async (req, res, next) => {
  try {
    const subScription = Subscription.findById(req.params.id);

    if (!subScription) {
      const error = new Error("Not found");
      error.statusCode = 404;
      throw error;
    }

    if (req.user.id !== String(subScription.user) && req.user.role != "admin") {
      const error = new Error("Forbidden");
      error.statusCode = 403;
      throw error;
    }

    res.status(200).json({ success: true, data: subScription });
  } catch (error) {
    next(error);
  }
};

export const updateSubscription = async (req, res, next) => {
  try {
    const allowed = [
      "name",
      "price",
      "currency",
      "frequency",
      "category",
      "paymentMethod",
      "status",
      "startDate",
      "renewalDate",
    ];

    const subScription = await Subscription.findById(req.params.id);

    if (!subScription) {
      const error = new Error("Not found");
      error.statusCode = 404;
      throw error;
    }

    if (
      req.user.id !== String(subScription.user) &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const updates = allowed.reduce((acc, key) => {
      if (req.body[key] !== undefined) acc[key] = req.body[key];
      return acc;
    }, {});

    if (Object.keys(updates).length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No data to update" });
    }

    Object.assign(subScription, updates);
    await subScription.save(); // run validator + pre-save hooks;

    res.status(200).json({ success: true, data: subScription });
  } catch (error) {
    next(error);
  }
};

export const cancelSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    // owner or admin
    if (
      req.user.id !== String(subscription.user) &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    subscription.status = "cancelled";
    await subscription.save();

    res.status(200).json({ success: true, data: subscription });
  } catch (error) {
    next(error);
  }
};

export const getUserSubscriptions = async (req, res, next) => {
  try {
    // Check if the user is the same as the one in the token
    if (req.user.id !== req.params.id && req.user.role !== "admin") {
      const error = new Error("You are not the owner of this account");
      error.statusCode = 401;
      throw error;
    }

    const subscriptions = await Subscription.find({ user: req.params.id });

    res.status(200).json({ success: true, data: subscriptions });
  } catch (e) {
    next(e);
  }
};

export const deleteSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      return res
        .status(404)
        .json({ success: false, message: "Subscription not found" });
    }

    // Owner or admin check
    if (
      req.user.id !== String(subscription.user) &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    await subscription.deleteOne();

    return res
      .status(200)
      .json({ success: true, message: "Subscription deleted" });
    // Or: res.status(204).send(); (no content)
  } catch (error) {
    next(error);
  }
};

export const getRenewal = async (req, res, next) => {
  try {
    if (req.user.id !== req.params.id && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const subscriptions = await Subscription.find({ user: req.params.id });

    if (!subscriptions) {
      return res
        .status(404)
        .json({ success: false, message: "Subscription not found" });
    }

    res.status(200).json({ success: true, data: subscriptions });
  } catch (error) {
    next(error);
  }
};

export const getUpcomingRenewals = async (req, res, next) => {
  try {
    // validate days query
    const daysRaw = req.query.days;
    const days = daysRaw ? Number(daysRaw) : 7;

    if (Number.isNaN(days) || days <= 0 || days > 365) {
      // Not number
      return res.status(400).json({
        success: false,
        message: "Invalid days. Must be between 1 and 365.",
      });
    }

    const now = dayjs();
    const end = now.add(days, "day");

    const subs = await Subscription.find({
      user: req.user._id,
      status: "active",
      renewalDate: { $gte: now.toDate(), $lte: end.toDate() },
    })
      .select(
        "name renewalDate price currency frequency category paymentMethod status",
      )
      .sort({ renewalDate: 1 });

    return res.status(200).json({ success: true, data: subs });
  } catch (error) {
    next(error);
  }
};
