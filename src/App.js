import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Signup from "./components/SignUp";
import Home from "./pages/Home";
import UserHome from "./components/UserHome";
import ViewSubmittedForms from "./components/ViewSubmittedForms";
import Dashboard from "./components/Dashboard";
import SubmitForm from "./components/SubmitForm";
import { ConstantsProvider } from "./components/ConstantsContext";

function App() {
  return (
    <ConstantsProvider>
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/home" element={<Home />} />
        <Route path="/userhome" element={<UserHome />} />
        <Route path="/view-submitted-forms" element={<ViewSubmittedForms />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/submit-form" element={<SubmitForm />} />
        <Route path="/view-form/:responseId" element={<div>View Form Page</div>} />
      </Routes>
    </Router>
    </ConstantsProvider>
  );
}

export default App;
