import React from "react";
import { useNavigate } from "react-router-dom";
import backgroundImage from "./assets/agriculture.png"; 
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa"; 

const styles = {
  container: {
    fontFamily: "'Poppins', sans-serif",
    margin: "0",
    padding: "0",
    color: "#333",
    backgroundColor: "#f8f9fa",
  },
  heroSection: {
    position: "relative",
    width: "100%",
    height: "100vh",
    backgroundImage: ` url(${backgroundImage})`, 
    backgroundSize: "cover",
    backgroundPosition: "center",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    color: "#fff",
    textAlign: "center",
    padding: "20px",
  },
  heroOverlay: {
    position: "absolute",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    background: "rgba(0, 0, 0, 0.5)",
  },
  heroContent: {
    position: "relative",
    zIndex: "1",
    maxWidth: "800px",
    animation: "fadeIn 1.5s ease-in-out",
  },
  heroTitle: {
    fontSize: "56px",
    fontWeight: "bold",
    textShadow: "2px 2px 10px rgba(0, 0, 0, 0.5)",
    marginBottom: "20px",
  },
  heroSubtitle: {
    fontSize: "24px",
    margin: "10px 0",
    textShadow: "1px 1px 10px rgba(0, 0, 0, 0.5)",
  },
  ctaButton: {
    backgroundColor: "#28a745",
    color: "#fff",
    fontSize: "18px",
    padding: "15px 30px",
    borderRadius: "30px",
    textDecoration: "none",
    marginTop: "30px",
    transition: "background 0.3s, transform 0.2s",
    cursor: "pointer",
    border: "none",
    fontWeight: "bold",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
  },
  ctaButtonHover: {
    backgroundColor: "#218838",
    transform: "translateY(-2px)",
  },
  featuresSection: {
    padding: "80px 20px",
    textAlign: "center",
    backgroundColor: "#fff",
  },
  featuresTitle: {
    fontSize: "36px",
    fontWeight: "bold",
    color: "#28a745",
    marginBottom: "40px",
    animation: "slideIn 1s ease-in-out",
  },
  featuresContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "30px",
    marginTop: "40px",
    padding: "0 10%",
  },
  featureCard: {
    backgroundColor: "#fff",
    padding: "30px",
    borderRadius: "15px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
    transition: "transform 0.3s, box-shadow 0.3s",
    textAlign: "center",
    cursor: "pointer",
    animation: "fadeInUp 1s ease-in-out",
  },
  featureCardHover: {
    transform: "translateY(-10px)",
    boxShadow: "0 8px 30px rgba(0, 0, 0, 0.2)",
  },
  featureIcon: {
    fontSize: "48px",
    color: "#28a745",
    marginBottom: "20px",
  },
  featureTitle: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#333",
    marginBottom: "10px",
  },
  insightsSection: {
    padding: "80px 20px",
    textAlign: "center",
    backgroundColor: "#f8f9fa",
  },
  insightsTitle: {
    fontSize: "36px",
    fontWeight: "bold",
    color: "#28a745",
    marginBottom: "40px",
    animation: "slideIn 1s ease-in-out",
  },
  insightsContent: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "30px",
    marginTop: "40px",
    padding: "0 10%",
  },
  insightCard: {
    backgroundColor: "#fff",
    padding: "30px",
    borderRadius: "15px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
    transition: "transform 0.3s, box-shadow 0.3s",
    textAlign: "center",
    cursor: "pointer",
    animation: "fadeInUp 1s ease-in-out",
  },
  insightCardHover: {
    transform: "translateY(-10px)",
    boxShadow: "0 8px 30px rgba(0, 0, 0, 0.2)",
  },
  insightIcon: {
    fontSize: "48px",
    color: "#28a745",
    marginBottom: "20px",
  },
  insightTitle: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#333",
    marginBottom: "10px",
  },
  insightDescription: {
    fontSize: "16px",
    color: "#555",
  },
  footer: {
    backgroundColor: "#28a745",
    color: "#fff",
    textAlign: "center",
    padding: "40px 20px",
  },
  footerContent: {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  footerSocialIcons: {
    display: "flex",
    justifyContent: "center",
    gap: "20px",
  },
  footerSocialIcon: {
    fontSize: "24px",
    color: "#fff",
    transition: "color 0.3s",
    cursor: "pointer",
  },
  footerSocialIconHover: {
    color: "#218838",
  },
  footerText: {
    fontSize: "16px",
    margin: "0",
  },
  "@keyframes fadeIn": {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
  "@keyframes slideIn": {
    from: { transform: "translateY(-20px)", opacity: 0 },
    to: { transform: "translateY(0)", opacity: 1 },
  },
  "@keyframes fadeInUp": {
    from: { transform: "translateY(20px)", opacity: 0 },
    to: { transform: "translateY(0)", opacity: 1 },
  },
};

const LandingPage = () => {
  const navigate = useNavigate();

  // Feature List with Routes
  const features = [
    { icon: "🌾", title: "Crops", route: "/crops" },
    { icon: "🐄", title: "Livestocks", route: "/livestocks" },
    { icon: "📚", title: "PestPesticideInfo", route: "/PestPesticideInfo" },
    { icon: "💰", title: "Finance", route: "/finance" },
    { icon: "📦", title: "Inventory", route: "/inventory" },
    { icon: "🌦️", title: "Weather", route: "/weather" },
    { icon: "📊", title: "Analytics", route: "/analytics" },
  ];

  // Insights Data
  const insights = [
    {
      icon: "📈",
      title: "Crop Analytics",
      route: "/crop-analytics",
      description: "Track crop harvest and medical records with real-time analytics.",
    },
    {
      icon: "🐄",
      title: "Livestock Analytics",
      route: "/livestock-analytics",
      description: "Monitor livestock health, breeding records, and production metrics.",
    },
    {
      icon: "💹",
      title: "Financial Analytics",
      route: "/finance-analytics",
      description: "Track revenue, expenses, and profitability with detailed insights.",
    },

  ];

  return (
    <div style={styles.container}>
      {/* Hero Section */}
      <div style={styles.heroSection}>
        <div style={styles.heroOverlay}></div>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>Smart Farming, Smarter Future</h1>
          <p style={styles.heroSubtitle}>
            "Efficient farm management isn't just about working harder; it's about planning smarter."
          </p>
          <button
            style={styles.ctaButton}
            onMouseEnter={(e) => (e.target.style.backgroundColor = styles.ctaButtonHover.backgroundColor)}
            onMouseLeave={(e) => (e.target.style.backgroundColor = styles.ctaButton.backgroundColor)}
            onClick={() => navigate("/login")}
          >
            Get Started
          </button>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" style={styles.featuresSection}>
        <h2 style={styles.featuresTitle}>Why Choose Our Farm Management System?</h2>
        <div style={styles.featuresContainer}>
          {features.map((feature, index) => (
            <div
              key={index}
              style={styles.featureCard}
              onMouseEnter={(e) => (e.currentTarget.style.transform = styles.featureCardHover.transform)}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
              onClick={() => navigate(feature.route)}
            >
              <div style={styles.featureIcon}>{feature.icon}</div>
              <h3 style={styles.featureTitle}>{feature.title}</h3>
            </div>
          ))}
        </div>
      </div>

      {/* Insights Section */}
      <div style={styles.insightsSection}>
        <h2 style={styles.insightsTitle}>Farm Analytics Dashboard</h2>
        <div style={styles.insightsContent}>
          {insights.map((insight, index) => (
            <div
              key={index}
              style={styles.insightCard}
              onClick={() => navigate(insight.route)}
            >
              <span style={styles.insightIcon}>{insight.icon}</span>
              <h3 style={styles.insightTitle}>{insight.title}</h3>
              <p style={styles.insightDescription}>{insight.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Section */}
      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <div style={styles.footerSocialIcons}>
            <FaFacebook
              style={styles.footerSocialIcon}
              onMouseEnter={(e) => (e.target.style.color = styles.footerSocialIconHover.color)}
              onMouseLeave={(e) => (e.target.style.color = "#fff")}
            />
            <FaTwitter
              style={styles.footerSocialIcon}
              onMouseEnter={(e) => (e.target.style.color = styles.footerSocialIconHover.color)}
              onMouseLeave={(e) => (e.target.style.color = "#fff")}
            />
            <FaInstagram
              style={styles.footerSocialIcon}
              onMouseEnter={(e) => (e.target.style.color = styles.footerSocialIconHover.color)}
              onMouseLeave={(e) => (e.target.style.color = "#fff")}
            />
            <FaLinkedin
              style={styles.footerSocialIcon}
              onMouseEnter={(e) => (e.target.style.color = styles.footerSocialIconHover.color)}
              onMouseLeave={(e) => (e.target.style.color = "#fff")}
            />
          </div>
          <p style={styles.footerText}>© 2025 Farm Management. All rights reserved.</p>
          <p style={styles.footerText}>Contact: raazchy7317@gmail.com | Phone: (9876543210)</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;