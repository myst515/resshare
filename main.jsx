import REACTDOM from 'react-dom/client'
import App from './App.jsx'
import LoginPage from './LoginPage.jsx'
import DashboardPage from './DashboardPage.jsx'
import AdminPage from './AdminPage.jsx'
import {BrowserRouter, Routes, Route} from 'react-router'

REACTDOM.createRoot(document.getElementById('root')).render(
<BrowserRouter>
<Routes>
    <Route path="/" element={<LoginPage />} />
    <Route path="/DashboardPage" element={<DashboardPage />} />
    <Route path="/AdminPage" element={<AdminPage />} />
</Routes>
</BrowserRouter>
)
