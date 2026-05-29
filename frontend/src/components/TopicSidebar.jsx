
//The left sidebar showing all topics with room counts.
//The active topic is controlled by parent(Home.jsx) using props

function TopicSidebar({ topics, activeTopic, onTopicSelect, loading }) {

  if (loading) {
    return (
      <aside className="w-52 shrink-0 hidden lg:block">
        <p className="font-mono text-xs text-den-faint uppercase tracking-widest mb-3">Topics</p>
        {/* Skeleton loading — shows placeholder UI while data loads */}
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-8 bg-den-surface rounded mb-1 animate-pulse" />
        ))}
      </aside>
    )
  }

  return (
    <aside className="w-52 shrink-0 hidden lg:block">
      <p className="font-mono text-xs text-den-faint uppercase tracking-widest mb-3">Topics</p>

      {/* All Rooms option — always shown first */}
      <button
        onClick={() => onTopicSelect('')}
        className={`w-full flex items-center justify-between px-3 py-2 text-sm border-l-2 transition-all mb-0.5
          ${activeTopic === ''
            ? 'border-den-blue text-den-blue bg-[#1c2128]'
            : 'border-transparent text-den-muted hover:text-den-text hover:bg-[#1c2128]'
          }`}
      >
        <span>All Rooms</span>
        <span className={`font-mono text-xs px-2 py-0.5 rounded-full
          ${activeTopic === '' ? 'bg-[#1f3a5f] text-den-blue' : 'bg-den-border text-den-faint'}`}>
          {topics.reduce((sum, t) => sum + (t.room_count || 0), 0)}
        </span>
      </button>

      {/* Topic list from API */}
      {topics.map(topic => (
        <button
          key={topic.id}
          onClick={() => onTopicSelect(topic.name)}
          className={`w-full flex items-center justify-between px-3 py-2 text-sm border-l-2 transition-all mb-0.5
            ${activeTopic === topic.name
              ? 'border-den-blue text-den-blue bg-[#1c2128]'
              : 'border-transparent text-den-muted hover:text-den-text hover:bg-[#1c2128]'
            }`}
        >
          <span>{topic.name}</span>
          <span className={`font-mono text-xs px-2 py-0.5 rounded-full
            ${activeTopic === topic.name ? 'bg-[#1f3a5f] text-den-blue' : 'bg-den-border text-den-faint'}`}>
            {topic.room_count || 0}
          </span>
        </button>
      ))}
    </aside>
  )
}

export default TopicSidebar