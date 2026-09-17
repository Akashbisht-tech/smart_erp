const express = require("express");

const router = express.Router();

const authentication = require("../middlewares/auth.middleware");
const authorization = require("../middlewares/authorization.middleware");

const {
  createNotice,
  getNotices,
  publishNotice,
} = require("../controllers/notice.controller");


// Create Notice
router.post(
  "/create",
  authentication,
  authorization("admin", "faculty"),
  createNotice
);


// List Notices
router.get(
  "/list",
  authentication,
  getNotices
);


// Publish Notice
router.patch(
  "/publish/:id",
  authentication,
  authorization("admin", "faculty"),
  publishNotice
);


module.exports = router;