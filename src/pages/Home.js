import React from "react";
import { Link } from "react-router-dom";
import "../styles/Home.css"; // Import the CSS file

const Home = () => {
  return (
    <div className="home-container">
      {/* Header Section */}
      <header className="header">
        <h1 className="title">SSSIO SAI 100 Initiatives Journal</h1>
        <div className="auth-links">
          <Link to="/login" className="auth-btn">Login</Link>
          <Link to="/signup" className="auth-btn">Sign Up</Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="content">
        {/* Left Section - Two Images */}
        <div className="image-section">
          <img src="/ssio-logo-english.png" alt="SSSIO logo" className="custom-img" />
          <img src="/100-birthday-logo.png" alt="100 birthday logo" className="custom-img" />
        </div>

        {/* Right Section - Text */}
        <div className="text-section">
          <h2>Welcome to the SAI 100 Initiatives Journal</h2>
          <p>
          As an offering of love and gratitude to Lord Sai for HIS 100th Birthday, the Sri Sathya Sai International Organization (SSSIO) commenced the SAI 100 Program, which implements 12 initiatives to serve humanity, intensify our spiritual journey, and serve everyone.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
