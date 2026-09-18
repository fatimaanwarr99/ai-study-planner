const express = require('express')
const OpenAI = require('openai')
const StudyProfile = require('../models/StudyProfile')
const StudyPlan = require('../models/StudyPlan')
const protect = require('../middleware/auth')

const router = express.Router()

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Get today's saved study plan
router.get('/today', protect, async (req, res) => {
  try {
    const userId = req.userId

    const today = new Date()

    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    )

    const endOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1
    )

    const plan = await StudyPlan.findOne({
      userId,
      date: {
        $gte: startOfDay,
        $lt: endOfDay,
      },
    }).sort({ createdAt: -1 })

    if (!plan) {
      return res.status(404).json({
        message: 'No study plan found for today.',
      })
    }

    res.status(200).json({
      plan,
    })
  } catch (error) {
    console.error('Get today study plan error:', error)

    res.status(500).json({
      message: 'Something went wrong while loading today’s study plan.',
    })
  }
})

// Generate a fresh AI study plan
router.post('/generate', protect, async (req, res) => {
  try {
    const userId = req.userId

    // Get the user's latest study profile
    const profile = await StudyProfile.findOne({
      userId,
    })

    if (!profile) {
      return res.status(404).json({
        message: 'Study profile not found. Please complete onboarding first.',
      })
    }

    if (!profile.subjects || profile.subjects.length === 0) {
      return res.status(400).json({
        message: 'Please add at least one subject before generating a plan.',
      })
    }

    const availableHours =
      profile.studyHours === '5+'
        ? 5
        : Number(profile.studyHours)

    if (!availableHours || availableHours <= 0) {
      return res.status(400).json({
        message: 'Please provide a valid amount of study time.',
      })
    }

    const availableMinutes = availableHours * 60

    const today = new Date()

    const subjects = profile.subjects.map((subject) => ({
      name: subject.name,
      examDate: new Date(subject.examDate)
        .toISOString()
        .split('T')[0],
      difficulty: subject.difficulty,
    }))

    const prompt = `
You are an AI study planner called StudyFlow.

Create a personalized study plan for the student based ONLY on the information below.

Today's date:
${today.toISOString().split('T')[0]}

Available study time:
${availableHours} hours per day (${availableMinutes} minutes maximum)

Subjects:
${JSON.stringify(subjects, null, 2)}

Rules:
1. Create between 2 and 6 study tasks.
2. The total duration of all tasks must NOT exceed ${availableMinutes} minutes.
3. Each task must be between 25 and 90 minutes.
4. Prioritize subjects with earlier exam dates.
5. Give additional attention to subjects marked Hard.
6. Use ONLY the subjects provided above.
7. Make every task specific and useful.
8. Do not create tasks for subjects that are not listed.
9. Do not invent exam dates.
10. Return ONLY valid JSON.
11. Do not use markdown.
12. Do not include explanations outside the JSON.

Return exactly this structure:

{
  "tasks": [
    {
      "subject": "subject name",
      "title": "specific study task",
      "description": "clear explanation of what the student should do",
      "duration": 60
    }
  ]
}
`

    console.log('Generating NEW study plan for user:', userId)
    console.log('Latest profile:', subjects)
    console.log('Available minutes:', availableMinutes)

    const response = await openai.responses.create({
      model: 'gpt-5.6-luna',
      input: prompt,
    })

    let aiText = response.output_text

    if (!aiText) {
      return res.status(500).json({
        message: 'The AI did not return a study plan.',
      })
    }

    // Remove markdown code fences if the AI accidentally adds them
    aiText = aiText
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim()

    let parsedPlan

    try {
      parsedPlan = JSON.parse(aiText)
    } catch (error) {
      console.error('AI JSON parsing error:', aiText)

      return res.status(500).json({
        message: 'The AI returned an invalid study plan.',
      })
    }

    if (
      !parsedPlan ||
      !Array.isArray(parsedPlan.tasks) ||
      parsedPlan.tasks.length === 0
    ) {
      return res.status(500).json({
        message: 'The AI returned an empty study plan.',
      })
    }

    // Validate and clean AI tasks
    const validSubjectNames = subjects.map((subject) =>
      subject.name.trim().toLowerCase()
    )

    const cleanedTasks = parsedPlan.tasks
      .map((task) => ({
        subject: String(task.subject || '').trim(),
        title: String(task.title || '').trim(),
        description: String(task.description || '').trim(),
        duration: Number(task.duration),
        completed: false,
      }))
      .filter((task) => {
        const subjectIsValid = validSubjectNames.includes(
          task.subject.toLowerCase()
        )

        const durationIsValid =
          Number.isFinite(task.duration) &&
          task.duration >= 25 &&
          task.duration <= 90

        return (
          subjectIsValid &&
          task.title &&
          task.description &&
          durationIsValid
        )
      })

    if (cleanedTasks.length === 0) {
      return res.status(500).json({
        message: 'The AI could not create valid study tasks.',
      })
    }

    // Make sure total study time does not exceed the user's limit
    let totalMinutes = 0
    const finalTasks = []

    for (const task of cleanedTasks) {
      if (
        totalMinutes + task.duration <=
        availableMinutes
      ) {
        finalTasks.push(task)
        totalMinutes += task.duration
      }
    }

    if (finalTasks.length === 0) {
      return res.status(500).json({
        message:
          'The generated study plan exceeded your available study time.',
      })
    }

    // Remove today's previous plan before saving the new one
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    )

    const endOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1
    )

    await StudyPlan.deleteMany({
      userId,
      date: {
        $gte: startOfDay,
        $lt: endOfDay,
      },
    })

    // Save the brand-new plan
    const newPlan = await StudyPlan.create({
      userId,
      date: today,
      tasks: finalTasks,
    })

    console.log(
      `New study plan created with ${finalTasks.length} tasks.`
    )

    res.status(201).json({
      message: 'New study plan generated successfully!',
      plan: newPlan,
    })
  } catch (error) {
    console.error('Study plan generation error:', error)

    res.status(500).json({
      message:
        'Something went wrong while generating your study plan.',
    })
  }
})

// Update task completion
router.patch('/task/:planId/:taskId', protect, async (req, res) => {
  try {
    const { planId, taskId } = req.params
    const { completed } = req.body

    if (typeof completed !== 'boolean') {
      return res.status(400).json({
        message: 'Completed must be true or false.',
      })
    }

    const plan = await StudyPlan.findOne({
      _id: planId,
      userId: req.userId,
    })

    if (!plan) {
      return res.status(404).json({
        message: 'Study plan not found.',
      })
    }

    const task = plan.tasks.id(taskId)

    if (!task) {
      return res.status(404).json({
        message: 'Study task not found.',
      })
    }

    task.completed = completed

    await plan.save()

    res.status(200).json({
      message: 'Task updated successfully!',
      plan,
    })
  } catch (error) {
    console.error('Task update error:', error)

    res.status(500).json({
      message:
        'Something went wrong while updating the task.',
    })
  }
})

module.exports = router