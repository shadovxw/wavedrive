import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../auth/CartContext';

const productPrices = {
  'WaveX Two': 7999,
  'WaveX One': 4999,
};

function CartPages() {
  const { cartItems, clearCart } = useCart();
  const navigate = useNavigate();

  const totalPrice = cartItems.reduce((total, item) => {
    return total + (productPrices[item] || 0);
  }, 0);

  const handleCheckout = () => {
    alert('Checkout functionality coming soon!');
    clearCart();
    navigate('/kit');
  };

  return (
    <div className="wavedrive-container">
      <h1>Your Cart</h1>
      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ddd' }}>
                <th style={{ textAlign: 'left', padding: '8px' }}>Product</th>
                <th style={{ textAlign: 'right', padding: '8px' }}>Price (₹)</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map((item) => (
                <tr key={item} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '8px' }}>{item}</td>
                  <td style={{ padding: '8px', textAlign: 'right' }}>{productPrices[item]}</td>
                </tr>
              ))}
              <tr>
                <td style={{ padding: '8px', fontWeight: 'bold' }}>Total</td>
                <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>{totalPrice}</td>
              </tr>
            </tbody>
          </table>
          <button className="buy-button" onClick={handleCheckout} style={{ marginTop: '20px' }}>Checkout</button>
        </>
      )}
    </div>
  );
}

export default CartPages;