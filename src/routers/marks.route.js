const express = require("express");

const router = express.Router();
const authentication = require("../middlewares/auth.middleware");
const authorization = require("../middlewares/authorization.middleware");

const markController = require("../controllers/marks.controller");


/**
 * create, update, student marks, performance
 */


/**
 * POST - /api/marks/create
 */
router.post("/create", authentication, authorization("faculty", "admin"), markController.create);

/**
 * POST - /api/marks/update
 */
router.post("/update/:id", authentication, authorization("faculty", "admin"), markController.updateMarks);

/**
 * GET - /api/marks/student-marks
 */
router.get("/student-marks", authentication, authorization("student"), markController.getStudentMarks);

/**
 * GET - /api/marks/getPerformance
 */
router.get("/getPerformance", authentication, authorization("student"), markController.getPerformance);




module.exports = router;
