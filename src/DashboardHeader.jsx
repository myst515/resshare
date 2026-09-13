import './index.css'
import MyReact from './assets/ResShare.drawio.svg'

export default function Header() {
    return(
        <>
        {/*This is a header component which renders a header for the app. The header contains a logo and the name ResShare */}
        <header className="MyHeaderDashboard">
            <img src={MyReact} alt="React logo" width="30px"/>
            ResShare
        </header>
        </>
    )
}