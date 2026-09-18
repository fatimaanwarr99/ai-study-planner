require('dotenv').config()
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const authRoutes = require('./routes/auth')
const studyPlanRoutes = require('./routes/studyPlan')
const analyticsRoutes = require('./routes/analytics')


const app = express()

// Middleware
app.use(cors())
app.use(express.json())
app.use('/api/auth', authRoutes)
app.use('/api/study-plan', studyPlanRoutes)
app.use('/api/analytics', analyticsRoutes)
app.get('/api/test-analytics', (req, res) => {
  res.json({
    message: 'Analytics route is connected!'
  })
})

// Test route
app.get('/', (req, res) => {
  res.json({
    message: 'StudyFlow API is running!'
  })
})

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected successfully!')
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error.message)
  })

// Server port
const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`StudyFlow server running on port ${PORT}`)
})