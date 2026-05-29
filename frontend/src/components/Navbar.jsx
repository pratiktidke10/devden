import { Link } from 'react-router-dom'

function Navbar() {
  return (
    <nav className="bg-den-surface border-b border-den-border sticky top-0 z-50">
      <div className="max-w-screen-xl mx-auto px-5 h-14 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 no-underline">
          <span className="w-2 h-2 rounded-full bg-den-green animate-pulse"></span>
          <span className="font-mono font-bold text-den-blue text-lg tracking-tight">
            DevDen
          </span>
        </Link>

        {/* Search */}
        <div className="hidden md:flex items-center bg-den-bg border border-den-border2 rounded-lg px-3 py-1.5 gap-2 w-64">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-den-faint" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search rooms..."
            className="bg-transparent text-sm text-den-text placeholder-den-faint outline-none w-full"
          />
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="text-sm text-den-muted hover:text-den-text border border-den-border2 px-3 py-1.5 rounded-md transition-colors"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="text-sm text-white bg-den-green hover:opacity-90 px-3 py-1.5 rounded-md transition-opacity font-medium"
          >
            Register
          </Link>
        </div>

      </div>
    </nav>
  )
}

export default Navbar