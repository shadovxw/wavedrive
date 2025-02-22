import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import './LoginSignupcomponent.css';

function LoginSignupcomponent() {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  const handleSubmit = () => {
    
    console.log("Form submitted");
  };

  return (
    <>
      <div className={`flip-container ${!isLogin ? 'flip' : ''}`}>

        <div className="flipper">
          {/* Front side = Login Form */}
          <div className="front">
            <div className="loginsignup-box">
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
                Don't have an account? <a href="#" onClick={(e) => { e.preventDefault(); setIsLogin(false); }}>Register</a>
              </div>
            </div>
          </div>

          
          <div className="back">
            <div className="loginsignup-box">
              <h2>Sign Up</h2>
              <form>
                <div className="user-box">
                  <input type="text" placeholder=" " required />
                  <label>Full Name</label>
                </div>

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
                  Sign Up
                </a>
              </form>
              <div className='tbh'>
                Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); setIsLogin(true); }}>Login</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default LoginSignupcomponent;
