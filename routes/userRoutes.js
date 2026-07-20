import express from "express";
import { getAllUsers, createUser, deleteUser } from "../controllers/userControllers.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect, authorize('PM'))

// Only PM
router.get('/', getAllUsers)
router.post('/', createUser)
router.delete('/:id', deleteUser)

export default router