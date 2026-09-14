const express = require("express");

const router = express.Router();
const authentication = require("../middlewares/auth.middleware");
const authorization = require("../middlewares/authorization.middleware");
const timetableController = require("../controllers/timetable.controller");


/**
 * create, update, student/faculty timetable
 */

/**
 * POST  /api/timetable/create
 */
router.post("/create", authentication, authorization("admin", "faculty"),  timetableController.createTimetable);

/**
 * PUT  /api/timetable/update/:id
 */
router.put("/update/:id", authentication , authorization("admin", "faculty"),  timetableController.updateTimetable);

/**
 * GET  /api/timetable/student
 */
router.get("/student", authentication,  authorization("student"),  timetableController.getStudentTimetable);

/**
 * GET  /api/timetable/faculty
 */
router.get("/faculty",authentication, authorization("faculty"),  timetableController.getFacultyTimetable);


module.exports = router;