const express = require('express')
const StudyPlan = require('../models/StudyPlan')
const protect = require('../middleware/auth')

const router = express.Router()

// Get study analytics for the current user
router.get('/', protect, async (req, res) => {
  try {
    const userId = req.userId

    const plans = await StudyPlan.find({
      userId,
    }).sort({ date: -1 })

    let totalTasks = 0
    let completedTasks = 0
    let totalMinutes = 0
    let completedMinutes = 0

    const subjectStats = {}

    plans.forEach((plan) => {
      plan.tasks.forEach((task) => {
        const duration = Number(task.duration) || 0
        const subject = task.subject?.trim() || 'Other'

        totalTasks += 1
        totalMinutes += duration

        if (task.completed) {
          completedTasks += 1
          completedMinutes += duration
        }

        if (!subjectStats[subject]) {
          subjectStats[subject] = {
            subject,
            totalTasks: 0,
            completedTasks: 0,
            totalMinutes: 0,
            completedMinutes: 0,
          }
        }

        subjectStats[subject].totalTasks += 1
        subjectStats[subject].totalMinutes += duration

        if (task.completed) {
          subjectStats[subject].completedTasks += 1
          subjectStats[subject].completedMinutes += duration
        }
      })
    })

    const overallProgress = totalTasks
      ? Math.round(
          (completedTasks / totalTasks) * 100
        )
      : 0

    const subjectProgress = Object.values(
      subjectStats
    ).map((subject) => ({
      ...subject,
      progress: subject.totalTasks
        ? Math.round(
            (subject.completedTasks /
              subject.totalTasks) *
              100
          )
        : 0,
    }))

    const today = new Date()

    today.setHours(0, 0, 0, 0)

    const sevenDaysAgo = new Date(today)

    sevenDaysAgo.setDate(
      sevenDaysAgo.getDate() - 6
    )

    const dailyActivity = []

    for (let i = 0; i < 7; i += 1) {
      const date = new Date(sevenDaysAgo)

      date.setDate(
        sevenDaysAgo.getDate() + i
      )

      const dateString = date
        .toISOString()
        .split('T')[0]

      let minutes = 0
      let completed = 0

      plans.forEach((plan) => {
        const planDate = new Date(plan.date)

        planDate.setHours(0, 0, 0, 0)

        const planDateString = planDate
          .toISOString()
          .split('T')[0]

        if (planDateString === dateString) {
          plan.tasks.forEach((task) => {
            if (task.completed) {
              minutes += Number(task.duration) || 0
              completed += 1
            }
          })
        }
      })

      dailyActivity.push({
        date: dateString,
        minutes,
        completed,
      })
    }

    res.status(200).json({
      analytics: {
        totalTasks,
        completedTasks,
        totalMinutes,
        completedMinutes,
        overallProgress,
        subjectProgress,
        dailyActivity,
      },
    })
  } catch (error) {
    console.error(
      'Get analytics error:',
      error
    )

    res.status(500).json({
      message:
        'Something went wrong while loading study analytics.',
    })
  }
})

module.exports = router