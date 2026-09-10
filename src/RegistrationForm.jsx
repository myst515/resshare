import './index.css';
import React from 'react';
import Header from './Header.jsx';

export default function RegistrationForm(par) {
    const [password, setPassword] = React.useState('');
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
        par.par();
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