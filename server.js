import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { connectDB } from './config/db.js'
import taskRoutes from './routes/taskRoutes.js'
import authRoutes from './routes/authRoutes.js'
import userRoutes from './routes/userRoutes.js'

dotenv.config()
connectDB()

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors({
    origin: ['http://localhost:5173', 'https://dev-task.vercel.app'],
}))

// Permissive parser: accept JSON body even when Content-Type header is missing.
// If the header is missing we read the raw request body and try to parse JSON.
app.use((req, res, next) => {
  if (!req.headers['content-type']) {
    let data = ''
    req.setEncoding('utf8')
    req.on('data', (chunk) => { data += chunk })
    req.on('end', () => {
      if (!data) return next()
      try {
        req.headers['content-type'] = 'application/json'
        req.body = JSON.parse(data)
        return next()
      } catch (e) {
        // Let express.json produce a consistent error for malformed JSON
        return next()
      }
    })
  } else next()
})

app.use(express.json())

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ message: 'Invalid JSON payload' })
  }

  next(err)
})

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/tasks', taskRoutes)

app.get('/', (req, res) => {
  res.json({ message: 'DevTask API is running' })
})

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' })
})

app.use((err, req, res, next) => {
  console.error(err.stack || err.message)
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' })
})

app.listen(PORT, () => {
  console.log(`DevTask API running on http://localhost:${PORT}`)
})