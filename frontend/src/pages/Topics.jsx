
// Shows all topics with room counts.
// Searchable — filters in real time as user types.

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getTopics } from '../api/topics'

function Topics() {
  const [topics, setTopics] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTopics()
  }, [])

  // Re-fetch when search changes — debounced via useEffect
  useEffect(() => {
    const timer = setTimeout(() => fetchTopics(), 300)
    return () => clearTimeout(timer)
    // The cleanup function cancels the previous timer before
    // setting a new one — this is called debouncing.
    // Without this, every keystroke fires an API call.
    // With it, we wait 300ms after the user stops typing.
  }, [search])

  const fetchTopics = async () => {
    try {
      const res = await getTopics(search)
      setTopics(res.data)
    } catch (err) {
      console.error('Failed to load topics', err)
    } finally {
      setLoading(false)
    }
  }

  // Generate a consistent color for each topic based on its name
  // This way the same topic always gets the same color
  const topicColor = (name) => {
    const colors = [
      { bg: '#1f3a5f', text: '#58a6ff' },
      { bg: '#1a2d1e', text: '#3fb950' },
      { bg: '#2d2510', text: '#d29922' },
      { bg: '#251a35', text: '#8957e5' },
      { bg: '#2d1b1b', text: '#da3633' },
      { bg: '#1a2d2d', text: '#39d353' },
    ]
    const index = name.charCodeAt(0) % colors.length
    return colors[index]
  }

  return (
    <div className="max-w-screen-lg mx-auto px-5 py-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="font-mono text-lg font-bold text-den-text">Browse Topics</h1>
          <p className="text-den-muted text-sm mt-1">
            Find rooms by the technologies you care about
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-den-faint absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search topics..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-den-surface border border-den-border2 rounded-lg pl-9 pr-4 py-2 text-sm text-den-text placeholder-den-faint outline-none focus:border-den-blue transition-colors"
          />
        </div>
      </div>

      {/* Topics Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-24 bg-den-surface rounded-xl animate-pulse" />
          ))}
        </div>
      ) : topics.length === 0 ? (
        <div className="text-center py-16 text-den-faint font-mono text-sm">
          {search ? `No topics matching "${search}"` : 'No topics yet.'}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {topics.map(topic => {
            const color = topicColor(topic.name)
            return (
              // Clicking a topic goes home with that topic pre-filtered
              <Link
                key={topic.id}
                to={`/?topic=${topic.name}`}
                className="no-underline"
              >
                <div className="bg-den-surface border border-den-border rounded-xl p-4 hover:border-den-border2 hover:bg-[#1c2128] transition-all group">
                  {/* Topic initial badge */}
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center font-mono font-bold text-sm mb-3"
                    style={{ background: color.bg, color: color.text }}
                  >
                    {topic.name.slice(0, 2).toUpperCase()}
                  </div>
                  <p className="text-den-text font-medium text-sm group-hover:text-den-blue transition-colors">
                    {topic.name}
                  </p>
                  <p className="text-den-faint font-mono text-xs mt-1">
                    {topic.room_count || 0} rooms
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      )}

    </div>
  )
}

export default Topics