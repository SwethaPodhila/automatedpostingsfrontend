import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
//import Dashboard from "./pages/Dashboard";
import "bootstrap/dist/css/bootstrap.min.css";
import Dashboard from "./pages/Dashboard";
import Success from "./pages/Success";
import PrivacyPolicy from "./pages/Privacy-policy";
import ManualPost from "./pages/MannualPost";
import TwitterConnect from "./pages/TwitterConnect";
import TwitterManager from "./pages/TwitterManger";
import TwitterCard from "./pages/TwitterCard";
import FacebookCard from "./pages/FacebookCard";
import InstagramCard from "./pages/InstagramCard";
import LinkedInCard from "./pages/LinkedinCard";
import YouTubeCard from "./pages/YoutubeCard";
import AllPost from "./pages/AllPosts";
import InstagramDashboard from "./pages/InstagramDashboard";
import AutomationForm from "./pages/AutomationForm";
import LinkedInConnect from "./pages/LinkedinConnection";
import LinkedinManager from "./pages/LinkedinManager";
import ManualPosting from "./pages/ManualPosting";
import Pricing from "./pages/Pricing";
import ForgotPassword from "./pages/ForgotPassword";
import WeeklyCalendar from "./pages/WeeklyCalendar";
import Profile from "./pages/Profile";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/success" element={<Success />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/manual-post" element={<ManualPost />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route path="/twitter-connect" element={<TwitterConnect />} />
        <Route path="/twitter-manager" element={<TwitterManager />} />

        <Route path="/twitter-card" element={<TwitterCard />} />
        <Route path="/facebook-card" element={<FacebookCard />} />
        <Route path="/instagram-card" element={<InstagramCard />} />
        
        <Route path="/youtube-card" element={<YouTubeCard />} />
        <Route path="/all-posts" element={<AllPost />} />
        <Route path="/auto-post" element={<AutomationForm />} /> 

        <Route path="/instagram-dashboard" element={<InstagramDashboard />} />

        <Route path="/linkedin-card" element={<LinkedInCard />} />
        <Route path="/linkedin-connect" element={<LinkedInConnect />} />
        <Route path="/linkedin-manager" element={<LinkedinManager />} />
        <Route path="/manualPosting" element={<ManualPosting />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/weekly-calendar" element={<WeeklyCalendar />} />
        <Route path="/profile" element={<Profile />} />

        {/*  */}
      </Routes>
    </Router>
  );
}

export default App;