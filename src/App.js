import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
//import Dashboard from "./pages/Dashboard";
import "bootstrap/dist/css/bootstrap.min.css";
import Dashboard from "./pages/Dashboard";
import Success from "./pages/Success";
import PrivacyPolicy from "./pages/Privacy-policy";
import PostToPage from "./pages/PostToPage";
import ManualPost from "./pages/MannualPost";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/success" element={<Success />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/post" element={<PostToPage />} />
        <Route path="/manual-post" element={<ManualPost />} />
        {/*  */}
      </Routes>
    </Router>
  );
}

export default App;