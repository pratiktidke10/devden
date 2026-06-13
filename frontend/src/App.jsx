import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Room from './pages/Room'
import Profile from './pages/Profile'
import UpdateUser from './pages/UpdateUser'
import CreateRoom from './pages/CreateRoom'
import Topics from './pages/Topics'
import Activity from './pages/Activity'
import UpdateRoom from './pages/UpdateRoom'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-den-bg text-den-text">
        <Navbar />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='/room/:id' element={<Room />} />
          <Route path='/profile/:id' element={<Profile />} />
          <Route path='/update-user' element={<UpdateUser />} />
          <Route path='/create-room' element={<CreateRoom />} />
          <Route path='/topics' element={<Topics />} />
          <Route path='/activity' element={<Activity />} />
          <Route path='/update-room/:id' element = {<UpdateRoom />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App