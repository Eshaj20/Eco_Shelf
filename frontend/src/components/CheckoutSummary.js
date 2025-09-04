"use client"

import { useState } from "react"
import "../styles/CheckoutSummary.css"

const CheckoutSummary = ({ cartItems, totalPrice, originalTotal, totalSavings, onBackToCart }) => {
  const [orderPlaced, setOrderPlaced] = useState(false)

  const handlePlaceOrder = () => {
    setOrderPlaced(true)
  }

  const handleContinueShopping = () => {
    window.location.reload()
  }

  if (orderPlaced) {
    return (
      <div className="success-modal">
        <div className="success-content">
          <div className="success-icon">✅</div>
          <h1>Order Placed Successfully!</h1>
          <p>Thank you for choosing Walmart EcoShelf. Your order will be processed shortly.</p>

          <div className="savings-highlight">
            <p>🎉 You saved ₹{totalSavings.toFixed(2)} and helped reduce food waste!</p>
          </div>

          <button className="continue-shopping-btn" onClick={handleContinueShopping}>
            Continue Shopping
          </button>
        </div>
      </div>
    )
  }

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="checkout-view">
      <div className="container">
        <button className="back-button" onClick={onBackToCart}>
          ← Back to Cart
        </button>

        <div className="checkout-container">
          {/* Order Items */}
          <div className="order-items-card">
            <div className="card-header">
              <h2 className="card-title">Order Items ({totalItems} items)</h2>
            </div>
            <div className="card-content">
              {cartItems.map((item) => (
                <div key={item.product_id} className="order-item">
                  <div className="item-info">
                    <h4>{item.product_name}</h4>
                    <p>Quantity: {item.quantity}</p>
                    <p>Expires: {new Date(item.expiry_date).toLocaleDateString()}</p>
                  </div>
                  <div className="item-pricing">
                    <div className="original">₹{(item.original_price * item.quantity).toFixed(2)}</div>
                    <div className="discounted">₹{(item.discounted_price * item.quantity).toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="order-summary-card">
            <div className="card-header">
              <h2 className="card-title">Order Summary</h2>
            </div>
            <div className="card-content">
              <div className="summary-section">
                <div className="summary-row">
                  <span className="label">Number of Items:</span>
                  <span className="value">{totalItems}</span>
                </div>

                <div className="summary-row">
                  <span className="label">Original Total:</span>
                  <span className="value strikethrough">₹{originalTotal.toFixed(2)}</span>
                </div>

                <div className="summary-row">
                  <span className="label">Discounted Total:</span>
                  <span className="value">₹{totalPrice.toFixed(2)}</span>
                </div>

                <div className="summary-row total">
                  <span className="label">Total Money Saved:</span>
                  <span className="value">₹{totalSavings.toFixed(2)}</span>
                </div>
              </div>

              <div className="environmental-message">
                <p>🌱 Congratulations! You're saving ₹{totalSavings.toFixed(2)} while helping reduce food waste!</p>
              </div>

              <button className="place-order-btn" onClick={handlePlaceOrder}>
                Place Order
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckoutSummary
