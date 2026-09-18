import { Link, useNavigate } from 'react-router-dom'
import { BookOpen, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import './Auth.css'

function Login() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
const handleSubmit = async (e) => {
  e.preventDefault()
  setError('')
  setLoading(true)

  try {
    const response = await fetch(
      'http://localhost:5000/api/auth/login',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      setError(data.message || 'Login failed.')
      setLoading(false)
      return
    }

    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))

    navigate('/dashboard')
  } catch (error) {
    setError('Unable to connect to the server. Please try again.')
  }

  setLoading(false)
}
  return (
    <div className="auth-page">

      <div className="auth-brand">
        <Link to="/" className="auth-logo">
          <div className="logo-icon">
            S
          </div>

          <span>StudyFlow</span>
        </Link>
      </div>

      <div className="auth-container">

        <div className="auth-card">

          <div className="auth-icon">
            <BookOpen size={22} />
          </div>

          <h1>Welcome back</h1>

          <p className="auth-subtitle">
            Log in to continue your study journey.
          </p>

          <form onSubmit={handleSubmit}>

            <div className="form-group">
              <label htmlFor="email">
                Email address
              </label>

            <input
  id="email"
  type="email"
  placeholder="you@example.com"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>
            </div>

            <div className="form-group">
              <label htmlFor="password">
                Password
              </label>

              <div className="password-wrapper">

              <input
  id="password"
  type={showPassword ? 'text' : 'password'}
  placeholder="Enter your password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
/>

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>

              </div>
            </div>
{error && <p className="auth-error">{error}</p>}
       <button type="submit" className="auth-submit" disabled={loading}>
  {loading ? 'Logging in...' : 'Log in'}
</button>

          </form>

          <p className="auth-footer">
            Don't have an account?{' '}
            <Link to="/register">
              Create one
            </Link>
          </p>

        </div>

      </div>

    </div>
  )
}

export default Login