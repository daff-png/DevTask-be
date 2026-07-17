import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Task from '../models/Task.js'

dotenv.config()

const seedTasks = [
  { title: 'Fix Bug on Login Page', description: 'Session tokens drop on refresh, users bounced to /login', category: 'Frontend', status: 'In Progress' },
  { title: 'Redesign Task Card Component', description: 'Update card layout to match new spacing and typography guide', category: 'Frontend', status: 'Pending' },
  { title: 'Fix Responsive Layout on Tablet', description: 'Sidebar overlaps content on screens between 768px-1024px', category: 'Frontend', status: 'Completed' },
  { title: 'Add Dark Mode Toggle', description: 'Persist theme preference in localStorage', category: 'Frontend', status: 'Pending' },
]

async function run() {
  await mongoose.connect(process.env.MONGO_URI)
  await Task.deleteMany()
  await Task.insertMany(seedTasks)
  console.log('Seed data inserted')
  process.exit()
}

run()
