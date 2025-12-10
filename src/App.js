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
import TwitterConnect from "./pages/TwitterConnect";
import TwitterManager from "./pages/TwitterManger";

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
        <Route path="/twitter-connect" element={<TwitterConnect />} />
        <Route path="/twitter-manager" element={<TwitterManager />} />

        {/*  */}
      </Routes>
    </Router>
  );
}

export default App;