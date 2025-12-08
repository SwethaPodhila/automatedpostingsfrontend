import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
//import Dashboard from "./pages/Dashboard";
import "bootstrap/dist/css/bootstrap.min.css";
import Dashboard from "./pages/Dashboard";
import FacebookConnect from "./pages/FacebookConnect";
import Success from "./pages/Success";
import PrivacyPolicy from "./pages/Privacy-policy";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/facebook" element={<FacebookConnect />} />
        <Route path="/sucess" element={<Success />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        {/*  */}
      </Routes>
    </Router>
  );
}

export default App;