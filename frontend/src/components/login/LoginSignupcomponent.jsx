import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import './LoginSignupcomponent.css';

function LoginSignupcomponent() {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Hardcoded credentials for login validation
  const hardcodedUsername = 'admin';
  const hardcodedPassword = 'pass';

  const passwordRules = [
    { label: "At least 8 characters", regex: /.{8,}/ },
    { label: "At least one uppercase letter", regex: /[A-Z]/ },
    { label: "At least one lowercase letter", regex: /[a-z]/ },
    { label: "At least one number", regex: /[0-9]/ },
    { label: "At least one special character", regex: /[^A-Za-z0-9]/ },
  ];

  const checkPassword = (rule, password) => rule.regex.test(password);
  const matchedRulesCount = passwordRules.filter(rule => checkPassword(rule, password)).length;

  let passwordStrength = "Weak 🔴";
  if (matchedRulesCount >= 3) passwordStrength = "Medium 🟠";
  if (matchedRulesCount === 5) passwordStrength = "Strong 🟢";

  const handleLogin = (e) => {
    e.preventDefault();
    
    if (username === hardcodedUsername && password === hardcodedPassword) {
      setShowSuccess(true);
      setErrorMessage('');
      setTimeout(() => {
        setShowSuccess(false);
        window.location.href = "/";
      }, 2000);
    } else {
      setErrorMessage('❌ Incorrect Username or Password');
    }
  };

  const handleSignup = (e) => {
    e.preventDefault();

    if (username.length < 5) {
      setErrorMessage("❌ Username must be at least 5 characters long.");
      return;
    }

    if (matchedRulesCount < 5) {
      setErrorMessage("❌ Password must meet all strength requirements.");
      return;
    }

    setShowSuccess(true);
    setErrorMessage('');
    setTimeout(() => {
      setShowSuccess(false);
      window.location.href = "/";
    }, 2000);
  };

  return (
    <>
      <div className={`flip-container ${!isLogin ? 'flip' : ''}`}>
        <div className="flipper">
          {/* Login Form */}
          <div className="front">
            <div className="loginsignup-box">
              <h2>Login</h2>
              <form>
                <div className="user-box">
                  <input
                    type="text"
                    placeholder=" "
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
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

                {errorMessage && <div className="error-message">{errorMessage}</div>}

                <a onClick={handleLogin}>
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

          {/* Signup Form */}
          <div className="back">
            <div className="loginsignup-box">
              <h2>Sign Up</h2>
              <form>
                <div className="user-box">
                  <input
                    type="text"
                    placeholder=" "
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
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

                {/* Password Strength Indicator */}
                <div className="password-strength">
                  Password Strength: <strong>{passwordStrength}</strong>
                </div>

                {/* Password Rule Checklist */}
                <div className="pass-check">
                  {passwordRules.map((rule, index) => (
                    <div key={index} className="password-rule">
                      <span style={{ color: checkPassword(rule, password) ? "#00ff00" : "#ff0000" }}>
                        {checkPassword(rule, password) ? "✅" : "❌"} {rule.label}
                      </span>
                    </div>
                  ))}
                </div>

                {errorMessage && <div className="error-message">{errorMessage}</div>}

                <a onClick={handleSignup}>
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

      {showSuccess && (
        <div className="success-box">
          ✅ {isLogin ? "Logged in" : "Account created"} Successfully! Redirecting...
        </div>
      )}
    </>
  );
}

export default LoginSignupcomponent;
