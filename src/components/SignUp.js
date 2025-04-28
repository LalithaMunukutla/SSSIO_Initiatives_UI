import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css"; // Reuse the same CSS as the login page
import { ConstantsContext } from "./ConstantsContext";
const Signup = () => {
  const { constants} = useContext(ConstantsContext);
  const [email, setEmail] = useState("");
  const [userName, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [country, setCountry] = useState("");
  const [zone, setZone] = useState("");
  const [region, setRegion] = useState("");
  const [role, setRole] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requestBody = {
      email,
      userName,
      password,
      country: parseInt(country),
      zone: parseInt(zone),
      region: parseInt(region),
      role: parseInt(role),
    };

    try {
      const response = await fetch("/user/registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error("Failed to register. Please try again.");
      }

      console.log("User registered successfully");
      navigate("/view-submitted-forms"); // Redirect to login after successful signup
    } catch (error) {
      console.error("Error during registration:", error);
    }
  };

  return (
    <div className="login-container align-centre">
      <div className="login-box">
        <h2>Sign Up</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            name ="username"
            value={userName}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <select value={zone} onChange={(e) => setZone(e.target.value)} required>
            <option value="">Select Zone</option>
            {constants.zones.map((zone) => (
                <option key={zone.id} value={zone.id}>
                  {zone.zone}
                </option>
              ))}
          </select>
          <select value={country} onChange={(e) => setCountry(e.target.value)} required>
            <option value="">Select Country</option>
            {constants.countries.map((country) => (
                <option key={country.id} value={country.id}>
                  {country.country}
                </option>
              ))}
          </select>
          
          <select value={region} onChange={(e) => setRegion(e.target.value)} required>
            <option value="">Select Region</option>
            {constants.regions.map((region) => (
                <option key={region.id} value={region.id}>
                  {region.region}
                </option>
              ))}
          </select>
          <select value={role} onChange={(e) => setRole(e.target.value)} required>
            <option value="">Select Role</option>
            {constants.roles.map((role) => (
                <option key={role.id} value={role.role}>
                  {role.role}
                </option>
              ))}
          </select>
          <button type="submit">Sign Up</button>
        </form>
        <p>
          Already have an account?{" "}
          <span className="signup-link" onClick={() => navigate("/login")}>
            Login 
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

export default Signup;