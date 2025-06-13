import React from "react";
import Header from "../components/Header";
import { Link } from "react-router-dom";
import "../styles/Home.css"; // Import the CSS file

const Home = () => {
  return (
    <div className="home-container">
      {/* Header Section */}
      <Header>
        <Link to="/login" className="auth-btn">Login</Link>
        &nbsp;|&nbsp;
        <Link to="/signup" className="auth-btn">Sign Up</Link>
      </Header>

      {/* Main Content */}
      <div className="home-bg-blur"></div>
      <div className="main-content">
      <div className="home-centered-text">
        <h2>
            Welcome to the SAI 100 Initiatives Journal
        </h2>
        <p>
          As an offering of love and gratitude to Lord Sai for HIS 100th Birthday, the&nbsp;
          <span style={{ color: "#FFD700" }}>Sri Sathya Sai International Organization (SSSIO)</span>
          &nbsp;commenced the SAI 100 Program, which implements 12 initiatives to serve humanity, intensify our spiritual journey, and serve everyone.
        </p>
      </div>
      
    </div>
    </div>
  );
};

export default Home;
