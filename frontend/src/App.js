"use client"

import { useState } from "react"
import LandingPage from "./components/LandingPage"
import EcoShelfView from "./components/EcoShelfView"
import Cart from "./components/Cart"
import CheckoutSummary from "./components/CheckoutSummary"
import "./styles/App.css"

function App() {
  const [currentView, setCurrentView] = useState("home")
  const [cartItems, setCartItems] = useState([])

  const addToCart = (product) => {
    setCartItems((prev) => {
      const existingItem = prev.find((item) => item.product_id === product.product_id)
      if (existingItem) {
        return prev.map((item) =>
          item.product_id === product.product_id ? { ...item, quantity: item.quantity + 1 } : item,
        )
      }
      return [...prev, { ...product, quantity: 1 }]
    })
  }

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }
    setCartItems((prev) => prev.map((item) => (item.product_id === productId ? { ...item, quantity } : item)))
  }

  const removeFromCart = (productId) => {
    setCartItems((prev) => prev.filter((item) => item.product_id !== productId))
  }

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0)
  }

  const getTotalSavings = () => {
    return cartItems.reduce((total, item) => total + (item.original_price - item.discounted_price) * item.quantity, 0)
  }

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.discounted_price * item.quantity, 0)
  }

  const getOriginalTotal = () => {
    return cartItems.reduce((total, item) => total + item.original_price * item.quantity, 0)
  }

  return (
    <div className="app">
      {/* Walmart-style Navigation */}
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-brand">
            <span className="brand-text">ECOSHELF</span>
          </div>

          <ul className="navbar-nav">
            <li className="nav-item">
              <button
                className={`nav-link ${currentView === "home" ? "active" : ""}`}
                onClick={() => setCurrentView("home")}
              >
                Home
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${currentView === "ecoshelf" ? "active" : ""}`}
                onClick={() => setCurrentView("ecoshelf")}
              >
                EcoShelf
              </button>
            </li>
            <li className="nav-item">
              <button className="cart-button" onClick={() => setCurrentView("cart")}>
                🛒 Cart
                {getTotalItems() > 0 && <span className="cart-badge">{getTotalItems()}</span>}
              </button>
            </li>
          </ul>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        {currentView === "home" && <LandingPage onNavigateToEcoShelf={() => setCurrentView("ecoshelf")} />}
        {currentView === "ecoshelf" && <EcoShelfView onAddToCart={addToCart} />}
        {currentView === "cart" && (
          <Cart
            cartItems={cartItems}
            onUpdateQuantity={updateQuantity}
            onRemoveItem={removeFromCart}
            onProceedToCheckout={() => setCurrentView("checkout")}
          />
        )}
        {currentView === "checkout" && (
          <CheckoutSummary
            cartItems={cartItems}
            totalPrice={getTotalPrice()}
            originalTotal={getOriginalTotal()}
            totalSavings={getTotalSavings()}
            onBackToCart={() => setCurrentView("cart")}
          />
        )}
      </main>
    </div>
  )
}

export default App
