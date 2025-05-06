//Register.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

//Register component
const Register = () => {
    //Hooks
    const [newUsername, setUsername] = useState('');
    const [newEmail, setEmail] = useState('');
    const [newPassword, setPassword] = useState('');
    const [error, setError] = useState('');
    
    //Implemented when the user presses submit
    const submitRegister = () => {
        const newUser = { username: newUsername, password: newPassword, Email: newEmail}; //Takes input and puts it in JSON format
      
        //Sends post to /register backend
        axios.post('http://localhost:3001/register', newUser) 
            .then (response => {
                //clear form fields
                setUsername('');
                setEmail('');
                setPassword('');
                setError('')
            })
            //error catching
            .catch(error => {
                console.error('Error adding user:', error.response ? error.response.data : error.message); //logs a console error
                setError('An error occured during registration.') //Sends error to user
            });
        
    };

    return (
        <div>
            <p>Already have an account? <Link to="/login">Login here</Link></p>
            <br></br>
            <h1>Register</h1>
            <form onSubmit={(e) => e.preventDefault()}>
                {/* Email Input */}
                <div>
                    <input
                        type="text"
                        placeholder="Username"
                        value={newUsername}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <br></br>
                </div>
                {/* Email Input */}
                <div>
                    <input
                        type="email"
                        placeholder="Email"
                        value={newEmail}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <br></br>
                </div>
                {/* Password Input */}
                <div>
                    <input
                        type="password"
                        placeholder="Password"
                        value={newPassword}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <br></br>
                </div>
                {/* Error message display*/}
                {error && <p style={{ color: 'red' }}>{error}</p>}
                {/* Button to trigger submission (or POST) */}
                <button type="button" onClick={submitRegister}>Register</button>
            </form>
        </div>
    );
};

export default Register;