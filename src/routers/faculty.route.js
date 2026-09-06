const express = require("express");

const router = express.Router();

const authentication = require("../middlewares/auth.middleware");
const authorization = require("../middlewares/authorization.middleware");
const facultyController = require("../controllers/faculty.controller")


/**
 * profile, assigned subjects, students
 */

/**
 * POST - /api/faculty/profile
 */
router.post("/profile", authentication, authorization("admin"),facultyController.createFacultyProfile);

/**
 * GET - /api/faculty/assigned-subjects
 */
router.get("/assigned-subjects", authentication, authorization("faculty"),facultyController.seeSubject);


module.exports = router;
