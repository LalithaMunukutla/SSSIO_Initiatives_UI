import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css"; // Import styles

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    try {
      const response = await fetch("/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error("Invalid email or password");
      }

      const data = await response.json();
      localStorage.setItem("token", data.token); // Store token for future requests
      localStorage.setItem("email", data.email);  // Store email for future use
      localStorage.setItem("userName", data.userName); // Store userName for future use
      localStorage.setItem("roleId", data.roleId); // Store roleId for future use
      navigate("/view-submitted-forms"); 
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-container align-centre">
      <div className="login-box">
        <h2>Login</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Login</button>
        </form>
        <p>
          Don't have an account?{" "}
          <span className="signup-link" onClick={() => navigate("/signup")}>
            Sign Up
          </span>
          &nbsp;|&nbsp;
          <span className="signup-link" onClick={() => navigate("/home")}>
            Home 
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
