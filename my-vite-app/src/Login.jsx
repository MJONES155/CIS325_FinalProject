//Login.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

//Login Component
const Login = () => {
    //Hooks
    const [newUsername, setUsername] = useState('');
    const [newPassword, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    
    //Implemented when the user presses submit
    const submitLogin = () => {
        const newLogin = { username: newUsername, password: newPassword};//Takes input and puts it in JSON format
      
        
        //Sends post to /login backend
        axios.post('http://localhost:3001/login', newLogin) 
            .then (response => {
                localStorage.setItem('token', response.data.token);

                setUsername('');
                setPassword('');
                setError('');

                navigate('/calendarapp');
            })
            .catch(error => {
                console.error('Error logging in user:', error);
                setError('An error occured during login.');
            });
        
    };

    return (

        
        <div>
            <p>Don't have an account? <Link to="/register">Register here</Link></p>
            <br></br>
            <h1>Login</h1>
            <form onSubmit={(e) => e.preventDefault()}>
                <div>
                    <input
                        type="text"
                        placeholder="Username"
                        value={newUsername}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <input
                        type="password"
                        placeholder="Password"
                        value={newPassword}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <button type="button" onClick={submitLogin}>Login</button>
            </form>
        </div>
    );
};

export default Login;