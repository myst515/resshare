import './index.css'
import Header from './Header.jsx'
import {useNavigate} from 'react-router'
import React from 'react'
import RegistrationForm from './RegistrationForm.jsx';

export default function LoginPage() {
    const [showCreate, setShowCreate] = React.useState(false);

    function CreateHandler() {
        setShowCreate((prev) => !prev);
    }

    let navigate = useNavigate();

    function submit(e) {
        console.log(e.get('username'));
        console.log(e.get('password'));
        if (e.get('username') === 'admin' && e.get('password') === 'admin') {
            navigate('/AdminPage');
        }
        else{
            navigate('/DashboardPage');
        }
    }
    return(
        <>
        <Header />
        <div className="auth-container">
            <div className="LoginForm">
                <h1>Welcome to ResShare</h1>
                <p>Join now to monitor the real-time availability of shared resources in your building</p>

                <form action={submit}>
                    <label>username: 
                        <input type="text" name="username" required/>
                    </label>
                    <br />
                    <br />
                    <label>password:
                        <input type="password" name="password" required/>
                    </label>
                    <br />
                    <br />
                    <button className="button" type="submit"> Login </button>
                </form>
                <br />
            <p>Don't have an account? Create one below</p>
            <button padding="10px" width="100%" border="none" onClick={CreateHandler}> Create Account </button>
            </div>

            {showCreate? <RegistrationForm par={CreateHandler}/> : null}
        </div>
        </>
    )
}