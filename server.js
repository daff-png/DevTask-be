import express from "express"
import cors from 'cors'
import dotenv from 'dotenv'
import { connectDB } from "./config/db.js"
import taskRoutes from "./routes/taskRoutes.js"

dotenv.config()
connectDB()

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

app.use('/api/tasks', taskRoutes)

app.get('/', (req, res) => {
    res.json({ message: 'DevTask API is running' })
})

app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' })
})

app.listen(PORT, () => {
    console.log(`Devtask API running on http://localhost:${PORT}`)
})