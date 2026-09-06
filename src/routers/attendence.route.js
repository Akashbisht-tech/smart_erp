const express = require("express");

const router = express.Router();

const authentication = require("../middlewares/auth.middleware");
const authorization = require("../middlewares/authorization.middleware");

const attendanceController = require("../controllers/attendence.controller");


/**
 * mark, student attendance, percentage
 */


/**
 * POST /api/attendance/mark
 */
router.post("/mark", authentication, authorization("faculty"), attendanceController.markAttendence);

/**
 * GET /api/attendance/student-attendance
 */
router.get("/student-attendance", authentication, authorization("student"), attendanceController.getStudentAttendance);


module.exports = router;