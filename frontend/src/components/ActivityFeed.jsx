
// The right sidebar showing recent messages across all rooms.
// Shows who said what, in which room, and when.

import Avatar from './Avatar'

function ActivityFeed({ activities, loading }) {

  const suggested = ['TypeScript', 'Next.js', 'PostgreSQL', 'Docker', 'FastAPI']

  if (loading) {
    return (
      <aside className="w-56 shrink-0 hidden xl:block">
        <p className="font-mono text-xs text-den-faint uppercase tracking-widest mb-3">Recent Activity</p>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-16 bg-den-surface rounded mb-3 animate-pulse" />
        ))}
      </aside>
    )
  }

  return (
    <aside className="w-56 shrink-0 hidden xl:block">
      <p className="font-mono text-xs text-den-faint uppercase tracking-widest mb-3">Recent Activity</p>

      {activities.length === 0 ? (
        <p className="text-den-faint text-xs font-mono">No activity yet.</p>
      ) : (
        activities.map((a, i) => (
          <div key={i} className="flex gap-2 mb-3 pb-3 border-b border-den-border">
            <Avatar
              initials={a.user?.name?.slice(0, 2).toUpperCase()}
              color="#1f6feb"
              imageUrl={a.user?.avatar}
              size="sm"
            />
            <div className="flex-1 min-w-0">
              <p className="text-den-text text-xs font-medium">{a.user?.name}</p>
              <p className="text-den-faint text-xs leading-snug line-clamp-2">{a.body}</p>
              <p className="text-den-blue font-mono text-xs mt-0.5"># {a.room?.name}</p>
            </div>
            <span className="text-den-faint font-mono text-xs shrink-0">{a.created}</span>
          </div>
        ))
      )}

      {/* Suggested topics */}
      <div className="border-t border-den-border pt-4 mt-1">
        <p className="font-mono text-xs text-den-faint uppercase tracking-widest mb-3">Suggested Topics</p>
        <div className="flex flex-wrap gap-2">
          {suggested.map(s => (
            <span
              key={s}
              className="text-xs bg-[#1c2128] text-den-muted border border-den-border px-2.5 py-1 rounded-full font-mono cursor-pointer hover:text-den-text transition-colors"
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