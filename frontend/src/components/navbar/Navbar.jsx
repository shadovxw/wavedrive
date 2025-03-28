// src/components/navbar/Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faTerminal, faCode, faToolbox } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../auth/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../../auth/firebase';
import './Navbar.css';

function Navbar() {
  const navigate = useNavigate();
  const { currentUser, setCurrentUser } = useAuth();

  const menuItems = [
    { path: '/dashboard', icon: faHome, text: 'Home' },
    { path: '/console', icon: faTerminal, text: 'Console' },
    { path: '/compiler', icon: faCode, text: 'Codebase' },
    { path: '/kit', icon: faToolbox, text: 'Kit' },
  ];

  const handleLogout = async () => {
    await signOut(auth);
    setCurrentUser(null);
    navigate('/dashboard');
  };

  return (
    <>
      <nav className="navbar">
        <div className="nav-link">
          <ul>
            {menuItems.map((item, index) => (
              <li key={index}>
                <Link to={item.path}>
                  <span className="icon">
                    <FontAwesomeIcon icon={item.icon} />
                  </span>
                  <span className="text">{item.text}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* ✅ Right side: user info or login/signup */}
        <div className="login-signup" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginRight: '20px' }}>
          {currentUser ? (
            <>
              <span style={{ color: 'black' }}>{currentUser.email}</span>
              {currentUser.photoURL && (
                <img
                  src={currentUser.photoURL}
                  alt="Profile"
                  style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                />
              )}
              <button onClick={handleLogout}>
                LOGOUT
              </button>
            </>
          ) : (
            <button onClick={() => navigate('/loginsignup')}>
              LOGIN/SIGNUP
            </button>
          )}
        </div>
      </nav>
    </>
  );
}

export default Navbar;
