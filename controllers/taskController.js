import Task from "../models/Task.js";

export async function getAllTasks(req, res) {
  try {
    const { category, status } = req.query;
    const filter = {};
    if (category && category !== "All Categories") filter.category = category;
    if (status) filter.status = status;

    const tasks = await Task.find(filter).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getStats(req, res) {
  try {
    const [all, pending, inProgress, completed] = await Promise.all([
      Task.countDocuments(),
      Task.countDocuments({ status: "Pending" }),
      Task.countDocuments({ status: "In Progress" }),
      Task.countDocuments({ status: "Completed" }),
    ]);
    res.json({ all, pending, inProgress, completed });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getTaskById(req, res) {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json(task);
  } catch (error) {
    res.status(400).json({ error: "Invalid task ID" });
  }
}

export async function createTask(req, res) {
  try {
    const { title, description, category, status } = req.body;
    const task = await Task.create({ title, description, category, status });
    res.status(201).json(task);
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ error: error.message });
  }
}

export async function updateTask(req, res) {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json(task);
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(400).json({ error: "Invalid task ID" });
  }
}

export async function deleteTask(req, res) {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: "Invalid task ID" });
  }
}
