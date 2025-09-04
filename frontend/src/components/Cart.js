"use client"
import "../styles/Cart.css"

const Cart = ({ cartItems, onUpdateQuantity, onRemoveItem, onProceedToCheckout }) => {
  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.discounted_price * item.quantity, 0)
  }

  const getOriginalTotal = () => {
    return cartItems.reduce((total, item) => total + item.original_price * item.quantity, 0)
  }

  const getTotalSavings = () => {
    return getOriginalTotal() - getTotalPrice()
  }

  const getProductImage = (productName) => {
    const imageMap = {
      Bread: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=80&h=80&fit=crop",
      Milk: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=80&h=80&fit=crop",
      Paneer: "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=80&h=80&fit=crop",
    }
    return imageMap[productName] || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=80&h=80&fit=crop"
  }

  if (cartItems.length === 0) {
    return (
      <div className="cart-view">
        <div className="container">
          <div className="empty-cart">
            <div className="empty-cart-icon">🛒</div>
            <h2>Your cart is empty</h2>
            <p>Add some products from EcoShelf to get started!</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="cart-view">
      <div className="container">
        <div className="cart-header">
          <h1>Shopping Cart</h1>
          <p>
            {cartItems.length} item{cartItems.length !== 1 ? "s" : ""} in your cart
          </p>
        </div>

        <div className="cart-container">
          <div className="cart-items">
            {cartItems.map((item) => (
              <div key={item.product_id} className="cart-item">
                <img
                  src={getProductImage(item.product_name) || "/placeholder.svg"}
                  alt={item.product_name}
                  className="item-image"
                />

                <div className="item-details">
                  <h3 className="item-name">{item.product_name}</h3>
                  <p className="item-expiry">Expires: {new Date(item.expiry_date).toLocaleDateString()}</p>
                  <div className="item-price">
                    <span className="item-original-price">₹{item.original_price.toFixed(2)}</span>
                    <span className="item-discounted-price">₹{item.discounted_price.toFixed(2)}</span>
                  </div>
                </div>

                <div className="quantity-controls">
                  <button className="quantity-btn" onClick={() => onUpdateQuantity(item.product_id, item.quantity - 1)}>
                    −
                  </button>
                  <span className="quantity-display">{item.quantity}</span>
                  <button className="quantity-btn" onClick={() => onUpdateQuantity(item.product_id, item.quantity + 1)}>
                    +
                  </button>
                </div>

                <div className="item-total">
                  <div className="item-total-price">₹{(item.discounted_price * item.quantity).toFixed(2)}</div>
                  <div className="item-savings">
                    Save ₹{((item.original_price - item.discounted_price) * item.quantity).toFixed(2)}
                  </div>
                </div>

                <button className="remove-btn" onClick={() => onRemoveItem(item.product_id)} title="Remove item">
                  🗑️
                </button>
              </div>
            ))}
          </div>

          <div className="order-summary">
            <h2 className="summary-title">Order Summary</h2>

            <div className="summary-row original">
              <span>Original Total:</span>
              <span className="amount">₹{getOriginalTotal().toFixed(2)}</span>
            </div>

            <div className="summary-row">
              <span>Discounted Total:</span>
              <span className="amount">₹{getTotalPrice().toFixed(2)}</span>
            </div>

            <div className="summary-row total">
              <span>Total Savings:</span>
              <span className="amount">₹{getTotalSavings().toFixed(2)}</span>
            </div>

            <button className="checkout-btn" onClick={onProceedToCheckout}>
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart
