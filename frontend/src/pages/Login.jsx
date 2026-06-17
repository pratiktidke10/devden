
// Smart component — manages form state and calls the auth API.
// On success it stores the JWT token and redirects to home.

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loginUser } from '../api/auth'
import { useAuth } from '../context/AuthContext'

function Login() {
  const navigate = useNavigate()
  const {login} = useAuth()

  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Single handler for all inputs — reads the name attribute
  // to know which field to update. Scales cleanly as fields grow.
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault() // prevent browser default form reload
    setError('')
    setLoading(true)

    try {
      const res = await loginUser(formData.email, formData.password)

      login(res.data.user, { access: res.data.access, refresh: res.data.refresh }) 

      navigate('/') // redirect to home on success
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="font-mono font-bold text-den-blue text-2xl flex items-center justify-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-den-green animate-pulse"></span>
            DevDen
          </div>
          <p className="text-den-muted text-sm">Welcome back, developer</p>
        </div>

        {/* Card */}
        <div className="bg-den-surface border border-den-border rounded-xl p-6">

          <h1 className="font-mono text-base font-bold text-den-text mb-5">
            Sign in to your account
          </h1>

          {/* Error message */}
          {error && (
            <div className="bg-[#2d1b1b] border border-den-red text-den-red text-sm font-mono p-3 rounded-lg mb-4">
              ⚠ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            <div>
              <label className="block font-mono text-xs text-den-faint uppercase tracking-wider mb-1.5">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                className="w-full bg-den-bg border border-den-border2 rounded-lg px-3 py-2.5 text-sm text-den-text placeholder-den-faint outline-none focus:border-den-blue transition-colors"
              />
            </div>

            <div>
              <label className="block font-mono text-xs text-den-faint uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="w-full bg-den-bg border border-den-border2 rounded-lg px-3 py-2.5 text-sm text-den-text placeholder-den-faint outline-none focus:border-den-blue transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#238636] hover:opacity-90 disabled:opacity-50 text-white font-medium text-sm py-2.5 rounded-lg transition-opacity mt-1"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>

          </form>
        </div>

        {/* Footer link */}
        <p className="text-center text-den-muted text-sm mt-4">
          Don't have an account?{' '}
          <Link to="/register" className="text-den-blue hover:underline">
            Register
          </Link>
        </p>

      </div>
    </div>
  )
}

export default Login