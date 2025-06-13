import React from "react";
import "../styles/Home.css";
import { Link } from "react-router-dom";

const Header = ({ children }) => (
  <header className="header">
    <div className="header-left">
      <Link to="/">
        <img
          src="/ssio-logo-english.png"
          alt="SSSIO logo"
          className="header-logo"
          style={{ cursor: "pointer" }}
        />
      </Link>
      <h1 className="title">SSSIO SAI 100 Initiatives Journal</h1>
    </div>
    <div className="auth-links">
      {children}
    </div>
  </header>
);

export default Header;