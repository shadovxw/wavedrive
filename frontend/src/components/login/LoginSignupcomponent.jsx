import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import './LoginSignupcomponent.css';

function LoginSignupcomponent() {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  const passwordRules = [
    { label: "At least 8 characters", regex: /.{8,}/ },
    { label: "At least one uppercase letter", regex: /[A-Z]/ },
    { label: "At least one lowercase letter", regex: /[a-z]/ },
    { label: "At least one number", regex: /[0-9]/ },
    { label: "At least one special character", regex: /[^A-Za-z0-9]/ },
  ];

  // Function to check if password matches the regex rules
  const checkPassword = (rule, password) => rule.regex.test(password);

  // Count how many password rules are met
  const matchedRulesCount = passwordRules.filter(rule => checkPassword(rule, password)).length;

  // Determine password strength based on number of rules matched
  let passwordStrength = "Weak 🔴";
  if (matchedRulesCount >= 3) passwordStrength = "Medium 🟠";
  if (matchedRulesCount === 5) passwordStrength = "Strong 🟢";


  const handleSubmit = () => {
    
    setShowSuccess(true); // ✅ Show success message
    
    setTimeout(() => {
      setShowSuccess(false); // Hide after 2 seconds
      window.location.href = "/"; // Redirect to homepage
    }, 2000);
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
                <a onClick={(e) => {e.preventDefault();handleSubmit(e);}}>
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
                
                <a onClick={(e) => { e.preventDefault(); handleSubmit(e);}}>
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
          ✅ Logged in Successfully! Redirecting...
        </div>
      )}
    </>
  );
}

export default LoginSignupcomponent;
