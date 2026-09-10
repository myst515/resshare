import './index.css';
import React from 'react';

{/*This is a registration form component which renders a form for the user to fill in their details. 
        The form contains fields for the user's name, surname, email, student number, floor number, password and confirm password. 
        The form also contains a submit button which when clicked will call the submit function. 
        The submit function will log the values of the form fields to the console and check if the password and confirm password fields match. 
        If they do not match an alert will be shown to the user. 
        The submit function will also call the par.createHandler() function which is passed as a prop from the parent component. 
        This allows for dynamic rendering of the RegistrationForm component based on user interaction.*/}

export default function RegistrationForm(par) {
    const [password, setPassword] = React.useState(''); {/*This creates a password state variable that is an empty string by default, setPassword is a function used to update the value of the password state variable.*/}
    const [confirmPassword, setConfirmPassword] = React.useState('');
    
    function submit(e) {
        console.log(e.get('Name'));
        console.log(e.get('Surname'));
        console.log(e.get('Email'));
        console.log(e.get('StudentNo'));
        console.log(e.get('FloorNo'));
        console.log(e.get('Password'));
        if (password !== confirmPassword) {
            alert('Passwords do not match');
        }
        par.createHandler();
    return;
    }

    return(
        
        <div className="RegistrationForm">
            <p>Fill in your details below</p>

            <form action={submit}>
                <label>Name: 
                    <input type="text" placeholder="e.g Will" name="Name" required/>
                </label>
                <br />
                <br />
                <label>Surname: 
                    <input type="text" placeholder="e.g Smith" name="Surname" required/>
                </label>
                <br />
                <br />
                <label>Email: 
                    <input type="email" placeholder="e.g willsmith@gmail.com" name="Email" required/>
                </label>
                <br />
                <br />
                <label>StudentNo:
                    <input type="number" placeholder="e.g 12345678" name="StudentNo" required/>
                </label>
                <br />
                <br /> 
                <label>FloorNo:
                    <input type="number" placeholder="1" min="1" max="5" name="FloorNo" required/>
                </label>
                <br />
                <br />
                <label>Password:
                    <input type="password" name="password" value={password} onChange={(p)=> setPassword(p.target.value)} required/>
                </label>
                <br />
                <br />
                <label>Confirm Password:
                    <input type="password" id="confirmPassword" name="confirmPassword" value={confirmPassword} onChange={(p)=>setConfirmPassword(p.target.value)} required/>
                </label>
                <br />
                <br />
                {confirmPassword && password !== confirmPassword && <span>Passwords do not match!</span>}
                <button className="button" type="submit"> Submit </button>
            </form>
        </div>
    )
}