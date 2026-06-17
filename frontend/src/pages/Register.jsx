
// Similar to Login but with more fields.
// After successful registration the API returns tokens too —
// so we log them in immediately without needing to go to login page.

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerUser } from '../api/auth'
import { useAuth } from '../context/AuthContext'

function Register() {
  const navigate = useNavigate()
  const {login} = useAuth

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    password2: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Client-side validation before hitting the API
    if (formData.password !== formData.password2) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      const res = await registerUser({
        name: formData.name,
        username: formData.username.toLowerCase(),
        email: formData.email.toLowerCase(),
        password: formData.password,
        password2: formData.password2,
      })

      login(res.data.user, { access: res.data.access, refresh: res.data.refresh })

      navigate('/')
    } catch (err) {
      // DRF returns field errors as an object — we grab the first one
      const data = err.response?.data
      if (data) {
        const firstError = Object.values(data)[0]
        setError(Array.isArray(firstError) ? firstError[0] : firstError)
      } else {
        setError('Registration failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="font-mono font-bold text-den-blue text-2xl flex items-center justify-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-den-green animate-pulse"></span>
            DevDen
          </div>
          <p className="text-den-muted text-sm">Join the developer community</p>
        </div>

        {/* Card */}
        <div className="bg-den-surface border border-den-border rounded-xl p-6">

          <h1 className="font-mono text-base font-bold text-den-text mb-5">
            Create your account
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
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                required
                className="w-full bg-den-bg border border-den-border2 rounded-lg px-3 py-2.5 text-sm text-den-text placeholder-den-faint outline-none focus:border-den-blue transition-colors"
              />
            </div>

            <div>
              <label className="block font-mono text-xs text-den-faint uppercase tracking-wider mb-1.5">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="johndoe"
                required
                className="w-full bg-den-bg border border-den-border2 rounded-lg px-3 py-2.5 text-sm text-den-text placeholder-den-faint outline-none focus:border-den-blue transition-colors"
              />
            </div>

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

            <div>
              <label className="block font-mono text-xs text-den-faint uppercase tracking-wider mb-1.5">
                Confirm Password
              </label>
              <input
                type="password"
                name="password2"
                value={formData.password2}
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
              {loading ? 'Creating account...' : 'Create account'}
            </button>

          </form>
        </div>

        {/* Footer link */}
        <p className="text-center text-den-muted text-sm mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-den-blue hover:underline">
            Sign in
          </Link>
        </p>

      </div>
    </div>
  )
}

export default Register