import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Home.css";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import AIWingsLogo from "./AIWingsLogo.png";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import About1 from "./AIWings.png";
import About2 from "./AIWings2.png";
import About3 from "./AIWings3.png";
import { useNavigate } from "react-router-dom";

const Index = () => {
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: ""
    });
    const [responseMsg, setResponseMsg] = useState("");

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const res = await fetch("https://automatedpostingbackend-h9dc.onrender.com/user/support", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        });

        const data = await res.json();
        setResponseMsg(data.msg);

        if (data.success) {
            setFormData({
                name: "",
                email: "",
                phone: "",
                subject: "",
                message: ""
            });
        }
    };

    const getUserFromToken = () => {
        const token = localStorage.getItem("token");
        console.log("Token from localStorage:", token); // ✅ check if token exists

        if (!token) return null;

        try {
            const decoded = jwtDecode(token);
            console.log("Decoded token:", decoded); // ✅ check decoded payload
            return decoded;
        } catch (err) {
            console.log("Invalid token", err);
            return null;
        }
    };

    const handlePayment = async (plan) => {
        const user = getUserFromToken();
        if (!user || !user.id) return alert("User not logged in!");

        const amount = plan === "PRO" ? 999 : plan === "ENTERPRISE" ? 1999 : 0;
        if (!amount) return alert("Free plan");

        try {
            // 1️⃣ Create order
            const { data } = await axios.post(
                "https://automatedpostingbackend-h9dc.onrender.com/payment/create-order",
                {
                    plan,
                    userId: user.id,
                    customerName: user.name,
                    customerEmail: user.email,
                    customerPhone: "9876543210",
                }
            );

            console.log("Cashfree order response:", data);

            if (!data.paymentSessionId) return alert("Payment session missing");

            if (!window.Cashfree) {
                console.error("❌ Cashfree SDK not loaded");
                return alert("Payment SDK not loaded. Refresh page.");
            }

            // 2️⃣ Initialize Cashfree
            const cashfree = window.Cashfree({ mode: "production", });

            // 3️⃣ Store orderId for verification
            const orderId = data.orderId;

            // 4️⃣ Checkout
            cashfree
                .checkout({
                    paymentSessionId: data.paymentSessionId,
                    redirectTarget: "_modal",
                })
                .then(async (result) => {
                    console.log("💳 Payment result:", result);

                    if (result.error) {
                        alert("Payment failed or cancelled");
                        return;
                    }

                    // 5️⃣ MANUAL CALLBACK – verify payment status
                    console.log("✅ SUCCESS ORDER ID (stored):", orderId);

                    try {
                        const verify = await axios.post(
                            "https://automatedpostingbackend-h9dc.onrender.com/payment/callback",
                            { orderId }
                        );

                        if (verify.data.success) {
                            alert("Payment successful 🎉 Plan activated!");
                        } else {
                            alert("Payment verification failed!");
                        }
                    } catch (err) {
                        console.error("Payment verification error:", err.response?.data || err.message);
                        alert("Payment verification failed!");
                    }
                });
        } catch (err) {
            console.error(err.response?.data || err.message);
            alert("Payment initiation failed!");
        }
    };

    return (
        <div>
            {/* ========== HEADER ========== */}
            <nav className="navbar navbar-expand-lg navbar-custom sticky-top">
                <div className="container">
                    <a className="navbar-brand navbar-brand-custom d-flex align-items-center" href="#">
                        <div className="logo-icon"><img src={AIWingsLogo} alt="Logo" className="logo-icon-img" /></div>
                        <span className="gradient-text">AiWingsGlobal</span>
                    </a>

                    <button
                        className="navbar-toggler border-0"
                        type="button"
                        onClick={() => setMenuOpen(!menuOpen)}
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    <div className={`collapse navbar-collapse ${menuOpen ? 'show' : ''}`}>
                        <ul className="navbar-nav mx-auto">
                            <li className="nav-item">
                                <a className="nav-link nav-link-custom" href="#features">Features</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link nav-link-custom" href="#pricing">Pricing</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link nav-link-custom" href="#ai">AI</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link nav-link-custom" href="#about">About</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link nav-link-custom" href="#contact">Contact</a>
                            </li>
                        </ul>
                        <div className="d-flex gap-2">
                            <button
                                className="loginBtn btn btn-link text-decoration-none nav-link-custom"
                                onClick={() => navigate("/")}
                            >
                                Login
                            </button>
                            <button
                                className="btn btn-gradient"
                                onClick={() => navigate("/register")}
                            >
                                Get Started
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* ========== HERO SECTION ========== */}
            <section className="hero-section">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-lg-6">
                            <div className="hero-badge">
                                <span className="hero-badge-dot"></span>
                                AI-Powered Automation
                            </div>
                            <h1 className="hero-title">
                                AI-Powered <span className="gradient-text">Social Media</span> Automation
                            </h1>
                            <p className="hero-subtitle">
                                Connect Facebook, Instagram, LinkedIn, Telegram, YouTube & Pinterest.
                                Create once. Schedule everywhere. <strong>AI handles the rest.</strong>
                            </p>
                            <div className="hero-cta">
                                <button className="btn btn-gradient btn-gradient-lg" onClick={() => navigate("/register")}>Start Free Trial</button>
                                <button className="btn btn-outline-custom">▶ Watch Demo</button>
                            </div>
                            <p className="hero-note">✓ No credit card required &nbsp; ✓ 7-day free trial</p>
                        </div>

                        <div className="col-lg-6">
                            <div className="dashboard-mockup">
                                <div className="mockup-header">
                                    <div className="d-flex align-items-center gap-2">
                                        <div style={{ width: '40px', height: '40px', background: 'var(--gradient-primary)', borderRadius: '10px' }}></div>
                                        <div>
                                            <div style={{ height: '12px', width: '100px', background: '#e5e7eb', borderRadius: '4px' }}></div>
                                            <div style={{ height: '8px', width: '60px', background: '#e5e7eb', borderRadius: '4px', marginTop: '6px' }}></div>
                                        </div>
                                    </div>
                                    <div className="mockup-dots">
                                        <div className="mockup-dot red"></div>
                                        <div className="mockup-dot yellow"></div>
                                        <div className="mockup-dot green"></div>
                                    </div>
                                </div>

                                <div className="social-icons-grid">
                                    <p
                                        style={{
                                            width: "100%",
                                            margin: "0 0 8px",
                                            fontSize: "0.8rem",
                                            color: "var(--text-muted)",
                                        }}
                                    >
                                        Connect and manage multiple social accounts
                                    </p>

                                    <div className="social-icon facebook">
                                        <i className="bi bi-facebook"></i>
                                    </div>
                                    <div className="social-icon instagram">
                                        <i className="bi bi-instagram"></i>
                                    </div>
                                    <div className="social-icon linkedin">
                                        <i className="bi bi-linkedin"></i>
                                    </div>
                                    <div className="social-icon youtube">
                                        <i className="bi bi-youtube"></i>
                                    </div>
                                    <div className="social-icon telegram">
                                        <i className="bi bi-telegram"></i>
                                    </div>
                                    <div className="social-icon twitter">
                                        <i className="bi bi-twitter"></i>
                                    </div>
                                    <div className="social-icon pinterest">
                                        <i className="bi bi-pinterest"></i>
                                    </div>

                                </div>


                                <div className="mockup-stats">
                                    <div className="mockup-stat">
                                        <div className="mockup-stat-value">24/7</div>
                                        <div className="mockup-stat-label">Posts Scheduled</div>
                                    </div>
                                    <div className="mockup-stat">
                                        <div className="mockup-stat-value">12.5K</div>
                                        <div className="mockup-stat-label">Engagement</div>
                                    </div>

                                </div>

                                <div className="floating-element floating-rocket">🚀</div>
                                <div className="floating-element floating-sparkle">✨</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ========== STATS SECTION ========== */}
            <section className="stats-section">
                <div className="container">
                    <div className="row g-4">

                        <div className="col-6 col-lg-3">
                            <div className="stat-glass">
                                <div className="icon-glow blue">
                                    <i className="bi bi-calendar-event"></i>
                                </div>
                                <h3 className="stat-number gradient-blue">10M+</h3>
                                <p className="stat-text">Posts Scheduled</p>
                            </div>
                        </div>

                        <div className="col-6 col-lg-3">
                            <div className="stat-glass">
                                <div className="icon-glow purple">
                                    <i className="bi bi-globe2"></i>
                                </div>
                                <h3 className="stat-number gradient-purple">6+</h3>
                                <p className="stat-text">Platforms Supported</p>
                            </div>
                        </div>

                        <div className="col-6 col-lg-3">
                            <div className="stat-glass">
                                <div className="icon-glow violet">
                                    <i className="bi bi-robot"></i>
                                </div>
                                <h3 className="stat-number gradient-violet">100%</h3>
                                <p className="stat-text">AI Automation</p>
                            </div>
                        </div>

                        <div className="col-6 col-lg-3">
                            <div className="stat-glass">
                                <div className="icon-glow pink">
                                    <i className="bi bi-graph-up"></i>
                                </div>
                                <h3 className="stat-number gradient-pink">340%</h3>
                                <p className="stat-text">Engagement Growth</p>
                            </div>
                        </div>

                    </div>
                </div>
            </section>


            {/* ========== FEATURES SECTION ========== */}
            <section id="features" className="features-section section-padding">
                <div className="container">
                    <div className="text-center mb-5">
                        <h2 className="section-title">Why Choose <span className="gradient-text">AiWingsGlobal</span></h2>
                        <p className="section-subtitle">Everything you need to dominate social media, powered by cutting-edge AI technology.</p>
                    </div>

                    <div className="row g-4">
                        <div className="col-md-6 col-lg-4">
                            <div className="feature-card">
                                <div className="feature-icon">✨</div>
                                <h3 className="feature-title">AI Content Assistance</h3>
                                <p className="feature-desc">Generate captivating captions, hashtags, and content ideas powered by advanced AI.</p>
                            </div>
                        </div>
                        <div className="col-md-6 col-lg-4">
                            <div className="feature-card">
                                <div className="feature-icon">⏰</div>
                                <h3 className="feature-title">Smart Scheduling</h3>
                                <p className="feature-desc">AI analyzes your audience and suggests the optimal times to post for maximum engagement.</p>
                            </div>
                        </div>
                        <div className="col-md-6 col-lg-4">
                            <div className="feature-card">
                                <div className="feature-icon">🔗</div>
                                <h3 className="feature-title">Multi-platform Posting</h3>
                                <p className="feature-desc">Create once and publish across all major social platforms with a single click.</p>
                            </div>
                        </div>
                        <div className="col-md-6 col-lg-4">
                            <div className="feature-card">
                                <div className="feature-icon">📅</div>
                                <h3 className="feature-title">Automation with Dates</h3>
                                <p className="feature-desc">Set start and end dates for campaigns. AI handles posting automatically.</p>
                            </div>
                        </div>
                        <div className="col-md-6 col-lg-4">
                            <div className="feature-card">
                                <div className="feature-icon">📊</div>
                                <h3 className="feature-title">Analytics & Insights</h3>
                                <p className="feature-desc">Track performance, engagement metrics, and growth across all your connected accounts.</p>
                            </div>
                        </div>
                        <div className="col-md-6 col-lg-4">
                            <div className="feature-card">
                                <div className="feature-icon">🔒</div>
                                <h3 className="feature-title">Secure Connections</h3>
                                <p className="feature-desc">Bank-level encryption keeps your social accounts and data completely secure.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ========== HOW IT WORKS ========== */}
            <section className="hiw-section">
                <div className="container">
                    <div className="text-center mb-5">
                        <h2 className="section-title">How It <span className="gradient-text">Works</span></h2>
                        <p className="section-subtitle">Get started in three simple steps. No technical skills required.</p>
                    </div>

                    <div className="row g-4">
                        <div className="col-md-4">
                            <div className="hiw-step">
                                <div className="hiw-circle">
                                    <div className="hiw-circle-inner">🔗</div>
                                    <div className="hiw-number">01</div>
                                </div>
                                <h3 className="hiw-title">Connect Accounts</h3>
                                <p className="hiw-desc">Link your social media accounts securely in seconds. Facebook, Instagram, LinkedIn, and more.</p>
                                <div className="hiw-connector d-none d-md-block"></div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="hiw-step">
                                <div className="hiw-circle">
                                    <div className="hiw-circle-inner">💡</div>
                                    <div className="hiw-number">02</div>
                                </div>
                                <h3 className="hiw-title">Create Content or Idea</h3>
                                <p className="hiw-desc">Write your post or let AI generate content for you. Add images, videos, or stories.</p>
                                <div className="hiw-connector d-none d-md-block"></div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="hiw-step">
                                <div className="hiw-circle">
                                    <div className="hiw-circle-inner">🚀</div>
                                    <div className="hiw-number">03</div>
                                </div>
                                <h3 className="hiw-title">AI Schedules & Auto-Posts</h3>
                                <p className="hiw-desc">AI finds the best time and automatically publishes to all platforms until your end date.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ========== AI POWER SECTION ========== */}
            <section id="ai" className="ai-section section-padding">
                <div className="container position-relative" style={{ zIndex: 1 }}>
                    <div className="row align-items-center g-5">
                        <div className="col-lg-7">
                            <div className="ai-badge">
                                <span>✨</span> AI-Powered Technology
                            </div>
                            <h2 className="ai-title">
                                Let AI Be Your <span className="gradient-text">Social Media Manager</span>
                            </h2>
                            <p className="ai-desc">
                                Our advanced AI doesn't just schedule posts — it thinks like a social media expert.
                                From generating viral-worthy captions to finding the perfect posting time,
                                AiWingsGlobal handles it all automatically.
                            </p>

                            <div className="ai-features">
                                <div className="ai-feature-item">
                                    <div className="ai-feature-icon">✨</div>
                                    <span className="ai-feature-text">Generates captions & hashtags</span>
                                </div>
                                <div className="ai-feature-item">
                                    <div className="ai-feature-icon">🖼️</div>
                                    <span className="ai-feature-text">Suggests trending memes & visuals</span>
                                </div>
                                <div className="ai-feature-item">
                                    <div className="ai-feature-icon">⏰</div>
                                    <span className="ai-feature-text">Picks optimal posting times</span>
                                </div>
                                <div className="ai-feature-item">
                                    <div className="ai-feature-icon">⚡</div>
                                    <span className="ai-feature-text">Auto-posts until end date</span>
                                </div>
                            </div>

                        </div>

                        <div className="col-lg-5">
                            <div className="ai-visual">
                                <div className="ai-orb">
                                    <div className="ai-orb-inner">
                                        <div className="ai-orb-core">🤖</div>
                                    </div>
                                </div>
                                <div className="ai-floating ai-float-1">📊</div>
                                <div className="ai-floating ai-float-2">💬</div>
                                <div className="ai-floating ai-float-3">📈</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ========== USE CASES ========== */}
            <section className="usecases-section section-padding">
                <div className="container">
                    <div className="text-center mb-5">
                        <h2 className="section-title">
                            Built For <span className="gradient-text">Everyone</span>
                        </h2>
                        <p className="section-subtitle">
                            Whether you're a solo creator or running an agency, AiWingsGlobal adapts to your needs.
                        </p>
                    </div>

                    <div className="row g-4">
                        <div className="col-sm-6 col-lg-3">
                            <div className="usecase-card">
                                <div className="usecase-icon pink">
                                    <i className="bi bi-camera-fill"></i>
                                </div>
                                <h3 className="usecase-title">Content Creators</h3>
                                <p className="usecase-desc">
                                    Focus on creating amazing content while AI handles the scheduling and posting.
                                </p>
                            </div>
                        </div>

                        <div className="col-sm-6 col-lg-3">
                            <div className="usecase-card">
                                <div className="usecase-icon blue">
                                    <i className="bi bi-buildings"></i>
                                </div>

                                <h3 className="usecase-title">Small Businesses</h3>
                                <p className="usecase-desc">
                                    Grow your online presence without hiring a dedicated social media manager.
                                </p>
                            </div>
                        </div>

                        <div className="col-sm-6 col-lg-3">
                            <div className="usecase-card">
                                <div className="usecase-icon purple">
                                    <i className="bi bi-bullseye"></i>
                                </div>
                                <h3 className="usecase-title">Digital Marketers</h3>
                                <p className="usecase-desc">
                                    Manage multiple client accounts efficiently with AI-powered automation.
                                </p>
                            </div>
                        </div>

                        <div className="col-sm-6 col-lg-3">
                            <div className="usecase-card">
                                <div className="usecase-icon violet">
                                    <i className="bi bi-people-fill"></i>
                                </div>
                                <h3 className="usecase-title">Agencies</h3>
                                <p className="usecase-desc">
                                    Scale your social media services with powerful multi-account management.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ========== PRICING SECTION ========== */}
            <section id="pricing" className="pricing-section">
                {/* CONTENT */}
                <div className="container">
                    <div
                        className="pricing-wrapper p-2"
                    >
                        {/* HEADER */}
                        <div className="text-center mb-5 pricing-header">
                            <h3 className="section-title">Grow Faster with <span className="gradient-text">AiWingsGlobal</span></h3>
                            <p className="text-muted">
                                Automate posting, scheduling, insights & lead generation in one platform
                            </p>
                        </div>

                        <div className="row g-4 justify-content-center">

                            {/* FREE */}
                            <div className="col-lg-4 col-md-6">
                                <div className="pricing-card h-100">
                                    <span className="plan-label">FREE</span>
                                    <h4 className="plan-name">Starter</h4>

                                    <h2 className="price">
                                        ₹0 <span>/ 7 Days</span>
                                    </h2>

                                    <ul className="features">
                                        <li>Scheduling (All Platforms)</li>
                                        <li>AI Assistance</li>
                                        <li>Manual Posting</li>
                                        <li>Individual Platform Posting</li>
                                        <li className="disabled">Auto Posting</li>
                                        <li className="disabled">Automation</li>
                                        <li className="disabled">Analytics & Metrics</li>
                                        <li className="disabled">Leads</li>
                                        <li className="disabled">Team / Agency Access</li>
                                        <li className="disabled">Priority Support</li>

                                    </ul>

                                    <button className="btn btn-outline-brand w-100">
                                        Start Free Trial
                                    </button>
                                </div>
                            </div>

                            {/* PRO */}
                            <div className="col-lg-4 col-md-6">
                                <div className="pricing-card popular h-100">
                                    <span className="popular-badge">Most Popular</span>
                                    <span className="plan-label highlight-text">PRO</span>
                                    <h4 className="plan-name">Professional</h4>

                                    <h2 className="price highlight">
                                        ₹999 <span>/ month</span>
                                    </h2>

                                    <ul className="features">
                                        <li>Scheduling</li>
                                        <li>Auto Posting</li>
                                        <li>Automation</li>
                                        <li>Post to 3 Platforms at Once</li>
                                        <li>Automation for 3 Accounts</li>
                                        <li>AI Assistance</li>
                                        <li className="disabled">Analytics & Metrics</li>
                                        <li className="disabled">Leads</li>
                                        <li className="disabled">Team / Agency Access</li>
                                        <li className="disabled">Priority Support</li>

                                    </ul>

                                    <button
                                        className="btn btn-brand w-100"
                                        onClick={() => handlePayment("PRO")}
                                    >
                                        Upgrade to Pro
                                    </button>
                                </div>
                            </div>

                            {/* ENTERPRISE */}
                            <div className="col-lg-4 col-md-6">
                                <div className="pricing-card enterprise h-100">
                                    <span className="plan-label enterprise-text">ENTERPRISE</span>
                                    <h4 className="plan-name">Ultimate</h4>

                                    <h2 className="price highlight">
                                        ₹1999 <span>/ month</span>
                                    </h2>

                                    <ul className="features">
                                        <li>Scheduling</li>
                                        <li>Auto Posting</li>
                                        <li>Full Automation</li>
                                        <li>Post to ALL Platforms at Once</li>
                                        <li>Unlimited Accounts</li>
                                        <li>Advanced AI Assistance</li>
                                        <li>Analytics & Metrics</li>
                                        <li>Leads Management</li>
                                        <li>Team / Agency Access</li>
                                        <li>Priority Support</li>
                                    </ul>

                                    <button
                                        className="btn btn-outline-enterprise w-100"
                                        onClick={() => handlePayment("ENTERPRISE")}
                                    >
                                        Upgrade to Enterprise
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </section>

            {/* ========== ABOUT SECTION ========== */}
            <section id="about" className="about-section section-padding">
                <div className="container">
                    <div className="row align-items-center g-5">

                        {/* LEFT CONTENT */}
                        <div className="col-lg-6">
                            <h2 className="section-title mb-4">
                                About <span className="gradient-text">AiWingsGlobal</span>
                            </h2>

                            <p className="about-text">
                                We're on a mission to democratize social media success. AiWingsGlobal was built by a team
                                of marketers and engineers who understood the pain of managing multiple social platforms.
                            </p>

                            <p className="about-text">
                                Our AI-first approach means you spend less time on repetitive tasks and more time on
                                what matters — creating amazing content and growing your audience.
                            </p>

                            <p className="about-text about-highlight">
                                Join thousands of creators and businesses who trust AiWingsGlobal.
                            </p>
                        </div>

                        {/* RIGHT IMAGE SLIDER */}
                        <div className="col-lg-6">
                            <div
                                id="aboutCarousel"
                                className="carousel slide"
                                data-bs-ride="carousel"
                                data-bs-interval="3000"
                            >

                                {/* DOTS */}
                                <div className="carousel-indicators">
                                    <button
                                        type="button"
                                        data-bs-target="#aboutCarousel"
                                        data-bs-slide-to="0"
                                        className="active"
                                        aria-current="true"
                                    ></button>

                                    <button
                                        type="button"
                                        data-bs-target="#aboutCarousel"
                                        data-bs-slide-to="1"
                                    ></button>

                                    <button
                                        type="button"
                                        data-bs-target="#aboutCarousel"
                                        data-bs-slide-to="2"
                                    ></button>
                                </div>

                                {/* SLIDES */}
                                <div className="carousel-inner">
                                    <div className="carousel-item active">
                                        <img src={About1} className="d-block w-100" alt="About 1" />
                                    </div>

                                    <div className="carousel-item">
                                        <img src={About2} className="d-block w-100" alt="About 2" />
                                    </div>

                                    <div className="carousel-item">
                                        <img src={About3} className="d-block w-100" alt="About 3" />
                                    </div>
                                </div>

                                {/* ARROWS */}
                                <button
                                    className="carousel-control-prev"
                                    type="button"
                                    data-bs-target="#aboutCarousel"
                                    data-bs-slide="prev"
                                >
                                    <span className="carousel-control-prev-icon"></span>
                                </button>

                                <button
                                    className="carousel-control-next"
                                    type="button"
                                    data-bs-target="#aboutCarousel"
                                    data-bs-slide="next"
                                >
                                    <span className="carousel-control-next-icon"></span>
                                </button>

                            </div>
                        </div>
                    </div>

                    {/* FULL WIDTH STATS */}
                    <div className="about-stats about-stats-full">
                        <div className="about-stat">
                            <div className="about-stat-value">50K+</div>
                            <div className="about-stat-label">Happy Users</div>
                        </div>
                        <div className="about-stat">
                            <div className="about-stat-value">120+</div>
                            <div className="about-stat-label">Countries</div>
                        </div>
                        <div className="about-stat">
                            <div className="about-stat-value">4.9★</div>
                            <div className="about-stat-label">User Rating</div>
                        </div>
                        <div className="about-stat">
                            <div className="about-stat-value">24/7</div>
                            <div className="about-stat-label">AI Support</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ========== CTA + SUPPORT SECTION ========== */}
            <section className="cta-support-section" id="contact">
                <div className="container">
                    <div className="row align-items-center" >

                        {/* LEFT CONTENT */}
                        <div className="col-lg-6 mb-5 mb-lg-0">

                            <h2 className="cta-title">
                                Start Automating Your Social Media Today
                            </h2>

                            <p className="cta-desc">
                                Stop wasting hours on manual posting. AiWings helps creators and businesses
                                schedule posts across multiple platforms, generate AI-powered captions and
                                hashtags, publish content at the best time for engagement, and save 10+ hours
                                every week — all from one smart dashboard.
                            </p>

                            <div className="cta-buttons">
                                <button className="btn btn-dark-custom" onClick={() => navigate("/register")}>
                                    Start Free Trial →
                                </button>
                            </div>

                            <p className="cta-note">
                                No credit card required • 7-day free trial • Cancel anytime
                            </p>
                        </div>

                        {/* RIGHT FORM */}
                        <div className="col-lg-6">
                            <div className="glass-card">
                                <h4 className="text-center">Contact Support</h4>
                                <p className="text-center text-muted mb-4">
                                    Facing an issue? Our team will help you.
                                </p>

                                <form onSubmit={handleSubmit}>
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <input
                                                type="text"
                                                name="name"
                                                className="form-control"
                                                placeholder="Your Name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>

                                        <div className="col-md-6 mb-3">
                                            <input
                                                type="email"
                                                name="email"
                                                className="form-control"
                                                placeholder="Your Email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <input
                                            type="text"
                                            name="phone"
                                            className="form-control"
                                            placeholder="Phone Number"
                                            value={formData.phone}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <select
                                            name="subject"
                                            className="form-select"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="">Select Issue</option>
                                            <option>Connection Problem</option>
                                            <option>Account Problems</option>
                                            <option>Postings Problem</option>
                                            <option>Plans</option>
                                            <option>Features</option>
                                            <option>Registration or Login</option>
                                            <option>Others</option>
                                        </select>
                                    </div>

                                    <div className="mb-4">
                                        <textarea
                                            name="message"
                                            rows="4"
                                            className="form-control"
                                            placeholder="Describe your issue"
                                            value={formData.message}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <button type="submit" className="submit-btn w-100">
                                        Submit Request
                                    </button>
                                </form>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* ========== FOOTER ========== */}
            {/* ========== FOOTER ========== */}
            <footer className="footer-section">
                <div className="container">
                    <div className="row align-items-center gy-4">

                        {/* BRAND */}
                        <div className="col-lg-6">
                            <div className="footer-brand">
                                <div className="footer-logo">S</div>
                                <span className="footer-brand-text">AiWingsGlobal</span>
                            </div>

                            <p className="footer-desc">
                                AI-powered social media automation platform helping creators and
                                businesses save time and grow faster.
                            </p>
                        </div>

                        {/* LINKS + SOCIAL */}
                        <div className="col-lg-6 text-lg-end">
                            <div className="footer-main-links">
                                <a href="#features">Features</a>
                                <a href="#pricing">Pricing</a>
                                <a href="#contact">Contact</a>
                                <a href="" onClick={() => navigate("/privacy-policy")}>Privacy Policy</a>
                                <a href="" onClick={() => navigate("/terms")}>Terms</a>
                            </div>

                            <div className="footer-social">
                                <a href="#" className="footer-social-link" aria-label="Facebook">
                                    <i className="bi bi-facebook"></i>
                                </a>
                                <a href="#" className="footer-social-link" aria-label="Twitter">
                                    <i className="bi bi-twitter-x"></i>
                                </a>
                                <a href="#" className="footer-social-link" aria-label="Instagram">
                                    <i className="bi bi-instagram"></i>
                                </a>
                                <a href="#" className="footer-social-link" aria-label="LinkedIn">
                                    <i className="bi bi-linkedin"></i>
                                </a>
                                <a href="#" className="footer-social-link" aria-label="Youtube">
                                    <i className="bi bi-youtube"></i>
                                </a>
                            </div>
                        </div>

                    </div>

                    <div className="footer-bottom">
                        <p>© 2024 AiWingsGlobal. All rights reserved.</p>
                    </div>
                </div>
            </footer>

        </div>
    );
};

export default Index;