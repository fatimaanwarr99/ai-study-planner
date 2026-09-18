const mongoose = require('mongoose')

const studyPlanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    tasks: [
      {
        subject: {
          type: String,
          required: true,
        },

        title: {
          type: String,
          required: true,
        },

        description: {
          type: String,
          default: '',
        },

        duration: {
          type: Number,
          required: true,
        },

        completed: {
          type: Boolean,
          default: false,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model('StudyPlan', studyPlanSchema)