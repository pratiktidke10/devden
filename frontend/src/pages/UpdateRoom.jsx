
// Lets the room host edit the room's topic, name and description.
// Pre-fills the form with existing room data on mount.
// Only the host can access this — backend enforces it too.

import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { getRoom, updateRoom } from '../api/rooms'
import { getTopics } from '../api/topics'

function UpdateRoom() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    topic: '',
    name: '',
    description: '',
  })
  const [topics, setTopics] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Load room data and topics on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [roomRes, topicsRes] = await Promise.all([
          getRoom(id),
          getTopics()
        ])
        // Pre-fill form with existing room data
        setFormData({
          topic: roomRes.data.topic?.name || '',
          name: roomRes.data.name || '',
          description: roomRes.data.description || '',
        })
        setTopics(topicsRes.data)
      } catch (err) {
        setError('Could not load room data.')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [id])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const filteredTopics = topics.filter(t =>
    t.name.toLowerCase().includes(formData.topic.toLowerCase()) &&
    formData.topic.length > 0
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.topic.trim() || !formData.name.trim()) {
      setError('Topic and room name are required.')
      return
    }

    setSaving(true)
    setError('')

    try {
      await updateRoom(id, {
        topic_name: formData.topic,
        name: formData.name,
        description: formData.description,
      })
      navigate(`/room/${id}`)
    } catch (err) {
      if (err.response?.status === 403) {
        setError('You are not the host of this room.')
      } else {
        const errData = err.response?.data
        if (errData) {
          const first = Object.values(errData)[0]
          setError(Array.isArray(first) ? first[0] : first)
        } else {
          setError('Could not update room. Please try again.')
        }
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-lg mx-auto px-5 py-8">
        <div className="h-64 bg-den-surface rounded-xl animate-pulse" />
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-5 py-8">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 font-mono text-xs text-den-faint mb-6">
        <Link to="/" className="hover:text-den-blue transition-colors">Home</Link>
        <span>/</span>
        <Link to={`/room/${id}`} className="hover:text-den-blue transition-colors">Room</Link>
        <span>/</span>
        <span className="text-den-text">Edit</span>
      </div>

      <h1 className="font-mono text-base font-bold text-den-text mb-6">
        Edit Room
      </h1>

      <div className="bg-den-surface border border-den-border rounded-xl p-6">

        {error && (
          <div className="bg-[#2d1b1b] border border-den-red text-den-red text-sm font-mono p-3 rounded-lg mb-4">
            ⚠ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          {/* Topic with suggestions */}
          <div className="relative">
            <label className="block font-mono text-xs text-den-faint uppercase tracking-wider mb-1.5">
              Topic
            </label>
            <input
              type="text"
              name="topic"
              value={formData.topic}
              onChange={handleChange}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              placeholder="e.g. Python, React, DevOps..."
              className="w-full bg-den-bg border border-den-border2 rounded-lg px-3 py-2.5 text-sm text-den-text placeholder-den-faint outline-none focus:border-den-blue transition-colors"
            />

            {/* Suggestions dropdown */}
            {showSuggestions && filteredTopics.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-den-surface border border-den-border2 rounded-lg overflow-hidden z-10 shadow-lg">
                {filteredTopics.slice(0, 6).map(topic => (
                  <button
                    key={topic.id}
                    type="button"
                    onMouseDown={() => {
                      setFormData({ ...formData, topic: topic.name })
                      setShowSuggestions(false)
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-den-muted hover:bg-den-bg hover:text-den-text transition-colors font-mono"
                  >
                    {topic.name}
                    <span className="text-den-faint text-xs ml-2">
                      {topic.room_count || 0} rooms
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Room Name */}
          <div>
            <label className="block font-mono text-xs text-den-faint uppercase tracking-wider mb-1.5">
              Room Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              maxLength={200}
              className="w-full bg-den-bg border border-den-border2 rounded-lg px-3 py-2.5 text-sm text-den-text outline-none focus:border-den-blue transition-colors"
            />
            <p className="text-den-faint text-xs mt-1.5 text-right font-mono">
              {formData.name.length}/200
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block font-mono text-xs text-den-faint uppercase tracking-wider mb-1.5">
              Description <span className="normal-case">(optional)</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full bg-den-bg border border-den-border2 rounded-lg px-3 py-2.5 text-sm text-den-text outline-none focus:border-den-blue transition-colors resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-[#238636] hover:opacity-90 disabled:opacity-50 text-white font-medium text-sm py-2.5 rounded-lg transition-opacity"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => navigate(`/room/${id}`)}
              className="px-5 text-sm font-medium text-den-muted border border-den-border2 rounded-lg hover:text-den-text hover:border-den-blue transition-colors"
            >
              Cancel
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}

export default UpdateRoom