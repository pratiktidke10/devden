
// Shows a user's public profile.
// Displays their avatar, bio, rooms they created, and messages they posted.
// If viewing your OWN profile — shows an Edit button.

import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getUserProfile } from '../api/users'
import Avatar from '../components/Avatar'
import RoomCard from '../components/RoomCard'

function Profile() {
  const { id } = useParams()

  const [user, setUser] = useState(null)
  const [rooms, setRooms] = useState([])
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('rooms')

  // Get current logged in user id to check if this is own profile
  const currentUserId = localStorage.getItem('user_id')
  const isOwnProfile = parseInt(currentUserId) === parseInt(id)

  useEffect(() => {
    fetchProfile()
  }, [id])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const res = await getUserProfile(id)
      setUser(res.data.user)
      setRooms(res.data.rooms)
      setMessages(res.data.messages)
    } catch (err) {
      setError('User not found.')
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (dateStr) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    })
  }

  // ---- LOADING STATE ----
  if (loading) {
    return (
      <div className="max-w-screen-xl mx-auto px-5 py-6">
        <div className="h-40 bg-den-surface rounded-xl mb-4 animate-pulse" />
        <div className="h-64 bg-den-surface rounded-xl animate-pulse" />
      </div>
    )
  }

  // ---- ERROR STATE ----
  if (error) {
    return (
      <div className="max-w-screen-xl mx-auto px-5 py-16 text-center">
        <p className="font-mono text-den-red text-sm">⚠ {error}</p>
        <Link to="/" className="text-den-blue text-sm mt-4 block hover:underline">
          ← Back to Home
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-screen-lg mx-auto px-5 py-6">

      {/* ---- PROFILE HEADER ---- */}
      <div className="bg-den-surface border border-den-border rounded-xl p-6 mb-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">

          {/* Avatar + Info */}
          <div className="flex items-center gap-5">
            <Avatar
              initials={user?.name?.slice(0, 2).toUpperCase()}
              imageUrl={user?.avatar}
              size="xl"
            />
            <div>
              <h1 className="text-den-text font-semibold text-xl mb-0.5">
                {user?.name}
              </h1>
              <p className="text-den-faint font-mono text-sm mb-2">
                @{user?.username}
              </p>
              {user?.bio && (
                <p className="text-den-muted text-sm max-w-md leading-relaxed">
                  {user.bio}
                </p>
              )}
            </div>
          </div>

          {/* Edit button — only on own profile */}
          {isOwnProfile && (
            <Link
              to="/update-user"
              className="font-mono text-xs text-den-muted border border-den-border2 px-4 py-2 rounded-md hover:text-den-text hover:border-den-blue transition-colors no-underline shrink-0"
            >
              Edit Profile
            </Link>
          )}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-den-border">
          {[
            { label: 'Rooms Created', value: rooms.length, color: 'text-den-blue' },
            { label: 'Messages', value: messages.length, color: 'text-den-green' },
            { label: 'Member Since', value: formatTime(user?.date_joined), color: 'text-den-amber' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p className={`font-mono text-lg font-bold ${s.color}`}>{s.value}</p>
              <p className="font-mono text-xs text-den-faint uppercase tracking-wider mt-0.5">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ---- TABS ---- */}
      {/* Tabs let us switch between rooms and messages
          without navigating to a new page — pure UI state */}
      <div className="flex gap-1 mb-4 bg-den-surface border border-den-border rounded-lg p-1 w-fit">
        {['rooms', 'messages'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`font-mono text-xs uppercase tracking-wider px-4 py-2 rounded-md transition-all
              ${activeTab === tab
                ? 'bg-den-bg text-den-blue border border-den-border2'
                : 'text-den-faint hover:text-den-muted'
              }`}
          >
            {tab} ({tab === 'rooms' ? rooms.length : messages.length})
          </button>
        ))}
      </div>

      {/* ---- TAB CONTENT ---- */}

      {/* Rooms Tab */}
      {activeTab === 'rooms' && (
        <div>
          {rooms.length === 0 ? (
            <div className="text-center py-16 text-den-faint font-mono text-sm">
              {isOwnProfile ? "You haven't created any rooms yet." : "No rooms created yet."}
              {isOwnProfile && (
                <Link to="/create-room" className="block text-den-blue mt-3 hover:underline">
                  Create your first room →
                </Link>
              )}
            </div>
          ) : (
            rooms.map(room => <RoomCard key={room.id} room={room} />)
          )}
        </div>
      )}

      {/* Messages Tab */}
      {activeTab === 'messages' && (
        <div className="flex flex-col gap-3">
          {messages.length === 0 ? (
            <div className="text-center py-16 text-den-faint font-mono text-sm">
              No messages yet.
            </div>
          ) : (
            messages.map(message => (
              <div
                key={message.id}
                className="bg-den-surface border border-den-border rounded-xl p-4"
              >
                {/* Which room this message was posted in */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-mono text-xs text-den-faint">In</span>
                  <Link
                    to={`/room/${message.room?.id}`}
                    className="font-mono text-xs text-den-blue hover:underline"
                  >
                    # {message.room?.name}
                  </Link>
                  <span className="font-mono text-xs text-den-faint ml-auto">
                    {formatTime(message.created)}
                  </span>
                </div>
                <p className="text-den-muted text-sm leading-relaxed">
                  {message.body}
                </p>
              </div>
            ))
          )}
        </div>
      )}

    </div>
  )
}

export default Profile