import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BookOpen,
  CalendarDays,
  Clock,
  Target,
  LogOut,
  RefreshCw,
  Pencil,
  Plus,
  Trash2,
  X,
  Save,
} from 'lucide-react'
import './Dashboard.css'

function Dashboard() {
  const user = JSON.parse(localStorage.getItem('user'))
  const token = localStorage.getItem('token')

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)

  const [plan, setPlan] = useState(null)
  const [planError, setPlanError] = useState('')
  const [analytics, setAnalytics] = useState(null)
const [analyticsLoading, setAnalyticsLoading] = useState(true)

  const [showEditProfile, setShowEditProfile] = useState(false)
  const [editSubjects, setEditSubjects] = useState([])
  const [editStudyHours, setEditStudyHours] = useState('2')
  const [profileError, setProfileError] = useState('')

  useEffect(() => {
    if (!token) {
      window.location.href = '/'
      return
    }

    const loadProfile = async () => {
      try {
        const response = await fetch(
          `https://ai-study-planner-delta-ochre.vercel.app/api/auth/profile/${user?.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        const data = await response.json()

        if (response.ok) {
          setProfile(data.profile)

          // Load today's saved study plan
          const planResponse = await fetch(
            'https://ai-study-planner-delta-ochre.vercel.app/api/study-plan/today',
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          )

          if (planResponse.ok) {
            const planData = await planResponse.json()
            setPlan(planData.plan)
          } else if (planResponse.status === 404) {
            // No plan has been generated today
            setPlan(null)
          } else if (planResponse.status === 401) {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
           window.location.href = '/'
            return
          }
          await loadAnalytics()
        } else if (response.status === 401) {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
       window.location.href = '/'
        }
      } catch (error) {
        console.error('Error loading profile:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user?.id) {
      loadProfile()
    } else {
      setLoading(false)
    }
  }, [user?.id, token])
const loadAnalytics = async () => {
  try {
    setAnalyticsLoading(true)

    const response = await fetch(
      'https://ai-study-planner-delta-ochre.vercel.app/api/analytics',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    const data = await response.json()

    if (!response.ok) {
      console.error(
        data.message || 'Could not load analytics.'
      )
      return
    }

    setAnalytics(data.analytics)
  } catch (error) {
    console.error(
      'Analytics loading error:',
      error
    )
  } finally {
    setAnalyticsLoading(false)
  }
}
  const generateStudyPlan = async () => {
    setGenerating(true)
    setPlanError('')

    try {
      const response = await fetch(
        'https://ai-study-planner-delta-ochre.vercel.app/api/study-plan/generate',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = await response.json()

      if (!response.ok) {
        setPlanError(
          data.message || 'Could not generate study plan.'
        )

        setGenerating(false)
        return
      }

     setPlan(data.plan)
await loadAnalytics()
    } catch (error) {
      console.error('Generate plan error:', error)
      setPlanError('Unable to connect to the server.')
    }

    setGenerating(false)
  }

  const toggleTask = async (
    planId,
    taskId,
    completed
  ) => {
    try {
      const response = await fetch(
        `https://ai-study-planner-delta-ochre.vercel.app/api/study-plan/task/${planId}/${taskId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            completed,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        console.error(
          data.message || 'Could not update task.'
        )
        return
      }

      setPlan(data.plan)
await loadAnalytics()
    } catch (error) {
      console.error('Task update error:', error)
    }
  }

  const openEditProfile = () => {
    if (!profile) return

    setEditSubjects(
      profile.subjects.map((subject) => ({
        name: subject.name || '',
        examDate: subject.examDate
          ? new Date(subject.examDate)
              .toISOString()
              .split('T')[0]
          : '',
        difficulty: subject.difficulty || 'Medium',
      }))
    )

    setEditStudyHours(
      String(profile.studyHours || '2')
    )

    setProfileError('')
    setShowEditProfile(true)
  }

  const closeEditProfile = () => {
    if (savingProfile) return

    setShowEditProfile(false)
    setProfileError('')
  }

  const updateEditSubject = (
    index,
    field,
    value
  ) => {
    const updated = [...editSubjects]

    updated[index][field] = value

    setEditSubjects(updated)
  }

  const addEditSubject = () => {
    setEditSubjects([
      ...editSubjects,
      {
        name: '',
        examDate: '',
        difficulty: 'Medium',
      },
    ])
  }

  const removeEditSubject = (index) => {
    if (editSubjects.length === 1) {
      return
    }

    setEditSubjects(
      editSubjects.filter(
        (_, i) => i !== index
      )
    )
  }

  const saveStudyProfile = async () => {
    setProfileError('')

    const validSubjects = editSubjects.filter(
      (subject) =>
        subject.name.trim() &&
        subject.examDate &&
        subject.difficulty
    )

    if (validSubjects.length === 0) {
      setProfileError(
        'Please add at least one subject with an exam date.'
      )
      return
    }

    if (!editStudyHours) {
      setProfileError(
        'Please select your daily study time.'
      )
      return
    }

    setSavingProfile(true)

    try {
      const response = await fetch(
        'https://ai-study-planner-delta-ochre.vercel.app/api/auth/profile',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            subjects: validSubjects,
            studyHours: editStudyHours,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        setProfileError(
          data.message ||
            'Could not update your study profile.'
        )

        setSavingProfile(false)
        return
      }

      setProfile(data.profile)
      setShowEditProfile(false)

      // Automatically create a new AI plan
      // using the updated profile.
      await generateStudyPlan()
    } catch (error) {
      console.error(
        'Save profile error:',
        error
      )

      setProfileError(
        'Unable to connect to the server.'
      )
    }

    setSavingProfile(false)
  }

  const completedTasks =
    plan?.tasks?.filter(
      (task) => task.completed
    ).length || 0

  const totalTasks =
    plan?.tasks?.length || 0

  const progress = totalTasks
    ? Math.round(
        (completedTasks / totalTasks) * 100
      )
    : 0

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <Link
          to="/"
          className="dashboard-logo"
        >
          <div className="logo-icon">
            S
          </div>

          <span>StudyFlow</span>
        </Link>

        <div className="dashboard-user">
  <span>
    Hi, {user?.name || 'Student'}
  </span>

  <Link
    to="/analytics"
    className="analytics-nav-btn"
  >
    Analytics
  </Link>

  <button
    type="button"
    onClick={() => {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    window.location.href = '/'
    }}
  >
    <LogOut size={17} />
    Log out
  </button>
</div>
      
      </header>

      <main className="dashboard-container">
        {/* WELCOME */}
        <section className="dashboard-welcome">
          <div>
            <p className="dashboard-eyebrow">
              YOUR STUDY SPACE
            </p>

            <h1>
              Welcome back,{' '}
              {user?.name || 'Student'} 👋
            </h1>

            <p>
              Your personalized study dashboard
              is ready.
            </p>
          </div>

          <div className="dashboard-date">
            <CalendarDays size={20} />

            <span>
              {new Date().toLocaleDateString()}
            </span>
          </div>
        </section>

        {/* PROFILE SUMMARY */}
        <section className="profile-summary">
          <div>
            <div className="profile-summary-label">
              YOUR CURRENT STUDY PROFILE
            </div>

            <div className="profile-summary-content">
              <div>
                <strong>
                  {profile?.subjects?.length || 0}
                </strong>

                <span>Subjects</span>
              </div>

              <div>
                <strong>
                  {profile?.studyHours || 0}
                </strong>

                <span>Hours / day</span>
              </div>

              <div>
                <strong>
                  {profile?.subjects?.filter(
                    (subject) =>
                      subject.difficulty ===
                      'Hard'
                  ).length || 0}
                </strong>

                <span>Hard subjects</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="edit-profile-btn"
            onClick={openEditProfile}
            disabled={loading || !profile}
          >
            <Pencil size={17} />
            Edit study profile
          </button>
        </section>

        {/* STAT CARDS */}
        <section className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-icon">
              <BookOpen size={21} />
            </div>

            <div>
              <span>Subjects</span>

              <strong>
                {profile?.subjects?.length || 0}
              </strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <Clock size={21} />
            </div>

            <div>
              <span>Study time</span>

              <strong>
                {profile?.studyHours || 0}{' '}
                hrs/day
              </strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <Target size={21} />
            </div>

            <div>
              <span>Progress</span>

              <strong>
                {progress}%
              </strong>
            </div>
          </div>
        </section>

               {/* STUDY ANALYTICS */}
        <section className="analytics-section">
          <div className="dashboard-card analytics-card">
            <div className="dashboard-card-header">
              <div>
                <h2>Study analytics</h2>

                <p>
                  See how your study progress is building over time.
                </p>
              </div>
            </div>

            {analyticsLoading ? (
              <div className="empty-state small">
                <p>Loading your analytics...</p>
              </div>
            ) : analytics ? (
              <>
                <div className="analytics-stats">
                  <div className="analytics-stat">
                    <span>Overall progress</span>

                    <strong>
                      {analytics.overallProgress}%
                    </strong>
                  </div>

                  <div className="analytics-stat">
                    <span>Tasks completed</span>

                    <strong>
                      {analytics.completedTasks}/
                      {analytics.totalTasks}
                    </strong>
                  </div>

                  <div className="analytics-stat">
                    <span>Study completed</span>

                    <strong>
                      {analytics.completedMinutes} min
                    </strong>
                  </div>

                  <div className="analytics-stat">
                    <span>Total study time</span>

                    <strong>
                      {analytics.totalMinutes} min
                    </strong>
                  </div>
                </div>

                <div className="analytics-subjects">
                  <div className="analytics-section-title">
                    <h3>Progress by subject</h3>

                    <span>
                      {analytics.subjectProgress?.length || 0}{' '}
                      subjects
                    </span>
                  </div>

                  {analytics.subjectProgress?.length > 0 ? (
                    analytics.subjectProgress.map((subject) => (
                      <div
                        className="analytics-subject"
                        key={subject.subject}
                      >
                        <div className="analytics-subject-top">
                          <div>
                            <strong>
                              {subject.subject}
                            </strong>

                            <span>
                              {subject.completedTasks}/
                              {subject.totalTasks} tasks
                            </span>
                          </div>

                          <strong>
                            {subject.progress}%
                          </strong>
                        </div>

                        <div className="analytics-progress-bar">
                          <div
                            className="analytics-progress-fill"
                            style={{
                              width: `${subject.progress}%`,
                            }}
                          />
                        </div>

                        <div className="analytics-subject-time">
                          <span>
                            {subject.completedMinutes} min completed
                          </span>

                          <span>
                            {subject.totalMinutes} min total
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-state small">
                      <p>
                        Complete some study tasks to see subject
                        progress.
                      </p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="empty-state small">
                <p>
                  Analytics are not available right now.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* MAIN GRID */}
        <section className="dashboard-grid">
          {/* TODAY'S PLAN */}
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <div>
                <h2>
                  Today's plan
                </h2>

                <p>
                  Your AI-generated study tasks
                  for today.
                </p>
              </div>

              {plan && (
                <button
                  type="button"
                  className="refresh-plan-btn"
                  onClick={
                    generateStudyPlan
                  }
                  disabled={
                    generating
                  }
                  title="Generate a fresh plan"
                >
                  <RefreshCw
                    size={17}
                    className={
                      generating
                        ? 'spinning'
                        : ''
                    }
                  />

                  {generating
                    ? 'Generating...'
                    : 'Regenerate'}
                </button>
              )}
            </div>

            {plan ? (
              <>
                <div className="progress-section">
                  <div className="progress-top">
                    <span>
                      Today's progress
                    </span>

                    <strong>
                      {completedTasks}/
                      {totalTasks} completed
                    </strong>
                  </div>

                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${progress}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="plan-content">
                  {plan.tasks.map(
                    (task, index) => (
                      <div
                        className={`plan-task ${
                          task.completed
                            ? 'completed'
                            : ''
                        }`}
                        key={
                          task._id ||
                          index
                        }
                      >
                        <input
                          type="checkbox"
                          checked={
                            task.completed
                          }
                          onChange={(e) =>
                            toggleTask(
                              plan._id,
                              task._id,
                              e.target
                                .checked
                            )
                          }
                          className="task-checkbox"
                        />

                        <div className="plan-task-number">
                          {index + 1}
                        </div>

                        <div className="plan-task-info">
                          <span className="plan-task-subject">
                            {task.subject}
                          </span>

                          <h3>
                            {task.title}
                          </h3>

                          <p>
                            {
                              task.description
                            }
                          </p>
                        </div>

                        <span className="plan-task-duration">
                          {task.duration}{' '}
                          min
                        </span>
                      </div>
                    )
                  )}
                </div>
              </>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">
                  <BookOpen size={25} />
                </div>

                <h3>
                  Your study plan is waiting
                </h3>

                <p>
                  We'll generate a
                  personalized plan based on
                  your subjects, exam dates,
                  difficulty levels, and
                  available study time.
                </p>

                {planError && (
                  <p className="plan-error">
                    {planError}
                  </p>
                )}

                <button
                  type="button"
                  className="primary-dashboard-btn"
                  onClick={
                    generateStudyPlan
                  }
                  disabled={generating}
                >
                  {generating
                    ? 'Generating...'
                    : 'Generate my study plan'}
                </button>
              </div>
            )}
          </div>

          {/* UPCOMING EXAMS */}
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <div>
                <h2>
                  Upcoming exams
                </h2>

                <p>
                  Keep track of what's
                  coming next.
                </p>
              </div>
            </div>

            <div className="exam-list">
              {loading ? (
                <div className="empty-state small">
                  <p>
                    Loading your exams...
                  </p>
                </div>
              ) : profile?.subjects
                  ?.length > 0 ? (
                profile.subjects
                  .map((subject) => {
                    const today =
                      new Date()

                    today.setHours(
                      0,
                      0,
                      0,
                      0
                    )

                    const examDate =
                      new Date(
                        subject.examDate
                      )

                    examDate.setHours(
                      0,
                      0,
                      0,
                      0
                    )

                    const difference =
                      Math.ceil(
                        (examDate -
                          today) /
                          (1000 *
                            60 *
                            60 *
                            24)
                      )

                    return {
                      ...subject,
                      difference,
                      examDate,
                    }
                  })
                  .sort(
                    (a, b) =>
                      a.examDate -
                      b.examDate
                  )
                  .map((subject) => (
                    <div
                      className="exam-item"
                      key={
                        subject._id ||
                        subject.name
                      }
                    >
                      <div>
                        <h3>
                          {subject.name}
                        </h3>

                        <p>
                          {subject.examDate.toLocaleDateString()}
                        </p>
                      </div>

                      <span className="exam-days">
                        {subject.difference >
                        0
                          ? `${subject.difference} days`
                          : subject.difference ===
                            0
                          ? 'Today'
                          : 'Passed'}
                      </span>
                    </div>
                  ))
              ) : (
                <div className="empty-state small">
                  <CalendarDays size={28} />

                  <h3>
                    No exams yet
                  </h3>

                  <p>
                    Add your subjects and exam
                    dates to see them here.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* EDIT PROFILE MODAL */}
      {showEditProfile && (
        <div
          className="modal-overlay"
          onMouseDown={(e) => {
            if (
              e.target ===
              e.currentTarget
            ) {
              closeEditProfile()
            }
          }}
        >
          <div className="edit-profile-modal">
            <div className="modal-header">
              <div>
                <p className="modal-eyebrow">
                  PERSONALIZE STUDYFLOW
                </p>

                <h2>
                  Edit study profile
                </h2>

                <p>
                  Update your subjects, exam
                  dates, difficulty, or daily
                  study time.
                </p>
              </div>

              <button
                type="button"
                className="close-modal-btn"
                onClick={
                  closeEditProfile
                }
                disabled={savingProfile}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="modal-section">
                <div className="modal-section-heading">
                  <div>
                    <h3>
                      Your subjects
                    </h3>

                    <p>
                      Keep your exam information
                      up to date.
                    </p>
                  </div>

                  <span>
                    {editSubjects.length}
                  </span>
                </div>

                <div className="edit-subjects-list">
                  {editSubjects.map(
                    (subject, index) => (
                      <div
                        className="edit-subject-item"
                        key={index}
                      >
                        <div className="edit-subject-number">
                          {String(
                            index + 1
                          ).padStart(
                            2,
                            '0'
                          )}
                        </div>

                        <div className="edit-subject-fields">
                          <div className="form-group">
                            <label>
                              Subject name
                            </label>

                            <input
                              type="text"
                              value={
                                subject.name
                              }
                              placeholder="e.g. Database Systems"
                              onChange={(e) =>
                                updateEditSubject(
                                  index,
                                  'name',
                                  e.target
                                    .value
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
                              value={
                                subject.examDate
                              }
                              onChange={(e) =>
                                updateEditSubject(
                                  index,
                                  'examDate',
                                  e.target
                                    .value
                                )
                              }
                            />
                          </div>

                          <div className="form-group">
                            <label>
                              Difficulty
                            </label>

                            <select
                              value={
                                subject.difficulty
                              }
                              onChange={(e) =>
                                updateEditSubject(
                                  index,
                                  'difficulty',
                                  e.target
                                    .value
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

                        {editSubjects.length >
                          1 && (
                          <button
                            type="button"
                            className="remove-edit-subject"
                            onClick={() =>
                              removeEditSubject(
                                index
                              )
                            }
                            disabled={
                              savingProfile
                            }
                            title="Remove subject"
                          >
                            <Trash2
                              size={17}
                            />
                          </button>
                        )}
                      </div>
                    )
                  )}
                </div>

                <button
                  type="button"
                  className="add-edit-subject-btn"
                  onClick={
                    addEditSubject
                  }
                  disabled={
                    savingProfile
                  }
                >
                  <Plus size={17} />
                  Add another subject
                </button>
              </div>

              <div className="modal-section">
                <div className="modal-section-heading">
                  <div>
                    <h3>
                      Daily study time
                    </h3>

                    <p>
                      Tell the AI how much time
                      you can study each day.
                    </p>
                  </div>

                  <Clock
                    size={21}
                    className="modal-clock-icon"
                  />
                </div>

                <div className="hours-options modal-hours">
                  {[
                    '1',
                    '2',
                    '3',
                    '4',
                    '5+',
                  ].map((hours) => (
                    <button
                      key={hours}
                      type="button"
                      className={`hours-option ${
                        editStudyHours ===
                        hours
                          ? 'selected'
                          : ''
                      }`}
                      onClick={() =>
                        setEditStudyHours(
                          hours
                        )
                      }
                      disabled={
                        savingProfile
                      }
                    >
                      <strong>
                        {hours}
                      </strong>

                      <span>
                        {hours ===
                        '1'
                          ? 'hour'
                          : 'hours'}{' '}
                        / day
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {profileError && (
                <div className="profile-error">
                  {profileError}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="cancel-profile-btn"
                onClick={
                  closeEditProfile
                }
                disabled={
                  savingProfile
                }
              >
                Cancel
              </button>

              <button
                type="button"
                className="save-profile-btn"
                onClick={
                  saveStudyProfile
                }
                disabled={
                  savingProfile
                }
              >
                <Save size={17} />

                {savingProfile
                  ? 'Saving & regenerating...'
                  : 'Save & regenerate plan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard