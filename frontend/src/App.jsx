import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './components/Home'
import Login from './pages/Login'
import Register from './pages/Register'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-den-bg text-den-text">
        <Navbar />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App