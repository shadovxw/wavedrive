import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import './Logincomponent.css';
import ParticlesComponent from '../particles/ParticlesComponent';

function Logincomponent() {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [password, setPassword] = useState('');

  return ( 
    <div className='login-container'>

      <ParticlesComponent className="particles-background" />
      
      <div className="login-box">
        <h2>Login</h2>
        <form>
          <div className="user-box">
            <input type="text" placeholder=" " required />
            <label>Username</label>
          </div>

          <div className="user-box" style={{ position: 'relative' }}>
            <input
              type={passwordVisible ? 'text' : 'password'}
              placeholder=" "
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <label>Password</label>
            <span 
              className="toggle-password"
              onClick={() => setPasswordVisible(!passwordVisible)}
            >
              <FontAwesomeIcon icon={passwordVisible ? faEyeSlash : faEye} />
            </span>
          </div>
            <a onClick={(e) => { e.preventDefault(); handleSubmit();}}>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            Login 
          </a>
        </form>
        <div className='tbh'>
            dont have an account ? <a href="#">register</a>
        </div>
      </div>
    </div>
  );
}

export default Logincomponent;
