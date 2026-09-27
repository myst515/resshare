import './index.css'
import Header from './Header.jsx'
import {useNavigate} from 'react-router'
import React from 'react'
import RegistrationForm from './RegistrationForm.jsx';

export default function LoginPage(Funcs) {
    const [showCreate, setShowCreate] = React.useState(false); {/*This creates a showCreate state variable that is false by default, setShowCreate is a function used to toggle the state from false to true and viceversa*/}

    function CreateHandler() {
        {/*This function toggles the state of showCreate between true and false. When showCreate is true, the RegistrationForm component will be rendered, allowing the user to create a new account. When showCreate is false, the RegistrationForm component will not be rendered. */}
        setShowCreate((prev) => !prev);
    }

    let navigate = useNavigate();

    function submit(e) {
        {/*This function is called when the user submits the login form. It checks if the username and password entered by the user match the hardcoded values 'admin' and 'admin'. If they do, the user is redirected to the AdminPage. If they don't, the user is redirected to the DashboardPage.*/}
        console.log(e.get('username'));
        console.log(e.get('password'));
        if (e.get('username') === 'admin' && e.get('password') === 'admin') {
            Funcs.adminFunc(true);  
            navigate('/AdminPage');
        }
        else if (e.get('username') === 'student' && e.get('password') === '12345') {
             navigate('/DashboardPage');
        }
        else{
            alert('Please enter a valid username and password');
        }

        Funcs.authFunc(true);
    }

    return(
        <>
        <div className="login-page">
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
                <button className="cursor-pointer hover:opacity-40" padding="10px" width="100%" border="none" onClick={CreateHandler}> Create Account </button>
                </div>

                {showCreate? <RegistrationForm createHandler={CreateHandler}/> : null} {/*This line uses a ternary operator to conditionally render the RegistrationForm component based on the value of showCreate. If showCreate is true, the RegistrationForm component is rendered and passed wwith the CreateHandler function as a prop named createHandler. If showCreate is false, null is rendered, meaning nothing will be displayed in that space. This allows for dynamic rendering of the RegistrationForm component based on user interaction.*/}
            </div>
        </div>
        </>
    )
}