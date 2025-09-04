"use client"

import { useState, useEffect } from "react"
import "../styles/EcoShelfView.css"

const EcoShelfView = ({ onAddToCart }) => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("http://localhost:8000/api/discounted-prices")
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setProducts(data)
    } catch (err) {
      console.warn("API not available, using fallback data:", err)

      // Fallback data
      const fallbackData = [
        {
          product_name: "Bread",
          product_id: 8800000022,
          original_price: 55,
          discounted_price: 36.97,
          expiry_date: "2025-01-20",
          days_left: 1,
        },
        {
          product_name: "Bread",
          product_id: 8800000039,
          original_price: 55,
          discounted_price: 44.41,
          expiry_date: "2025-01-21",
          days_left: 2,
        },
        {
          product_name: "Milk",
          product_id: 8800000069,
          original_price: 50,
          discounted_price: 33.81,
          expiry_date: "2025-01-20",
          days_left: 1,
        },
        {
          product_name: "Milk",
          product_id: 8800000042,
          original_price: 50,
          discounted_price: 40.61,
          expiry_date: "2025-01-21",
          days_left: 2,
        },
        {
          product_name: "Paneer",
          product_id: 8800000003,
          original_price: 60,
          discounted_price: 36.65,
          expiry_date: "2025-01-20",
          days_left: 1,
        },
        {
          product_name: "Paneer",
          product_id: 8800000033,
          original_price: 60,
          discounted_price: 40.15,
          expiry_date: "2025-01-21",
          days_left: 2,
        },
      ]

      setProducts(fallbackData)
      setError("Using demo data - API server not available")
    } finally {
      setLoading(false)
    }
  }

  const getProductImage = (productName) => {
    const imageMap = {
      Bread: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&h=200&fit=crop",
      Milk: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=300&h=200&fit=crop",
      Paneer: "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=300&h=200&fit=crop",
    }
    return imageMap[productName] || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&h=200&fit=crop"
  }

  const getUrgencyClass = (daysLeft) => {
    if (daysLeft <= 1) return "urgent"
    if (daysLeft <= 2) return "warning"
    return "safe"
  }

  const calculateSavings = (original, discounted) => {
    return (((original - discounted) / original) * 100).toFixed(0)
  }

  if (loading) {
    return (
      <div className="ecoshelf-view">
        <div className="container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading products...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="ecoshelf-view">
      <div className="container">
        {error && (
          <div className="error-banner">
            <span className="warning-icon">⚠️</span>
            <p>{error} - Showing demo products for preview</p>
          </div>
        )}

        <div className="ecoshelf-header">
          <h1>EcoShelf Products</h1>
          <p>Fresh products at discounted prices - help reduce food waste!</p>
        </div>

        <div className="products-grid">
          {products.map((product) => (
            <div key={product.product_id} className="product-card">
              <div className="product-image-container">
                <img
                  src={getProductImage(product.product_name) || "/placeholder.svg"}
                  alt={product.product_name}
                  className="product-image"
                />
                <div className={`urgency-badge ${getUrgencyClass(product.days_left)}`}>
                  🕒 {product.days_left} day{product.days_left !== 1 ? "s" : ""} left
                </div>
                <div className="discount-badge">
                  {calculateSavings(product.original_price, product.discounted_price)}% OFF
                </div>
              </div>

              <div className="product-content">
                <h3 className="product-name">{product.product_name}</h3>

                <div className="price-container">
                  <div className="price-section">
                    <span className="original-price">₹{product.original_price.toFixed(2)}</span>
                    <span className="discounted-price">₹{product.discounted_price.toFixed(2)}</span>
                  </div>
                  <div className="savings-badge">
                    🏷️ Save ₹{(product.original_price - product.discounted_price).toFixed(2)}
                  </div>
                </div>

                <div className="expiry-date">Expires: {new Date(product.expiry_date).toLocaleDateString()}</div>

                <button className="add-to-cart-btn" onClick={() => onAddToCart(product)}>
                  ➕ Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>

        {products.length === 0 && !loading && (
          <div className="no-products">
            <p>No products available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default EcoShelfView
