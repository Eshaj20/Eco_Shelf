"use client"
import "../styles/LandingPage.css"

const LandingPage = ({ onNavigateToEcoShelf }) => {
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <h1>Welcome to EcoShelf</h1>
            <p>Saving Food, Saving Money - Smart pricing for perishable products</p>
            <button className="hero-button" onClick={onNavigateToEcoShelf}>
              Shop EcoShelf Now
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="features-header">
            <h2>How EcoShelf Works</h2>
            <p>Our smart pricing system reduces food waste while saving you money on quality products</p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon green">🕒</div>
              <h3>Dynamic Pricing</h3>
              <p>Prices automatically adjust based on expiry dates and inventory levels</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon blue">📉</div>
              <h3>Smart Discounts</h3>
              <p>Get better deals on products nearing expiry - still fresh, just discounted</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon yellow">🌱</div>
              <h3>Reduce Waste</h3>
              <p>Help reduce food waste while enjoying quality products at great prices</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Start Saving?</h2>
            <p>Browse our selection of discounted perishable products</p>
            <button className="cta-button" onClick={onNavigateToEcoShelf}>
              🛒 Browse Products
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default LandingPage
