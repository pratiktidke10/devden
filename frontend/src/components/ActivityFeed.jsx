import Avatar from './Avatar'
import { Link } from 'react-router-dom'

// Converts an ISO timestamp like "2026-06-18T07:44:22.479518+05:30"
// into a short relative string like "2d ago" or "5m ago"
function timeAgo(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  const seconds = Math.floor((new Date() - date) / 1000)

  const intervals = [
    { label: 'y', secs: 31536000 },
    { label: 'mo', secs: 2592000 },
    { label: 'd', secs: 86400 },
    { label: 'h', secs: 3600 },
    { label: 'm', secs: 60 },
  ]

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.secs)
    if (count >= 1) return `${count}${interval.label} ago`
  }
  return 'just now'
}

function ActivityFeed({ activities, loading }) {
  const suggested = ['TypeScript', 'Next.js', 'PostgreSQL', 'Docker', 'FastAPI']

  return (
    <aside className="w-56 shrink-0 hidden xl:flex flex-col gap-4">

      {/* Recent Activity */}
      <div className="bg-den-surface border border-den-border rounded-xl p-4">
        <p className="font-mono text-xs text-den-faint uppercase tracking-widest mb-4">
          Recent Activity
        </p>

        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="h-14 bg-den-bg rounded-lg mb-3 animate-pulse" />
          ))
        ) : activities.length === 0 ? (
          <p className="text-den-faint font-mono text-xs">No activity yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {activities.map((a, i) => (
              <div key={i} className="flex gap-2 pb-3 border-b border-den-border last:border-0 last:pb-0">
                <Avatar
                  initials={a.user?.name?.slice(0, 2).toUpperCase()}
                  imageUrl={a.user?.avatar}
                  size="sm"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <Link
                      to={`/profile/${a.user?.id}`}
                      className="text-xs font-medium text-den-text hover:text-den-blue transition-colors truncate"
                    >
                      {a.user?.name}
                    </Link>
                    <span className="text-den-faint font-mono text-xs shrink-0">
                      {timeAgo(a.created)}
                    </span>
                  </div>
                  <p className="text-xs text-den-faint leading-snug line-clamp-2 mt-0.5">
                    {a.body}
                  </p>
                  <Link
                    to={`/room/${a.room?.id}`}
                    className="text-xs text-den-blue font-mono mt-0.5 block hover:underline truncate"
                  >
                    # {a.room?.name}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Suggested Topics */}
      <div className="bg-den-surface border border-den-border rounded-xl p-4">
        <p className="font-mono text-xs text-den-faint uppercase tracking-widest mb-3">
          Suggested Topics
        </p>
        <div className="flex flex-wrap gap-2">
          {suggested.map(s => (
            <span
              key={s}
              className="text-xs bg-den-bg text-den-muted border border-den-border px-2.5 py-1 rounded-full font-mono cursor-pointer hover:text-den-text hover:border-den-blue transition-colors"
            >
              {s}
            </span>
          ))}
        </div>
      </div>

    </aside>
  )
}

export default ActivityFeed