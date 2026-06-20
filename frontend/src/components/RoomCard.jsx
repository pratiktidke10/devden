import { useNavigate } from 'react-router-dom'
import Avatar from './Avatar'

function timeAgo(dateString) {
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

function RoomCard({ room }) {
  const navigate = useNavigate()

  return (
    <div
      onClick={() => navigate(`/room/${room.id}`)}
      className="bg-den-surface border border-den-border rounded-xl p-4 mb-3 hover:border-den-border2 hover:bg-[#1c2128] transition-all cursor-pointer"
    >
      {/* Room name + topic tag */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <span className="text-den-text font-medium text-sm leading-snug">
          {room.name}
        </span>
        <span className="text-xs bg-[#1f3a5f] text-den-blue px-2 py-0.5 rounded-full font-mono shrink-0">
          {room.topic?.name || room.topic}
        </span>
      </div>

      {/* Description */}
      {room.description && (
        <p className="text-den-faint text-xs leading-relaxed mb-3 line-clamp-2">
          {room.description}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar
            initials={room.host?.name?.slice(0, 2).toUpperCase()}
            color="#1f6feb"
            imageUrl={room.host?.avatar}
            size="sm"
          />
          <span className="text-den-muted text-xs">{room.host?.name}</span>
        </div>
        <div className="flex items-center gap-3 text-den-faint font-mono text-xs">
          <span className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-5-3.5M9 20H4v-2a4 4 0 015-3.5M15 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            {room.participants_count ?? 0}
          </span>
          <span className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.77 9.77 0 01-4-.83L3 20l1.17-4A8.001 8.001 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {room.messages_count ?? 0}
          </span>
          <span>timeAgo({room.updated})</span>
        </div>
      </div>
    </div>
  )
}

export default RoomCard