const express = require("express");
const router = express.Router();

const { queryAIController } = require("../controllers/ai.controller");
const authMiddleware = require("../middlewares/auth.middleware");


/**
 * POST - /api/ai/query
 */
router.post("/query", authMiddleware, queryAIController);

module.exports = router;