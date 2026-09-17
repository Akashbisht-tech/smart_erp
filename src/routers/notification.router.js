const express = require("express");

const router = express.Router();

const authentication = require("../middlewares/auth.middleware");
const authorization = require("../middlewares/authorization.middleware");

const {
  getNotifications,
  markAsRead,
  getSmartAlerts,
} = require("../controllers/notification.controller");


// list, read, smart alerts
router.get(
  "/list",
  authentication,
  getNotifications
);


// Mark Notification as Read
router.patch(
  "/read/:id",
  authentication,
  markAsRead
);


// Smart Alerts
router.get(
  "/smart-alerts",
  authentication,
  getSmartAlerts
);


module.exports = router;