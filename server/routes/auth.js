const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const StudyProfile = require('../models/StudyProfile')
const protect = require('../middleware/auth')

const router = express.Router()

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Please provide name, email, and password.',
      })
    }

    const cleanName = String(name).trim()
    const cleanEmail = String(email).trim().toLowerCase()

    if (cleanName.length < 2) {
      return res.status(400).json({
        message: 'Name must be at least 2 characters long.',
      })
    }

    if (cleanEmail.length < 5 || !cleanEmail.includes('@')) {
      return res.status(400).json({
        message: 'Please provide a valid email address.',
      })
    }

    if (String(password).length < 6) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters long.',
      })
    }

    const existingUser = await User.findOne({
      email: cleanEmail,
    })

    if (existingUser) {
      return res.status(400).json({
        message: 'An account with this email already exists.',
      })
    }

    const hashedPassword = await bcrypt.hash(
      String(password),
      10
    )

    const user = await User.create({
      name: cleanName,
      email: cleanEmail,
      password: hashedPassword,
    })

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.status(201).json({
      message: 'Account created successfully!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    })
  } catch (error) {
    console.error('Registration error:', error)

    res.status(500).json({
      message:
        'Something went wrong while creating your account.',
    })
  }
})

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        message: 'Please provide email and password.',
      })
    }

    const cleanEmail = String(email).trim().toLowerCase()

    const user = await User.findOne({
      email: cleanEmail,
    })

    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password.',
      })
    }

    const passwordMatch = await bcrypt.compare(
      String(password),
      user.password
    )

    if (!passwordMatch) {
      return res.status(401).json({
        message: 'Invalid email or password.',
      })
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.status(200).json({
      message: 'Login successful!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    })
  } catch (error) {
    console.error('Login error:', error)

    res.status(500).json({
      message:
        'Something went wrong while logging in.',
    })
  }
})

// Save study profile
router.post('/profile', protect, async (req, res) => {
  try {
    const { subjects, studyHours } = req.body

    if (!Array.isArray(subjects) || subjects.length === 0) {
      return res.status(400).json({
        message: 'Please provide at least one subject.',
      })
    }

    if (subjects.length > 10) {
      return res.status(400).json({
        message: 'You can add a maximum of 10 subjects.',
      })
    }

    const validStudyHours = [
      '1',
      '2',
      '3',
      '4',
      '5+',
    ]

    if (!validStudyHours.includes(String(studyHours))) {
      return res.status(400).json({
        message: 'Please provide a valid amount of study time.',
      })
    }

    const cleanedSubjects = subjects.map((subject) => ({
      name: String(subject.name || '').trim(),
      examDate: subject.examDate,
      difficulty: subject.difficulty,
    }))

    for (const subject of cleanedSubjects) {
      if (!subject.name) {
        return res.status(400).json({
          message: 'Every subject must have a name.',
        })
      }

      if (subject.name.length > 100) {
        return res.status(400).json({
          message:
            'Subject names must be 100 characters or fewer.',
        })
      }

      if (!subject.examDate) {
        return res.status(400).json({
          message:
            'Every subject must have an exam date.',
        })
      }

      const examDate = new Date(subject.examDate)

      if (Number.isNaN(examDate.getTime())) {
        return res.status(400).json({
          message:
            'Please provide valid exam dates.',
        })
      }

      if (
        !['Easy', 'Medium', 'Hard'].includes(
          subject.difficulty
        )
      ) {
        return res.status(400).json({
          message:
            'Each subject must have a valid difficulty.',
        })
      }
    }

    const profile = await StudyProfile.findOneAndUpdate(
      { userId: req.userId },
      {
        userId: req.userId,
        subjects: cleanedSubjects,
        studyHours: String(studyHours),
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    )

    res.status(200).json({
      message: 'Study profile saved successfully!',
      profile,
    })
  } catch (error) {
    console.error('Profile error:', error)

    res.status(500).json({
      message:
        'Something went wrong while saving your study profile.',
    })
  }
})

// Get study profile
router.get('/profile/:id', protect, async (req, res) => {
  try {
    if (req.params.id !== req.userId.toString()) {
      return res.status(403).json({
        message:
          'You are not authorized to access this profile.',
      })
    }

    const profile = await StudyProfile.findOne({
      userId: req.userId,
    })

    if (!profile) {
      return res.status(404).json({
        message: 'Study profile not found.',
      })
    }

    res.status(200).json({
      profile,
    })
  } catch (error) {
    console.error('Get profile error:', error)

    res.status(500).json({
      message:
        'Something went wrong while loading your profile.',
    })
  }
})

module.exports = router