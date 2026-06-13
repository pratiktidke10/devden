import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getRoom, deleteRoom, postMessage, deleteMessage } from '../api/rooms'
import Avatar from '../components/Avatar'

function Room() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [room, setRoom] = useState(null)
  const [messages, setMessages] = useState([])
  const [participants, setParticipants] = useState([])
  const [messageBody, setMessageBody] = useState('')
  const [loading, setLoading] = useState(true)
  const [posting, setPosting] = useState(false)
  const [error, setError] = useState('')

  const messagesEndRef = useRef(null)
  const currentUserId = localStorage.getItem('user_id')

  useEffect(() => {
    fetchRoom()
  }, [id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchRoom = async () => {
    try {
      setLoading(true)
      const res = await getRoom(id)
      setRoom(res.data)
      setMessages(res.data.messages || [])
      setParticipants(res.data.participants || [])
    } catch (err) {
      setError('Room not found or could not be loaded.')
    } finally {
      setLoading(false)
    }
  }

  const handlePostMessage = async (e) => {
    e.preventDefault()
    if (!messageBody.trim()) return
    try {
      setPosting(true)
      await postMessage(id, messageBody)
      setMessageBody('')
      fetchRoom()
    } catch (err) {
      if (err.response?.status === 401) {
        setError('You must be logged in to post messages.')
      } else {
        setError('Failed to post message.')
      }
    } finally {
      setPosting(false)
    }
  }

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Delete this message?')) return
    try {
      await deleteMessage(messageId)
      setMessages(prev => prev.filter(m => m.id !== messageId))
    } catch (err) {
      setError('Could not delete message.')
    }
  }

  const handleDeleteRoom = async () => {
    if (!window.confirm('Delete this room? This cannot be undone.')) return
    try {
      await deleteRoom(id)
      navigate('/')
    } catch (err) {
      setError('Could not delete room.')
    }
  }

  const formatTime = (dateStr) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleString('en-IN', {
      day: 'numeric', month: 'short',
      hour: '2-digit', minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="max-w-screen-xl mx-auto px-5 py-6 flex gap-5">
        <div className="flex-1">
          <div className="h-24 bg-den-surface rounded-xl mb-4 animate-pulse" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-den-surface rounded-xl mb-3 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (error && !room) {
    return (
      <div className="max-w-screen-xl mx-auto px-5 py-16 text-center">
        <p className="font-mono text-den-red text-sm">⚠ {error}</p>
        <Link to="/" className="text-den-blue text-sm mt-4 block hover:underline">
          ← Back to Home
        </Link>
      </div>
    )
  }

  const isHost = room?.host?.id === parseInt(currentUserId)

  return (
    <div className="max-w-screen-xl mx-auto px-5 py-6 flex gap-5">

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col">

        {/* Room Header */}
        <div className="bg-den-surface border border-den-border rounded-xl p-5 mb-4">
          <div className="flex items-center gap-2 text-xs font-mono text-den-faint mb-3">
            <Link to="/" className="hover:text-den-blue transition-colors">Home</Link>
            <span>/</span>
            <span className="text-den-blue">{room?.topic?.name}</span>
          </div>

          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-den-text font-semibold text-lg leading-snug mb-2">
                {room?.name}
              </h1>
              {room?.description && (
                <p className="text-den-muted text-sm leading-relaxed">
                  {room.description}
                </p>
              )}
            </div>

            {isHost && (
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  to={`/update-room/${id}`}
                  className="font-mono text-xs text-den-muted border border-den-border2 px-3 py-1.5 rounded-md hover:text-den-text hover:border-den-blue transition-colors no-underline"
                >
                  Edit
                </Link>
                <button
                  onClick={handleDeleteRoom}
                  className="font-mono text-xs text-den-red border border-den-border2 px-3 py-1.5 rounded-md hover:border-den-red transition-colors"
                >
                  Delete
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-den-border">
            <Avatar
              initials={room?.host?.name?.slice(0, 2).toUpperCase()}
              imageUrl={room?.host?.avatar}
              size="sm"
            />
            <div>
              <p className="text-xs text-den-muted">
                Hosted by{' '}
                <Link
                  to={`/profile/${room?.host?.id}`}
                  className="text-den-text hover:text-den-blue transition-colors"
                >
                  {room?.host?.name}
                </Link>
              </p>
              <p className="text-xs text-den-faint font-mono">
                {formatTime(room?.created)}
              </p>
            </div>
            <div className="ml-auto flex items-center gap-3 text-den-faint font-mono text-xs">
              <span>{participants.length} participants</span>
              <span>{messages.length} messages</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-[#2d1b1b] border border-den-red text-den-red text-xs font-mono p-3 rounded-lg mb-4">
            ⚠ {error}
          </div>
        )}

        {/* Messages */}
        <div className="bg-den-surface border border-den-border rounded-xl flex-1 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-den-border">
            <p className="font-mono text-xs text-den-faint uppercase tracking-widest">
              Discussion ({messages.length})
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 max-h-[480px]">
            {messages.length === 0 ? (
              <div className="text-center py-12 text-den-faint font-mono text-sm">
                No messages yet. Be the first to say something!
              </div>
            ) : (
              messages.map(message => (
                <div key={message.id} className="flex gap-3 group">
                  <Avatar
                    initials={message.user?.name?.slice(0, 2).toUpperCase()}
                    imageUrl={message.user?.avatar}
                    size="md"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Link
                        to={`/profile/${message.user?.id}`}
                        className="text-sm font-medium text-den-text hover:text-den-blue transition-colors"
                      >
                        {message.user?.name}
                      </Link>
                      <span className="text-den-faint font-mono text-xs">
                        {formatTime(message.created)}
                      </span>
                      {message.user?.id === parseInt(currentUserId) && (
                        <button
                          onClick={() => handleDeleteMessage(message.id)}
                          className="ml-auto opacity-0 group-hover:opacity-100 text-den-faint hover:text-den-red font-mono text-xs transition-all"
                        >
                          delete
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-den-muted leading-relaxed">
                      {message.body}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="border-t border-den-border p-4">
            {currentUserId ? (
              <form onSubmit={handlePostMessage} className="flex gap-3">
                <input
                  type="text"
                  value={messageBody}
                  onChange={e => setMessageBody(e.target.value)}
                  placeholder="Write a message..."
                  className="flex-1 bg-den-bg border border-den-border2 rounded-lg px-4 py-2.5 text-sm text-den-text placeholder-den-faint outline-none focus:border-den-blue transition-colors"
                />
                <button
                  type="submit"
                  disabled={posting || !messageBody.trim()}
                  className="bg-[#238636] hover:opacity-90 disabled:opacity-40 text-white font-medium text-sm px-5 py-2.5 rounded-lg transition-opacity"
                >
                  {posting ? '...' : 'Send'}
                </button>
              </form>
            ) : (
              <p className="text-center text-den-muted text-sm">
                <Link to="/login" className="text-den-blue hover:underline">Sign in</Link>
                {' '}to join the discussion
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Participants sidebar */}
      <aside className="w-56 shrink-0 hidden xl:block">
        <div className="bg-den-surface border border-den-border rounded-xl p-4">
          <p className="font-mono text-xs text-den-faint uppercase tracking-widest mb-4">
            Participants ({participants.length})
          </p>
          {participants.length === 0 ? (
            <p className="text-den-faint font-mono text-xs">No participants yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {participants.map(user => (
                <Link
                  key={user.id}
                  to={`/profile/${user.id}`}
                  className="flex items-center gap-2 no-underline group"
                >
                  <Avatar
                    initials={user.name?.slice(0, 2).toUpperCase()}
                    imageUrl={user.avatar}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-den-muted group-hover:text-den-text transition-colors truncate">
                      {user.name}
                    </p>
                    {user.id === room?.host?.id && (
                      <p className="text-xs text-den-blue font-mono">host</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="bg-den-surface border border-den-border rounded-xl p-4 mt-3">
          <p className="font-mono text-xs text-den-faint uppercase tracking-widest mb-3">Topic</p>
          <span className="text-xs bg-[#1f3a5f] text-den-blue px-3 py-1 rounded-full font-mono">
            {room?.topic?.name}
          </span>
        </div>
      </aside>

    </div>
  )
}

export default Room