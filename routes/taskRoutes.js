import express from "express";
import {
    getAllTasks,
    getStats,
    getTaskById,
    createTask,
    updateTask,
    deleteTask
} from "../controllers/taskController.js";

const router = express.Router()

router.get('/', getAllTasks)
router.get('/stats', getStats)
router.get('/:id', getTaskById)
router.post('/', createTask)
router.put('/:id', updateTask)
router.delete('/:id', deleteTask)

export default router