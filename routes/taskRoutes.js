import express from "express";
import {
    getAllTasks,
    getStats,
    getTaskById,
    createTask,
    updateTask,
    deleteTask
} from "../controllers/taskController.js";
import { protect, authorize } from "../middleware/authMiddleware.js"

const router = express.Router()

router.use(protect)

router.get('/', getAllTasks)
router.get('/stats', getStats)
router.get('/:id', getTaskById)
router.post('/', authorize('PM'), createTask)
router.put('/:id', updateTask)
router.delete('/:id', authorize('PM'), deleteTask)

export default router