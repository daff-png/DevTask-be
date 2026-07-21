import express from "express";
import { login, getMe, debugToken } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post('/login', login)
router.get('/me', protect, getMe)
router.get('/debug', protect, debugToken)

export default router