import './index.css'
import MyReact from './assets/ResShare.drawio.svg'
export default function Header() {
    return(
        <>
        <header className="MyHeader">
            <img src={MyReact} alt="React logo" width="30px"/>
            ResShare
        </header>
        </>
    )
}