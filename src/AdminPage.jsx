import './index.css'
import DashboardHeader from './DashboardHeader.jsx'
import AdminPanel from './AdminPanel.jsx'
import Announcements from './Announcements.jsx'

{/*This component renders the contents of the admin page*/}

export default function AdminPage() {
    return(
        <>
        <DashboardHeader user={{name:"Admin User", floor:"Building Manager"}} admin={true}/>
        <div className="BodyDashboard">
            <div className="dashboard-content">
                <div className="resources-section"> 
                    <h1>Admin Panel</h1>
                    <p>Manage building resources, announcements, and operations.</p>
                    <AdminPanel />
                </div>
                <div className="activity-section">
                    <div className="building-news">
                    <Announcements />
                    </div>
                </div>
            </div>
        </div>
        </>
    )
}