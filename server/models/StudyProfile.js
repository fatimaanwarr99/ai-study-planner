const mongoose = require('mongoose')

const studyProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },

    subjects: [
      {
        name: {
          type: String,
          required: true,
        },

        examDate: {
          type: Date,
          required: true,
        },

        difficulty: {
          type: String,
          enum: ['Easy', 'Medium', 'Hard'],
          required: true,
        },
      },
    ],

    studyHours: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model(
  'StudyProfile',
  studyProfileSchema
)