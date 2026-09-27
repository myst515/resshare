import './index.css'
import DashboardHeader from './DashboardHeader.jsx'
import AdminPanel from './AdminPanel.jsx'
export default function AdminPage({user={name:"Admin"}}) {
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
            </div>
        </div>
        </>
    )
}