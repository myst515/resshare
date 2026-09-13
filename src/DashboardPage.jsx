import './index.css'
import ResourceCard from './ResourceCard.jsx'
import Header from './DashboardHeader.jsx'
import WashingMachineImage from './assets/Washing machines.jpg'
import DryerImage from './assets/Dryer.jpg'
import StoveImage from './assets/Stove.jpg'
export default function DashboardPage() {
    return(
        <>
            <Header />
            <body className="BodyDashboard">Welcome to the Dashboard</body>
            <div className="resource-grid">
                <ResourceCard title="Washing Machines" availability={2} total={4} link={WashingMachineImage}/>
                <ResourceCard title="Dryers" availability={1} total={3} link={DryerImage}/>
                <ResourceCard title="Stoves" availability={0} total={2} link={StoveImage}/>
            </div>
        </>
    )
}