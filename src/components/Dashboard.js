import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import "../styles/Home.css"; // Reuse the same CSS for the header
import "../styles/Dashboard.css"; // Create a new CSS file for this page
import { ConstantsContext } from "./ConstantsContext";

const Dashboard = () => {
    const { constants} = useContext(ConstantsContext);
  const [filters, setFilters] = useState({
    regionId: "",
    zoneId: "",
    countryId: "",
    activityId: "",
  });
  const [dashboardData, setDashboardData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const handleFilterChange = (filterType, value) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [filterType]: value,
    }));
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    setError("");
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await fetch(`/form/filter?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data");
      }
      const data = await response.json();
      setDashboardData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [filters]);

  return (
    <div className="dashboard-container">
      {/* Header Section */}
      <header className="header">
        <h1 className="title">SSSIO SAI 100 Initiatives Journal</h1>
        <div className="auth-links">
        <Link to="/view-submitted-forms" className="auth-btn">
            View my submissions
          </Link>
          &nbsp;|&nbsp;
          <Link to="/login" className="auth-btn">
            Log out
          </Link>
        </div>
      </header>

      {/* Filter Section */}
      <div className="filter-section">
        {/* <h2>Filter Options</h2> */}
        <div className="filter-group">
          <label htmlFor="activity">Activity:</label>
          <select
            id="activity"
            value={filters.activityId}
            onChange={(e) => handleFilterChange("activityId", e.target.value)}
          >
            <option value="">Select Activity</option>
            {constants.activities.map((activity) => (
                <option key={activity.id} value={activity.id}>
                  {activity.activity}
                </option>
              ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="zone">Zone:</label>
          <select
            id="zone"
            value={filters.zoneId}
            onChange={(e) => handleFilterChange("zoneId", e.target.value)}
          >
            <option value="">Select Zone</option>
            {constants.zones.map((zone) => (
                <option key={zone.id} value={zone.id}>
                  {zone.zone}
                </option>
              ))}
          </select>
        </div>

      <div className="filter-group">
          <label htmlFor="country">Country:</label>
          <select
            id="country"
            value={filters.countryId}
            onChange={(e) => handleFilterChange("countryId", e.target.value)}
          >
            <option value="">Select Country</option>
            {constants.countries.map((country) => (
                <option key={country.id} value={country.id}>
                  {country.country}
                </option>
              ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="region">Region:</label>
          <select
            id="region"
            value={filters.regionId}
            onChange={(e) => handleFilterChange("regionId", e.target.value)}
          >
            <option value="">Select Region</option>
            {constants.regions.map((region) => (
                <option key={region.id} value={region.id}>
                  {region.region}
                </option>
              ))}
          </select>
        </div>
        </div>


      {/* Dashboard Table */}
      <div className="dashboard-table-section">
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : (
          <table className="dashboard-table">
            <thead>
              <tr>
              {filters.zoneId && <th>Zone</th>}
                {filters.countryId && <th>Country</th>}
                {filters.regionId && <th>Region</th>}
                <th>Activity Name</th>
                {/* <th>Question ID</th> */}
                <th>Contributions</th>
              </tr>
            </thead>
            <tbody>
        {dashboardData.length === 0 ? (
          <tr>
            <td colSpan={filters.zoneId || filters.countryId || filters.regionId ? 5 : 2}>
              There are no contributions in this selection.
            </td>
          </tr>
        ) : (
          dashboardData.map((item) => (
            <tr key={item.activityId}>
              {filters.zoneId && <td>{item.zoneId}</td>}
              {filters.countryId && <td>{item.countryId}</td>}
              {filters.regionId && <td>{item.regionId}</td>}
              <td>{item.activityName}</td>
              <td>{item.analyticsField}</td>
            </tr>
          ))
        )}
      </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Dashboard;