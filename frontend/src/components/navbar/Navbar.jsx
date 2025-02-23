import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faTerminal, faCode, faToolbox } from '@fortawesome/free-solid-svg-icons';
import './Navbar.css';

function Navbar() {
  const [activeIndex, setActiveIndex] = useState(0);


  const distances = [-6, 172, 352, 532]; 

  const menuItems = [
    { path: '/', icon: faHome, text: 'Home' },
    { path: '/a', icon: faTerminal, text: 'Console' },
    { path: '/b', icon: faCode, text: 'Codebase' },
    { path: '/kit', icon: faToolbox, text: 'Kit' },
  ];

  return ( 
    <>

      <nav className="navbar">
      <div className='nav-link'>
        <ul>
          {menuItems.map((item, index) => (
            <li 
              key={index} 
              className={activeIndex === index ? 'active' : ''}
              onClick={() => setActiveIndex(index)}
            >
              <Link to={item.path}>
                <span className="icon">
                  <FontAwesomeIcon icon={item.icon} />
                </span>
                <span className="text">{item.text}</span>
              </Link>
            </li>
          ))}
        </ul>
        <div 
          className="indicator" 
          style={{ transform: `translateX(${distances[activeIndex]}px)` }}
        ></div>
      </div>
      
    </nav>

    <div className='login-signup'>
         <button onClick={(() => window.location.href='/loginsignup')}>LOGIN/SIGNUP</button>
      </div>

    </>

    
  );
}

export default Navbar;
