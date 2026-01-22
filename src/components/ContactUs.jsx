import React from "react";
import "./Home.css";

export default function ContactUs() {
    return (
        <>

            {/* ========== HERO SECTION ========== */}
            < section className="hero-section" >
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
                                <button className="btn btn-gradient btn-gradient-lg">Start Free Trial</button>
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
            </section >
        </>
    );
}
