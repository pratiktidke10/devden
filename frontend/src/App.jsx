import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './components/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Room from './pages/Room'
import Profile from './pages/Profile'
import UpdateUser from './pages/UpdateUser'

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
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="/update-user" element={<UpdateUser />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App