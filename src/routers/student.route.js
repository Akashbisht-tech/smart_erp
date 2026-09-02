const express = require("express");

const router = express.Router();

const studentConrtroller = require("../controllers/student.controller");
const authentication = require("../middlewares/auth.middleware");

const authorization = require("../middlewares/authorization.middleware");

/**
 * profile, dashboard, academic data
 */


/**
 * POST - /api/student/profile
 */
router.post("/profile", authentication,authorization("admin"), studentConrtroller.createStudentProfile);


/**
 * GET - /api/student/dashboard
 */
router.get("/dashboard", authentication,authorization("student"), studentConrtroller.getStudentDashboard);


/**
 * GET - /api/student/getAcademicData
 */
router.get("/getAcademicData", authentication,authorization("student"), studentConrtroller.getAcademicData);




module.exports = router;