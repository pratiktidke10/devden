import Avatar from './Avatar'
import { Link } from 'react-router-dom'

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
                    <span className="text-den-faint font-mono text-xs shrink-0">{a.time}</span>
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