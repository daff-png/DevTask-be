import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Task from '../models/Task.js'
import User from '../models/User.js'

dotenv.config()

const seedUsers = [
  { name: 'Daffa Taufiqurrahman', email: 'pm@devtask.com', password: 'password123', role: 'PM' },
  { name: 'Alex Rahman', email: 'frontend@devtask.com', password: 'password123', role: 'Frontend' },
  { name: 'Bella Putri', email: 'backend@devtask.com', password: 'password123', role: 'Backend' },
  { name: 'Citra Dewi', email: 'qa@devtask.com', password: 'password123', role: 'QA' },
  { name: 'Doni Saputra', email: 'devops@devtask.com', password: 'password123', role: 'DevOps' },
]

async function run() {
  await mongoose.connect(process.env.MONGO_URI)
  await Task.deleteMany()
  await User.deleteMany()

  const users = await User.create(seedUsers)
  const byRole = Object.fromEntries(users.map((u) => [u.role, u]))
  const pm = byRole['PM']

  const seedTasks = [
    { title: 'Fix Bug on Login Page', description: 'Session tokens drop on refresh, users bounced to /login', category: 'Frontend', status: 'In Progress', assignedTo: byRole['Frontend']._id },
    { title: 'Redesign Task Card Component', description: 'Update card layout to match new spacing and typography guide', category: 'Frontend', status: 'Pending', assignedTo: byRole['Frontend']._id },
    { title: 'Fix Responsive Layout on Tablet', description: 'Sidebar overlaps content on screens between 768px-1024px', category: 'Frontend', status: 'Completed', assignedTo: byRole['Frontend']._id },
    { title: 'Add Dark Mode Toggle', description: 'Persist theme preference in localStorage', category: 'Frontend', status: 'Pending', assignedTo: byRole['Frontend']._id },
    { title: 'Optimize Database Query for Task List', description: 'N+1 query issue when fetching tasks with categories', category: 'Backend', status: 'In Progress', assignedTo: byRole['Backend']._id },
  ].map((t) => ({ ...t, createdBy: pm._id }))

  await Task.insertMany(seedTasks)
  console.log('Seed data inserted')
  console.log('Login credentials (password sama semua: password123):')
  seedUsers.forEach((u) => console.log(`- ${u.role}: ${u.email}`))
  process.exit()
}

run()