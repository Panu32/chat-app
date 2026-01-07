import  { useContext } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'
import {Toaster} from "react-hot-toast"
import { AuthContext } from '../context/AuthContextObject'

// Step 1: Import the image as a variable
import bgImage from './assets/bgImage.svg'

const App = () => {
  const {authUser}  = useContext(AuthContext);
  return (
    // Step 2: Use an inline style for the background image
    // The build tool will replace `bgImage` with the correct final URL.
    <div
      style={{ backgroundImage: `url(${bgImage})` }}
      className="bg-contain"
    >
      <Toaster/>
      <Routes>
        <Route path='/' element={authUser ? <HomePage /> : <Navigate to="/login"/>} />
        <Route path='/login' element={!authUser ? <LoginPage /> :<Navigate to="/" />} />
        <Route path='/profile' element={authUser ? <ProfilePage /> : <Navigate to="/login"/>} />
      </Routes>
    </div>
  )
}

export default App