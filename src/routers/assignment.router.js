const express = require("express");

const router = express.Router();

const authentication = require("../middlewares/auth.middleware");
const authorization = require("../middlewares/authorization.middleware");
const assignmentController = require("../controllers/assignment.controller");
const submissionController = require("../controllers/submission.controller");
const upload = require("../middlewares/upload.middleware");

/**
 * create, list, submit, statu
 */

/**
 * POST - /api/assignments/create
 */
router.post("/create", authentication, authorization("faculty"), assignmentController.createAssignment);

/**
 * POST - /api/assignments/list
 */
router.get("/list", authentication, assignmentController.listAssignments);


/**
 * POST /api/assignments/submit/:id
 */
router.post("/submit/:id", authentication, authorization("student"), upload.single("file"),assignmentController.submitAssignment);

/**
 * get /api/assignments/status/:id
 */
router.get("/status/:id", authentication, authorization("student"), assignmentController.assignmentStatus);

module.exports = router;