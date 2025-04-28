import React from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import "../styles/Home.css"; // Reuse the same CSS for the blurred background and header
import "../styles/UserHome.css";

const UserHome = () => {
  const navigate = useNavigate();

  return (
    <div className="login-container">
      {/* Header Section */}
      <header className="header">
        <h1 className="title">SSSIO SAI 100 Initiatives Journal</h1>
        <div className="auth-links">
            <Link to="/home" className="auth-btn">View Dashboard</Link>
        &nbsp;|&nbsp;
            <Link to="/home" className="auth-btn">Home</Link>
        </div>
      </header>

      {/* Options Section */}
      <div className="userhome-options">
        <button
          className="userhome-btn"
          onClick={() => navigate("/home")}
        >
          Submit a Form
        </button>
        <button
          className="userhome-btn"
          onClick={() => navigate("/home")}
        >
          View Submitted Forms
        </button>
        <button
          className="userhome-btn"
          onClick={() => navigate("/home")}
        >
          Review a Form
        </button>
      </div>
    </div>
  );
};

export default UserHome;