
// Full page version of the activity feed.
// Shows all recent messages across every room — like a global timeline.
// Useful for discovering active conversations.

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getActivity } from '../api/activity'
import Avatar from '../components/Avatar'

function Activity() {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchActivity()
  }, [])

  const fetchActivity = async () => {
    try {
      const res = await getActivity()
      setActivities(res.data)
    } catch (err) {
      setError('Could not load activity feed.')
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (dateStr) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleString('en-IN', {
      day: 'numeric', month: 'short',
      hour: '2-digit', minute: '2-digit'
    })
  }

  return (
    <div className="max-w-screen-md mx-auto px-5 py-6">

      {/* Header */}
      <div className="mb-6">
        <h1 className="font-mono text-lg font-bold text-den-text">Activity Feed</h1>
        <p className="text-den-muted text-sm mt-1">
          Recent messages across all rooms
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-[#2d1b1b] border border-den-red text-den-red text-sm font-mono p-3 rounded-lg mb-4">
          ⚠ {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-20 bg-den-surface rounded-xl animate-pulse" />
          ))}
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-16 text-den-faint font-mono text-sm">
          No activity yet.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {activities.map((activity, i) => (
            <div
              key={i}
              className="bg-den-surface border border-den-border rounded-xl p-4 hover:border-den-border2 transition-colors"
            >
              <div className="flex items-start gap-3">
                <Link to={`/profile/${activity.user?.id}`}>
                  <Avatar
                    initials={activity.user?.name?.slice(0, 2).toUpperCase()}
                    imageUrl={activity.user?.avatar}
                    size="md"
                  />
                </Link>

                <div className="flex-1 min-w-0">
                  {/* User + room + time */}
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <Link
                      to={`/profile/${activity.user?.id}`}
                      className="text-sm font-medium text-den-text hover:text-den-blue transition-colors"
                    >
                      {activity.user?.name}
                    </Link>
                    <span className="text-den-faint text-xs">posted in</span>
                    <Link
                      to={`/room/${activity.room?.id}`}
                      className="text-den-blue font-mono text-xs hover:underline"
                    >
                      # {activity.room?.name}
                    </Link>
                    <span className="text-den-faint font-mono text-xs ml-auto">
                      {formatTime(activity.created)}
                    </span>
                  </div>

                  {/* Message body */}
                  <p className="text-den-muted text-sm leading-relaxed line-clamp-2">
                    {activity.body}
                  </p>

                  {/* Topic tag */}
                  {activity.room?.topic && (
                    <span className="inline-block mt-2 text-xs bg-[#1f3a5f] text-den-blue px-2 py-0.5 rounded-full font-mono">
                      {activity.room.topic.name}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Activity