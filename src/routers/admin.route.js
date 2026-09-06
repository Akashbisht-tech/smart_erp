const express = require("express");

const router = express.Router();

const authentication = require("../middlewares/auth.middleware");
const authorization = require("../middlewares/authorization.middleware");

const adminController = require("../controllers/admin.controller");

/**
 * users, departments, subjects, management
 */

/**
 * GET - /api/admin/users
*/
router.get("/users", authentication, authorization("admin"), adminController.getAllUser);

/**
 *  GET /api/admin/users/:id
 */
router.get("/user/:id", authentication, authorization("admin"), adminController.getUserById);


/**
 *  PATCH /api/admin/user/:id/role
 */
router.patch("/user/:id/role", authentication, authorization("admin"), adminController.updateUserRole);

/**
 *  POST /api/admin/create-department
 */
router.post("/create-department", authentication, authorization("admin"), adminController.createDepartment);

/**
 *  POST /api/admin/departments
 */
router.get("/departments", authentication, authorization("admin"), adminController.getAllDepartments);


/**
 *  POST /api/admin/createSubject
 */
router.post("/createSubject", authentication, authorization("admin"), adminController.createSubject);

/**
 *  POST /api/admin/createSubject
 */
router.get("/getAllSubjects", authentication, authorization("admin"), adminController.getAllSubjects);

/**
 *  POST /api/admin/assignFacultyToSubject
 */
router.post("/assignFacultyToSubject", authentication, authorization("admin"), adminController.assignFacultyToSubject);

module.exports = router;
