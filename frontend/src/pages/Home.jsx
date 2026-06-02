import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import RoomCard from '../components/RoomCard'
import TopicSidebar from '../components/TopicSidebar'
import ActivityFeed from '../components/ActivityFeed'
import { getRooms } from '../api/rooms'
import { getTopics } from '../api/topics'
import { getActivity } from '../api/activity'

function Home() {
  const [rooms, setRooms] = useState([])
  const [topics, setTopics] = useState([])
  const [activities, setActivities] = useState([])
  const [search, setSearch] = useState('')
  const [activeTopic, setActiveTopic] = useState('')
  const [loadingRooms, setLoadingRooms] = useState(true)
  const [loadingTopics, setLoadingTopics] = useState(true)
  const [loadingActivity, setLoadingActivity] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchTopics()
    fetchActivity()
  }, [])

  useEffect(() => {
    fetchRooms()
  }, [search, activeTopic])

  const fetchRooms = async () => {
    try {
      setLoadingRooms(true)
      const res = await getRooms(search, activeTopic)
      setRooms(res.data)
    } catch (err) {
      setError('Failed to load rooms. Is the backend running?')
    } finally {
      setLoadingRooms(false)
    }
  }

  const fetchTopics = async () => {
    try {
      const res = await getTopics()
      setTopics(res.data)
    } catch (err) {
      console.error('Failed to load topics', err)
    } finally {
      setLoadingTopics(false)
    }
  }

  const fetchActivity = async () => {
    try {
      const res = await getActivity()
      setActivities(res.data)
    } catch (err) {
      console.error('Failed to load activity', err)
    } finally {
      setLoadingActivity(false)
    }
  }

  return (
    <div className="max-w-screen-xl mx-auto px-5 py-6 flex gap-5">

      {/* Left sidebar */}
      <TopicSidebar
        topics={topics}
        activeTopic={activeTopic}
        onTopicSelect={setActiveTopic}
        loading={loadingTopics}
      />

      {/* Main content */}
      <main className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 relative">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-den-faint absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search rooms, topics..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-den-surface border border-den-border2 rounded-lg pl-9 pr-4 py-2 text-sm text-den-text placeholder-den-faint outline-none focus:border-den-blue transition-colors"
            />
          </div>
          <Link
            to="/create-room"
            className="flex items-center gap-2 bg-[#238636] hover:opacity-90 text-white text-sm font-medium px-4 py-2 rounded-lg transition-opacity no-underline shrink-0"
          >
            <span className="text-lg leading-none">+</span>
            New Room
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: 'Rooms', value: rooms.length, color: 'text-den-blue' },
            { label: 'Topics', value: topics.length, color: 'text-den-green' },
            { label: 'Messages', value: activities.length, color: 'text-den-amber' },
          ].map(s => (
            <div key={s.label} className="bg-den-surface border border-den-border rounded-lg p-3">
              <p className="font-mono text-xs text-den-faint uppercase tracking-wider mb-1">{s.label}</p>
              <p className={`font-mono text-xl font-semibold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        <p className="font-mono text-xs text-den-faint uppercase tracking-widest mb-3">
          {activeTopic ? `${activeTopic} Rooms` : 'Recent Rooms'}
        </p>

        {error && (
          <div className="bg-den-surface border border-den-red text-den-red text-sm font-mono p-4 rounded-lg mb-4">
            ⚠ {error}
          </div>
        )}

        {loadingRooms ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-den-surface rounded-xl mb-3 animate-pulse" />
          ))
        ) : rooms.length > 0 ? (
          rooms.map(room => <RoomCard key={room.id} room={room} />)
        ) : (
          <div className="text-center py-16 text-den-faint font-mono text-sm">
            {search ? `No rooms found for "${search}"` : 'No rooms yet. Create the first one!'}
          </div>
        )}
      </main>

      {/* Right sidebar */}
      <ActivityFeed
        activities={activities}
        loading={loadingActivity}
      />

    </div>
  )
}

export default Home