
// Now auth-aware — shows different UI for logged in vs logged out users.
// Reads token from localStorage to determine auth state.
// On logout clears localStorage and redirects home.

import { Link, useNavigate } from 'react-router-dom'
import { logoutUser } from '../api/auth'

function Navbar() {
  const navigate = useNavigate()

  // Check if user is logged in by looking for token in localStorage
  const token = localStorage.getItem('access_token')
  const userId = localStorage.getItem('user_id')
  const userName = localStorage.getItem('user_name')

  const handleLogout = async () => {
    try {
      const refresh = localStorage.getItem('refresh_token')
      await logoutUser(refresh)
    } catch (err) {
      // Even if API call fails, clear local storage
      console.error('Logout error', err)
    } finally {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user_id')
      localStorage.removeItem('user_name')
      navigate('/')
      window.location.reload()
    }
  }

  return (
    <nav className="bg-den-surface border-b border-den-border sticky top-0 z-50">
      <div className="max-w-screen-xl mx-auto px-5 h-14 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 no-underline">
          <img src="/devden-favicon.svg" alt="DevDen" className="w-7 h-7" />
          <span className="font-mono font-bold text-den-blue text-lg tracking-tight">
            Dev<span className="text-den-green">Den</span>
          </span>
        </Link>

        {/* Center links */}
        <div className="hidden md:flex items-center gap-5">
          <Link
            to="/topics"
            className="text-sm text-den-muted hover:text-den-text transition-colors no-underline"
          >
            Topics
          </Link>
          <Link
            to="/activity"
            className="text-sm text-den-muted hover:text-den-text transition-colors no-underline"
          >
            Activity
          </Link>
        </div>

        {/* Right side — auth aware */}
        <div className="flex items-center gap-3">
          {token ? (
            // Logged in state
            <>
              <Link
                to="/create-room"
                className="hidden sm:flex items-center gap-1.5 text-sm text-white bg-[#238636] hover:opacity-90 px-3 py-1.5 rounded-md transition-opacity no-underline font-medium"
              >
                <span className="text-base leading-none">+</span>
                New Room
              </Link>
              <Link
                to={`/profile/${userId}`}
                className="flex items-center gap-2 no-underline group"
              >
                <div className="w-8 h-8 rounded-full bg-[#1f6feb] flex items-center justify-center text-xs font-bold text-white">
                  {userName?.slice(0, 2).toUpperCase() || 'U'}
                </div>
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm text-den-muted hover:text-den-red border border-den-border2 px-3 py-1.5 rounded-md transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            // Logged out state
            <>
              <Link
                to="/login"
                className="text-sm text-den-muted hover:text-den-text border border-den-border2 px-3 py-1.5 rounded-md transition-colors no-underline"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="text-sm text-white bg-den-green hover:opacity-90 px-3 py-1.5 rounded-md transition-opacity no-underline font-medium"
              >
                Register
              </Link>
            </>
          )}
        </div>

      </div>
    </nav>
  )
}

export default Navbar