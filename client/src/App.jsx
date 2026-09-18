
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import './App.css'
import Register from './pages/Register'
import Login from './pages/Login'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import Analytics from './pages/Analytics'

function Home() {
  return (
    <div className="app">
      
      <nav className="navbar">
        <div className="logo">
          <div className="logo-icon">S</div>
          <span>StudyFlow</span>
        </div>

        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>

          <Link to="/login" className="login-btn">
            Log in
          </Link>

          <Link to="/register" className="signup-btn">
            Get started
          </Link>
        </div>
      </nav>

      <main>
        <section className="hero">
          
          <div className="hero-content">
            <div className="badge">
              ✦ AI-powered study planning
            </div>

            <h1>
              Study smarter.
              <br />
              <span>Achieve more.</span>
            </h1>

            <p>
              Create personalized study plans based on your subjects,
              exams, difficulty level, and available study time.
            </p>

            <div className="hero-buttons">
              <Link to="/register" className="primary-btn">
                Create my study plan →
              </Link>

              <a href="#how-it-works" className="secondary-btn">
                See how it works
              </a>
            </div>

            <div className="trust-text">
              No complicated setup · Built for students
            </div>
          </div>

          <div className="hero-card">
            
            <div className="card-header">
              <div>
                <p className="small-label">TODAY'S OVERVIEW</p>
                <h3>Monday, September 14</h3>
              </div>

              <div className="avatar">FA</div>
            </div>

            <div className="progress-section">
              <div className="progress-info">
                <span>Daily progress</span>
                <strong>72%</strong>
              </div>

              <div className="progress-bar">
                <div className="progress-fill"></div>
              </div>
            </div>

            <div className="tasks">
              <div className="task completed">
                <div className="check">✓</div>
                <div>
                  <strong>Review Data Structures</strong>
                  <span>45 minutes · Completed</span>
                </div>
              </div>

              <div className="task">
                <div className="check empty"></div>
                <div>
                  <strong>Practice React Hooks</strong>
                  <span>60 minutes · High priority</span>
                </div>
              </div>

              <div className="task">
                <div className="check empty"></div>
                <div>
                  <strong>Study Database Systems</strong>
                  <span>40 minutes · Medium priority</span>
                </div>
              </div>
            </div>

            <div className="streak">
              <span>🔥</span>
              <div>
                <strong>7 day streak</strong>
                <p>Keep going! You're doing great.</p>
              </div>
            </div>

          </div>

        </section>

        <section className="features" id="features">
          <div className="section-heading">
            <p className="eyebrow">EVERYTHING IN ONE PLACE</p>
            <h2>Your personal study assistant</h2>
            <p>
              Stay organized, understand what to study next,
              and keep yourself accountable.
            </p>
          </div>

          <div className="feature-grid">

            <div className="feature-card">
              <div className="feature-icon">✦</div>
              <h3>AI Study Plans</h3>
              <p>
                Get a personalized study schedule generated
                around your exams and available time.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">✓</div>
              <h3>Daily Tasks</h3>
              <p>
                Break large subjects into manageable daily
                tasks and track what you've completed.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">↗</div>
              <h3>Progress Tracking</h3>
              <p>
                See your progress, maintain streaks, and
                understand how consistently you're studying.
              </p>
            </div>

          </div>
        </section>

        <section className="how-it-works" id="how-it-works">
          <div className="section-heading">
            <p className="eyebrow">HOW IT WORKS</p>
            <h2>From overwhelmed to organized</h2>
          </div>

          <div className="steps">

            <div className="step">
              <div className="step-number">01</div>
              <h3>Add your subjects</h3>
              <p>
                Tell StudyFlow what you're studying,
                when your exams are, and how difficult
                each subject feels.
              </p>
            </div>

            <div className="step">
              <div className="step-number">02</div>
              <h3>Let AI plan it</h3>
              <p>
                Our AI creates a realistic schedule
                based on your available study hours
                and priorities.
              </p>
            </div>

            <div className="step">
              <div className="step-number">03</div>
              <h3>Track your progress</h3>
              <p>
                Complete daily tasks and watch your
                progress grow over time.
              </p>
            </div>

          </div>
        </section>
      </main>

      <footer>
        <div className="logo">
          <div className="logo-icon">S</div>
          <span>StudyFlow</span>
        </div>

        <p>Built to make studying a little easier.</p>
      </footer>

    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
     <Routes>
      
  <Route path="/" element={<Home />} />
  <Route path="/register" element={<Register />} />
  <Route path="/login" element={<Login />} />
  <Route path="/onboarding" element={<Onboarding />} /> 
  <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/analytics" element={<Analytics />} />
</Routes>

    </BrowserRouter>
  )
}

export default App