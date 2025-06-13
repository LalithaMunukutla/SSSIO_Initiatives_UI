import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import "../styles/Home.css";
import "../styles/SubmitForm.css";
import { ConstantsContext } from "./ConstantsContext";
import FormModal from "./FormModal"; // <-- Import your reusable form component
import Header from "./Header"; // <-- Import your header component

const SubmitForm = () => {
  const { constants } = useContext(ConstantsContext);
  const [formData, setFormData] = useState({
    activityId: "",
    activityDate: "",
    zone: "",
    country: "",
    region: "",
    answers: {},
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const email = localStorage.getItem("email");
  const token = localStorage.getItem("token");

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
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
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <>
    {/* <div className="background-blur"></div> */}
    <div>
      {/* Header Section */}
      <Header>
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
      </Header>

      {/* Form Section */}
      <div className="submit-form-container">
        <FormModal
          mode="submit"
          formData={formData}
          setFormData={setFormData}
          constants={constants}
          onSubmit={handleSubmit}
          onReset={() =>
            setFormData({
              activityId: "",
              activityDate: "",
              zone: "",
              country: "",
              region: "",
              answers: {},
            })
          }
          loading={loading}
          error={error}
          isModal={false}
        />
      </div>
    </div>
    </>
    
  );
};

export default SubmitForm;