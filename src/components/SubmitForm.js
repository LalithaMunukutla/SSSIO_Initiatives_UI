import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import "../styles/Home.css"; // Reuse the same CSS for the header
import "../styles/SubmitForm.css"; // Form-specific styles
import { ConstantsContext } from "./ConstantsContext";

const SubmitForm = () => {
  const { constants} = useContext(ConstantsContext);
  const [formData, setFormData] = useState({
    activityId: "",
    activityDate: "",
    zone: "",
    country: "",
    region: "",
    answers: {}, // Holds answers to dynamic questions
  });
  const [questions, setQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [error, setError] = useState("");

  const email = localStorage.getItem("email");
  const token = localStorage.getItem("token");

  // Handle input changes for the first part of the form
  const handleInputChange = (field, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  // Fetch questions based on the selected activity
  useEffect(() => {
    const fetchQuestions = async () => {
      if (!formData.activityId) {
        setQuestions([]);
        return;
      }
      setLoadingQuestions(true);
      setError("");
      try {
        const response = await fetch(`/form/questions?activityId=${formData.activityId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch questions");
        }
        const data = await response.json();
        setQuestions(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingQuestions(false);
      }
    };

    fetchQuestions();
  }, [formData.activityId, token]);

  // Handle dynamic question answers
  const handleAnswerChange = (questionId, value) => {
    setFormData((prevData) => ({
      ...prevData,
      answers: {
        ...prevData.answers,
        [questionId]: value,
      },
    }));
  };

  // Submit the form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/user/form/submit?userDetails=${email}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        throw new Error("Failed to submit the form");
      }
      alert("Form submitted successfully!");
      setFormData({
        activityId: "",
        activityDate: "",
        zone: "",
        country: "",
        region: "",
        answers: {},
      });
      setQuestions([]);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      {/* Header Section */}
      <header className="header">
        <h1 className="title">SSSIO SAI 100 Initiatives Journal</h1>
        <div className="auth-links">
        <Link to="/view-submitted-forms" className="auth-btn">
            My Submissions
          </Link>
          &nbsp;|&nbsp;
          <Link to="/dashboard" className="auth-btn">
            View Dashboard
          </Link>
          &nbsp;|&nbsp;
          <Link to="/login" className="auth-btn">
            Log out
          </Link>
        </div>
      </header>

      {/* Form Section */}
      <div className="submit-form-container">
        <form onSubmit={handleSubmit}>
          {/* First Part: General Information */}
          <div className="form-section">
            <label htmlFor="activity">Activity:</label>
            <select
              id="activity"
              value={formData.activityId}
              onChange={(e) => handleInputChange("activityId", e.target.value)}
              required
            >
              <option value="">Select Activity</option>
              {constants.activities.map((activity) => (
                <option key={activity.id} value={activity.id}>
                  {activity.activity}
                </option>
              ))}
            </select>

            <label htmlFor="activityDate">Activity Date:</label>
            <input
              type="date"
              id="activityDate"
              value={formData.activityDate}
              onChange={(e) => handleInputChange("activityDate", e.target.value)}
              required
            />

            <label htmlFor="zone">Zone:</label>
            <select
              id="zone"
              value={formData.zone}
              onChange={(e) => handleInputChange("zone", e.target.value)}
              required
            >
              <option value="">Select Zone</option>
              {constants.zones.map((zone) => (
                <option key={zone.id} value={zone.id}>
                  {zone.zone}
                </option>
              ))}
            </select>

            <label htmlFor="country">Country:</label>
            <select
              id="country"
              value={formData.country}
              onChange={(e) => handleInputChange("country", e.target.value)}
              required
            >
            <option value="">Select Country</option>
              {constants.countries.map((country) => (
                <option key={country.id} value={country.id}>
                  {country.country}
                </option>
              ))}
            </select>

            <label htmlFor="region">Region:</label>
            <select
              id="region"
              value={formData.region}
              onChange={(e) => handleInputChange("region", e.target.value)}
              required
            >
              <option value="">Select Region</option>
              {constants.regions.map((region) => (
                <option key={region.id} value={region.id}>
                  {region.region}
                </option>
              ))}
            </select>
          </div>

          {/* Second Part: Dynamic Questions */}
          <div className="form-section">
  <h2>Questions</h2>
  {loadingQuestions ? (
    <p>Loading questions...</p>
  ) : error ? (
    <p className="error">{error}</p>
  ) : questions.length === 0 ? (
    <p>No questions available for the selected activity.</p>
  ) : (
    questions.map((question) => (
      <div key={question.id} className="question-group">
        <label>{question.questionText}</label>
        {question.typeName.toLowerCase() === "text" && (
          <input
            type="text"
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
          />
        )}
        {question.typeName.toLowerCase() === "multiple choice" && (
          <select
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
          >
            <option value="">Select an option</option>
            {Object.entries(question.options).map(([key, value]) => (
              <option key={key} value={key}>
                {value}
              </option>
            ))}
          </select>
        )}
        {question.typeName.toLowerCase() === "multi select" && (
          <select
            multiple
            onChange={(e) => {
              const selectedOptions = Array.from(e.target.selectedOptions).map(
                (option) => option.value
              );
              handleAnswerChange(question.id, selectedOptions.join(",")); // Save as comma-separated values
            }}
          >
            {Object.entries(question.options).map(([key, value]) => (
              <option key={key} value={key}>
                {value}
              </option>
            ))}
          </select>
        )}
        {question.typeName.toLowerCase() === "date" && (
          <input
            type="date"
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
          />
        )}
      </div>
    ))
  )}
</div>

          <button type="submit" className="submit-btn">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default SubmitForm;