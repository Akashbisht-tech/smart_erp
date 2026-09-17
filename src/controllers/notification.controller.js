const Notification = require("../models/notifications.model");



const createNotification = async ({
  userId,
  title,
  message,
  type = "general",
  relatedId,
  expiresAt,
}) => {
  try {
    const notification = await Notification.create({
      userId,
      title,
      message,
      type,
      relatedId,
      expiresAt,
      isRead: false,
    });

    return notification;
  } catch (error) {
    console.error("Notification creation error:", error.message);
    return null;
  }
};


const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      userId: req.user.id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    notification.isRead = true;

    await notification.save();

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



const getSmartAlerts = async (req, res) => {
  try {
    const alerts = await Notification.find({
      userId: req.user.id,
      type: "smart_alert",
    })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: alerts.length,
      alerts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


module.exports = {
    createNotification,
  getNotifications,
  markAsRead,
  getSmartAlerts,
};