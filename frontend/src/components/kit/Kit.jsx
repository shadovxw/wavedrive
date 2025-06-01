import './Kit.css'
import React from "react";
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../auth/CartContext';

function Kit() {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleBuyNow = (productName) => {
    alert(`Thank you for choosing to buy ${productName}! Purchase flow coming soon.`);
  };

  const handleAddToCart = (productName) => {
    addToCart(productName);
    navigate('/cart');
  };

  const handleUserManual = (productName) => {
    alert(`Opening user manual for ${productName}.`);
  };

  return (
    <div className="wavedrive-container">
      <section className="products-section">
        <div className="product-card">
          <img src="/assets/wavex-two.jpg" alt="WaveX Two" className="product-image" />
          <div className="product-details">
            <h2>WaveX Two</h2>
            <p className="subtitle">The Next Evolution in Gesture-Controlled Driving. Smarter and Smoother Than Ever.</p>
            <p className="price">₹ 7999</p>
            <div className="info-flex">
              <div className="left-content">
                <ul className="kit-contents">
                  <li>WaveX Two Chassis – Custom-designed car body.</li>
                  <li>Camera Plug-in Display – Camera visual live feed.</li>
                  <li>Motor Driver (L298N) & Controllers – For movement.</li>
                  <li>MCU (Pi 4) – Brains for the car.</li>
                  <li>Driver Pad – Control driving via gestures.</li>
                  <li>Holding Structure & Screws – Assembly accessories.</li>
                </ul>
              </div>
              <div className="button-group">
                <button className="buy-button" onClick={() => handleBuyNow('WaveX Two')}>BUY NOW</button>
                <button className="cart-button" onClick={() => handleAddToCart('WaveX Two')}>ADD TO CART</button>
                <button className="manual-button" onClick={() => handleUserManual('WaveX Two')}>USER MANUAL</button>
              </div>
            </div>
          </div>
        </div>

        <div className="product-card">
          <img src="/assets/wavex-one.jpg" alt="WaveX One" className="product-image" />
          <div className="product-details">
            <h2>WaveX One</h2>
            <p className="subtitle">The First Generation Gesture-Controlled Car, Powered by Intuitive Motion.</p>
            <p className="price">₹ 4999</p>
            <div className="info-flex">      
              <ul className="kit-contents">
                <li>WaveX One Chassis – Custom-designed car body.</li>
                <li>Motor Driver (L298N) & Controllers – For movement.</li>
                <li>MCU (Pi 3B+) – Car control unit.</li>
                <li>Driver Pad – Intuitive driving control.</li>
                <li>Holding Structure & Screws – Assembly accessories.</li>
              </ul>
              <div className="button-group">
                <button className="buy-button" onClick={() => handleBuyNow('WaveX One')}>BUY NOW</button>
                <button className="cart-button" onClick={() => handleAddToCart('WaveX One')}>ADD TO CART</button>
                <button className="manual-button" onClick={() => handleUserManual('WaveX One')}>USER MANUAL</button>
              </div>
            </div>
          </div>
        </div>
      </section>
      <footer className="footer">© 2025 WAVEDRIVE. All rights reserved.</footer>
    </div>
  );
};

export default Kit;