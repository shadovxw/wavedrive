// components/login/LoginSignupcomponent.jsx
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import './LoginSignupcomponent.css';

import {
  doCreateUserWithEmailAndPassword,
  doSignInWithEmailAndPassword,
} from '../../auth/index'; // ✅ fixed path

import { useAuth } from '../../auth/AuthContext';
import { useNavigate } from 'react-router-dom';

function LoginSignupcomponent() {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { setCurrentUser } = useAuth();
  const navigate = useNavigate();

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

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const user = await doSignInWithEmailAndPassword(email, password);
      setCurrentUser(user);
      setShowSuccess(true);
      setErrorMessage('');
      setTimeout(() => {
        setShowSuccess(false);
        navigate("/");
      }, 2000);
    } catch (error) {
      setErrorMessage(`❌ ${error.message}`);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (matchedRulesCount < 5) {
      setErrorMessage("❌ Password must meet all strength requirements.");
      return;
    }

    try {
      const user = await doCreateUserWithEmailAndPassword(email, password);
      setCurrentUser(user);
      setShowSuccess(true);
      setErrorMessage('');
      setTimeout(() => {
        setShowSuccess(false);
        navigate("/");
      }, 2000);
    } catch (error) {
      setErrorMessage(`❌ ${error.message}`);
    }
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
                    type="email"
                    placeholder=" "
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <label>Email</label>
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
                  <span></span><span></span><span></span><span></span>
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
                    type="email"
                    placeholder=" "
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <label>Email</label>
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
                  <span></span><span></span><span></span><span></span>
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
