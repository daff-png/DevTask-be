import Task from '../models/Task.js'

export async function getAllTasks(req, res) {
  try {
    const { category, status, page = 1, limit = 5 } = req.query
    const filter = {}
    const userRole = String(req.user?.role || 'PM').toLowerCase()
    const userId = req.user?._id

    if (category && category !== 'All Categories') filter.category = category
    if (status) filter.status = status

    if (userRole !== 'pm' && userId) {
      // allow non-PM users to see tasks assigned to them OR tasks matching their role's category
      // use $or with assignedTo or category match (case-insensitive via regex)
      filter.$or = [
        { assignedTo: userId },
        { category: { $regex: new RegExp(`^${userRole}$`, 'i') } },
      ]
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
    const userRole = String(req.user?.role || '').toLowerCase()
    const filter = userRole !== 'pm'
      ? { $or: [ { assignedTo: req.user._id }, { category: { $regex: new RegExp(`^${userRole}$`, 'i') } } ] }
      : {}
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
    const body = req.body || {}
    const { title, description, category, status, assignedTo } = body
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
    const userRole = String(req.user?.role || '').toLowerCase()
    const userId = req.user?._id

    if (userRole !== 'pm' && userId) {
      const task = await Task.findById(req.params.id)
      if (!task) return res.status(404).json({ message: 'Task not found' })

      // handle assignedTo possibly being populated or an ObjectId
      const assignedToId = task.assignedTo?._id ? String(task.assignedTo._id) : String(task.assignedTo)
      const taskCategory = String(task.category || '').toLowerCase()
      console.debug('updateTask: userId=', String(userId), 'userRole=', userRole, 'taskId=', req.params.id, 'assignedTo=', assignedToId, 'category=', taskCategory)
      // allow if user is assignee OR category matches user's role
      const isAssignee = assignedToId && assignedToId === String(userId)
      const isSameCategory = taskCategory === userRole
      if (!isAssignee && !isSameCategory) {
        console.debug('updateTask: forbidden - not assignee and category mismatch')
        return res.status(403).json({ message: 'Forbidden' })
      }
    }

    // non-PM may only update status
    const body = req.body || {}
    if (userRole !== 'pm') {
      if (!('status' in body)) {
        return res.status(400).json({ message: 'Status is required for non-PM updates' })
      }
    }

    const updates = userRole === 'pm' ? body : { status: body.status }

    let updated = await Task.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    })

    if (!updated) {
      return res.status(404).json({ message: 'Task not found' })
    }

    // populate assignedTo and createdBy so frontend receives full task object
    updated = await Task.findById(updated._id)
      .populate('assignedTo', 'name role email')
      .populate('createdBy', 'name role email')

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

export async function debugAllTasks(req, res) {
  try {
    const tasks = await Task.find()
      .populate('assignedTo', 'name role email')
      .populate('createdBy', 'name role email')
      .sort({ createdAt: -1 })
    res.json(tasks)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}