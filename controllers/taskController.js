import Task from '../models/Task.js'

export async function getAllTasks(req, res) {
  try {
    const { category, status, page = 1, limit = 5 } = req.query
    const filter = {}
    const userRole = req.user?.role || 'PM'
    const userId = req.user?._id

    if (category && category !== 'All Categories') filter.category = category
    if (status) filter.status = status

    if (userRole !== 'PM' && userId) {
      filter.assignedTo = userId
    }

    const pageNum = Number(page)
    const limitNum = Number(limit)
    const skip = (pageNum - 1) * limitNum

    const baseQuery = Task.find(filter)
    const query = typeof baseQuery.populate === 'function'
      ? baseQuery.populate('assignedTo', 'name role')
      : baseQuery

    const [tasks, total] = await Promise.all([
      query
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Task.countDocuments(filter),
    ])

    res.json({
      tasks,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalTasks: total,
        totalPages: Math.ceil(total / limitNum),
      },
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export async function getStats(req, res) {
  try {
    const filter = req.user.role !== 'PM' ? { assignedTo: req.user._id } : {}
    const [all, pending, inProgress, completed] = await Promise.all([
      Task.countDocuments(filter),
      Task.countDocuments({ ...filter, status: 'Pending' }),
      Task.countDocuments({ ...filter, status: 'In Progress' }),
      Task.countDocuments({ ...filter, status: 'Completed' }),
    ])
    res.json({ all, pending, inProgress, completed })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export async function getTaskById(req, res) {
  try {
    const task = await Task.findById(req.params.id).populate('assignedTo', 'name role')
    if (!task) return res.status(404).json({ message: 'Task not found' })

    if (req.user.role !== 'PM' && String(task.assignedTo?._id) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Forbidden' })
    }
    res.json(task)
  } catch (error) {
    res.status(400).json({ message: 'Invalid task id' })
  }
}

// khusus PM
export async function createTask(req, res) {
  try {
    const { title, description, category, status, assignedTo } = req.body
    const task = await Task.create({
      title,
      description,
      category,
      status,
      assignedTo: assignedTo || null,
      createdBy: req.user._id,
    })
    res.status(201).json(task)
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message })
    }
    res.status(500).json({ message: error.message })
  }
}

export async function updateTask(req, res) {
  try {
    const userRole = req.user?.role || 'PM'
    const userId = req.user?._id

    if (userRole !== 'PM' && userId) {
      const task = await Task.findById(req.params.id)
      if (!task) return res.status(404).json({ message: 'Task not found' })

      const isOwner = String(task.assignedTo) === String(userId)
      if (!isOwner) {
        return res.status(403).json({ message: 'Forbidden' })
      }
    }

    const updates = userRole === 'PM' ? req.body : { status: req.body.status }

    const updated = await Task.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    })

    if (!updated) {
      return res.status(404).json({ message: 'Task not found' })
    }

    res.json(updated)
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message })
    }
    res.status(400).json({ message: 'Invalid task id' })
  }
}

// khusus PM
export async function deleteTask(req, res) {
  try {
    const task = await Task.findByIdAndDelete(req.params.id)
    if (!task) return res.status(404).json({ message: 'Task not found' })
    res.status(200).json({ message: 'Task deleted successfully' })
  } catch (error) {
    res.status(400).json({ message: 'Invalid task id' })
  }
}