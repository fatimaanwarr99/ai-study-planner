import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  BookOpen,
  Plus,
  Trash2,
  Clock,
  ArrowRight,
} from 'lucide-react'
import './Onboarding.css'

function Onboarding() {
  const navigate = useNavigate()

  const [subjects, setSubjects] = useState([
    {
      name: '',
      examDate: '',
      difficulty: 'Medium',
    },
  ])

  const [studyHours, setStudyHours] = useState('2')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleContinue = async () => {
    setError('')

    const user = JSON.parse(localStorage.getItem('user'))
    const token = localStorage.getItem('token')

    if (!user || !token) {
      setError('Please log in again.')
      return
    }

    const validSubjects = subjects.filter(
      (subject) =>
        subject.name.trim() &&
        subject.examDate &&
        subject.difficulty
    )

    if (validSubjects.length === 0) {
      setError('Please add at least one subject with an exam date.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(
        'http://https://ai-study-planner-delta-ochre.vercel.app/api/auth/profile',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            subjects: validSubjects,
            studyHours,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        setError(
          data.message || 'Could not save your study profile.'
        )
        setLoading(false)
        return
      }

      navigate('/dashboard')
    } catch (error) {
      setError('Unable to connect to the server.')
    }

    setLoading(false)
  }

  const addSubject = () => {
    setSubjects([
      ...subjects,
      {
        name: '',
        examDate: '',
        difficulty: 'Medium',
      },
    ])
  }

  const removeSubject = (index) => {
    if (subjects.length === 1) return

    setSubjects(subjects.filter((_, i) => i !== index))
  }

  const updateSubject = (index, field, value) => {
    const updatedSubjects = [...subjects]

    updatedSubjects[index][field] = value

    setSubjects(updatedSubjects)
  }

  return (
    <div className="onboarding-page">

      {/* Header */}
      <header className="onboarding-header">
        <Link to="/" className="auth-logo">
          <div className="logo-icon">
            S
          </div>

          <span>StudyFlow</span>
        </Link>

        <span className="step-indicator">
          Step 1 of 2
        </span>
      </header>

      {/* Main content */}
      <main className="onboarding-container">

        <div className="onboarding-intro">

          <div className="onboarding-icon">
            <BookOpen size={24} />
          </div>

          <p className="onboarding-eyebrow">
            LET'S PERSONALIZE YOUR PLAN
          </p>

          <h1>
            Tell us about your studies
          </h1>

          <p className="onboarding-description">
            Add your subjects and exams. We'll use this information
            to build a study plan that fits your schedule.
          </p>

        </div>

        {/* Subjects */}
        <section className="onboarding-card">

          <div className="card-title-row">

            <div>
              <h2>Your subjects</h2>

              <p>
                Add the subjects you need to prepare for.
              </p>
            </div>

            <span className="subject-count">
              {subjects.length}
            </span>

          </div>

          <div className="subjects-list">

            {subjects.map((subject, index) => (

              <div className="subject-item" key={index}>

                <div className="subject-number">
                  {String(index + 1).padStart(2, '0')}
                </div>

                <div className="subject-fields">

                  <div className="form-group">
                    <label>
                      Subject name
                    </label>

                    <input
                      type="text"
                      placeholder="e.g. Database Systems"
                      value={subject.name}
                      onChange={(e) =>
                        updateSubject(
                          index,
                          'name',
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Exam date
                    </label>

                    <input
                      type="date"
                      value={subject.examDate}
                      onChange={(e) =>
                        updateSubject(
                          index,
                          'examDate',
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Difficulty
                    </label>

                    <select
                      value={subject.difficulty}
                      onChange={(e) =>
                        updateSubject(
                          index,
                          'difficulty',
                          e.target.value
                        )
                      }
                    >
                      <option value="Easy">
                        Easy
                      </option>

                      <option value="Medium">
                        Medium
                      </option>

                      <option value="Hard">
                        Hard
                      </option>
                    </select>
                  </div>

                </div>

                {subjects.length > 1 && (
                  <button
                    type="button"
                    className="remove-subject"
                    onClick={() => removeSubject(index)}
                    title="Remove subject"
                  >
                    <Trash2 size={17} />
                  </button>
                )}

              </div>

            ))}

          </div>

          <button
            type="button"
            className="add-subject-btn"
            onClick={addSubject}
          >
            <Plus size={18} />
            Add another subject
          </button>

        </section>

        {/* Study time */}
        <section className="onboarding-card">

          <div className="card-title-row">

            <div>
              <h2>Available study time</h2>

              <p>
                How much time can you realistically study each day?
              </p>
            </div>

            <Clock size={22} className="time-icon" />

          </div>

          <div className="hours-options">

            {['1', '2', '3', '4', '5+'].map((hours) => (

              <button
                key={hours}
                type="button"
                className={`hours-option ${
                  studyHours === hours ? 'selected' : ''
                }`}
                onClick={() => setStudyHours(hours)}
              >
                <strong>
                  {hours}
                </strong>

                <span>
                  {hours === '1' ? 'hour' : 'hours'} / day
                </span>

              </button>

            ))}

          </div>

        </section>

        {/* Continue */}
        {error && (
          <p className="auth-error">
            {error}
          </p>
        )}

        <div className="onboarding-actions">

          <p>
            You can change these details later.
          </p>

          <button
            type="button"
            className="continue-btn"
            onClick={handleContinue}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Continue'}
            <ArrowRight size={18} />
          </button>

        </div>

      </main>

    </div>
  )
}

export default Onboarding