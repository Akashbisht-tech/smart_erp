const express = require("express");

const router = express.Router();

const authentication = require("../middlewares/auth.middleware");
const authorization = require("../middlewares/authorization.middleware");

const {
    getAttendanceAnalytics,
    getMarksAnalytics,
    getRiskAnalysis
} = require("../controllers/analytics.controller");

// attendance, marks, risk analysis


// Attendance Analytics
router.get(
    "/attendance",
    authentication,
    authorization("student"),
    getAttendanceAnalytics
);


// Marks Analytics
router.get(
    "/marks",
    authentication,
    authorization("student"),
    getMarksAnalytics
);


// Risk Analysis
router.get(
    "/risk-analysis",
    authentication,
    authorization("student"),
    getRiskAnalysis
);


module.exports = router;