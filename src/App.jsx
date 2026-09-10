import './index.css'
import {Navigate} from 'react-router'
import {BrowserRouter, Routes, Route} from 'react-router'
import LoginPage from './LoginPage.jsx'
import DashboardPage from './DashboardPage.jsx'
import AdminPage from './AdminPage.jsx'
import react from 'react'

{/*This is the main App component which sets up the routing for the application. 
  It uses React Router to define routes for the LoginPage, DashboardPage, and AdminPage components. 
  The isAuthenticated and isAdmin state variables are used to determine if the user is logged in and if they have admin privileges. 
  If the user is not authenticated, they will be redirected to the LoginPage. 
  If they are authenticated but not an admin, they will be redirected to the DashboardPage.*/}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = react.useState(false); {/*This creates a isAuthenticated state variable that is false by default, setIsAuthenticated is a function used to update the value of the isAuthenticated state variable.*/}
  const [isAdmin, setIsAdmin] = react.useState(false); {/*This creates a isAdmin state variable that is false by default, setIsAdmin is a function used to update the value of the isAdmin state variable.*/}
  
  return(
    <BrowserRouter>
      <Routes>
      <Route path="/" element={<LoginPage authFunc={setIsAuthenticated} adminFunc={setIsAdmin} />} />
      <Route path="/DashboardPage" element={isAuthenticated? <DashboardPage /> : <Navigate to="/" /> } />
      <Route path="/AdminPage" element={isAuthenticated && isAdmin ? <AdminPage /> : <Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}