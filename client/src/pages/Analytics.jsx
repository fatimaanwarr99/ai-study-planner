import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Clock,
  Target,
} from 'lucide-react'
import './Analytics.css'

function Analytics() {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const token = localStorage.getItem('token')

  useEffect(() => {
    if (!token) {
      window.location.href = '/login'
      return
    }

    const loadAnalytics = async () => {
      try {
        const response = await fetch(
          'http://https://ai-study-planner-delta-ochre.vercel.app/api/analytics',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        const data = await response.json()

        if (!response.ok) {
          setError(
            data.message || 'Could not load analytics.'
          )
          return
        }

        setAnalytics(data.analytics)
      } catch (error) {
        console.error('Analytics error:', error)
        setError('Unable to connect to the server.')
      } finally {
        setLoading(false)
      }
    }

    loadAnalytics()
  }, [token])

  if (loading) {
    return (
      <div className="analytics-page">
        <div className="analytics-loading">
          Loading your analytics...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="analytics-page">
        <div className="analytics-error">
          <h2>Unable to load analytics</h2>
          <p>{error}</p>

          <Link to="/dashboard">
            Back to dashboard
          </Link>
        </div>
      </div>
    )
  }

  const subjectProgress =
    analytics?.subjectProgress || []

  const dailyActivity =
    analytics?.dailyActivity || []

  return (
    <div className="analytics-page">
      <header className="analytics-header">
        <Link
          to="/dashboard"
          className="analytics-back"
        >
          <ArrowLeft size={18} />
          Dashboard
        </Link>

        <div className="analytics-title">
          <div className="analytics-title-icon">
            <BarChart3 size={21} />
          </div>

          <div>
            <h1>Study Analytics</h1>
            <p>
              Track your study progress and activity.
            </p>
          </div>
        </div>
      </header>

      <main className="analytics-container">
        {/* SUMMARY CARDS */}

        <section className="analytics-stats">
          <div className="analytics-stat-card">
            <div className="analytics-stat-icon">
              <BookOpen size={21} />
            </div>

            <div>
              <span>Total tasks</span>
              <strong>
                {analytics?.totalTasks || 0}
              </strong>
            </div>
          </div>

          <div className="analytics-stat-card">
            <div className="analytics-stat-icon">
              <CheckCircle2 size={21} />
            </div>

            <div>
              <span>Completed</span>
              <strong>
                {analytics?.completedTasks || 0}
              </strong>
            </div>
          </div>

          <div className="analytics-stat-card">
            <div className="analytics-stat-icon">
              <Clock size={21} />
            </div>

            <div>
              <span>Study minutes</span>
              <strong>
                {analytics?.completedMinutes || 0}
              </strong>
            </div>
          </div>

          <div className="analytics-stat-card">
            <div className="analytics-stat-icon">
              <Target size={21} />
            </div>

            <div>
              <span>Overall progress</span>
              <strong>
                {analytics?.overallProgress || 0}%
              </strong>
            </div>
          </div>
        </section>

        {/* DAILY ACTIVITY */}

        <section className="analytics-card">
          <div className="analytics-card-header">
            <div>
              <h2>Last 7 days</h2>
              <p>
                Your completed study activity.
              </p>
            </div>
          </div>

          <div className="activity-list">
            {dailyActivity.map((day) => {
              const date = new Date(
                `${day.date}T00:00:00`
              )

              return (
                <div
                  className="activity-item"
                  key={day.date}
                >
                  <div className="activity-date">
                    <strong>
                      {date.toLocaleDateString(
                        undefined,
                        {
                          weekday: 'short',
                        }
                      )}
                    </strong>

                    <span>
                      {date.toLocaleDateString(
                        undefined,
                        {
                          month: 'short',
                          day: 'numeric',
                        }
                      )}
                    </span>
                  </div>

                  <div className="activity-bar-container">
                    <div className="activity-bar">
                      <div
                        className="activity-bar-fill"
                        style={{
                          width: `${Math.min(
                            day.minutes,
                            180
                          ) / 1.8}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="activity-value">
                    <strong>
                      {day.minutes} min
                    </strong>

                    <span>
                      {day.completed} tasks
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* SUBJECT PROGRESS */}

        <section className="analytics-card">
          <div className="analytics-card-header">
            <div>
              <h2>Progress by subject</h2>
              <p>
                See how you're progressing across
                your subjects.
              </p>
            </div>
          </div>

          <div className="subject-analytics-list">
            {subjectProgress.length > 0 ? (
              subjectProgress.map((subject) => (
                <div
                  className="subject-analytics-item"
                  key={subject.subject}
                >
                  <div className="subject-analytics-top">
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

                  <div className="subject-progress-bar">
                    <div
                      className="subject-progress-fill"
                      style={{
                        width: `${subject.progress}%`,
                      }}
                    />
                  </div>

                  <div className="subject-analytics-bottom">
                    <span>
                      {subject.completedMinutes} min
                      completed
                    </span>

                    <span>
                      {subject.totalMinutes} min total
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="analytics-empty">
                <BookOpen size={28} />

                <h3>No study data yet</h3>

                <p>
                  Complete some study tasks to see
                  your analytics.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}

export default Analytics