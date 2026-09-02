const express = require("express");

const router = express.Router();

const authcontroller = require("../controllers/auth.controller");


/**
 * POST - /api/auth/register
 */
router.post("/register", authcontroller.registrationController);

/**
 * POST - /api/auth/login
 */
router.post("/login", authcontroller.loginController);

/**
 * POST - /api/auth/refresh
 */
router.post("/refresh", authcontroller.refreshTokenController);

/**
 * POST - /api/auth/logout
 */
router.post("/logout", authcontroller.logoutController);

module.exports = router;