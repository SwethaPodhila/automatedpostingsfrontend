import React from "react";
import AIWingsLogo from "../components/AIWingsLogo.png";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";

export default function PrivacyPolicy({
  companyName = "AiWingsGlobal",
  contactEmail = "support@aiwingsglobal.com",
  lastUpdated,
}) {
  const formatDate = (d) => {
    const date = d ? new Date(d) : new Date();
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const handleNavClick = (sectionId) => {
    if (location.pathname === "/") {
      // same page scroll
      document
        .getElementById(sectionId)
        ?.scrollIntoView({ behavior: "smooth" });
    } else {
      // other page → go home → scroll
      navigate("/", { state: { scrollTo: sectionId } });
    }

    setMenuOpen(false); // mobile menu close (optional)
  };

  return (
    <>
      <style>{`
        .privacy-wrapper {
          width: 100%;
          background: #ffffff;
          color: #374151;
        }

        /* HEADER */
        .privacy-header {
          padding: 80px 20px 60px;
          background: linear-gradient(135deg, #7c3aed, #ec4899);
          color: #fff;
          text-align: center;
        }

        .privacy-header h1 {
          font-size: 3rem;
          font-weight: 800;
          margin-bottom: 10px;
        }

        .privacy-header p {
          opacity: 0.9;
          font-size: 1rem;
        }

        /* BACK BUTTON */
        .back-btn {
          margin: 30px 0;
          background: none;
          border: 2px solid #7c3aed;
          color: #7c3aed;
          padding: 10px 22px;
          border-radius: 999px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .back-btn:hover {
          background: #7c3aed;
          color: #fff;
        }

        /* CONTENT */
        .privacy-content {
          max-width: 1100px;
          margin: auto;
          padding: 0px 20px 80px;
          line-height: 1.9;
        }

        .privacy-content .lead {
          font-size: 1.15rem;
          margin-bottom: 30px;
          color: #111827;
        }

        .privacy-content h5 {
          margin-top: 40px;
          margin-bottom: 10px;
          font-size: 1.2rem;
          font-weight: 700;
          color: #111827;
        }

        .privacy-content ul {
          padding-left: 20px;
        }

        .privacy-content li {
          margin-bottom: 10px;
        }

        .privacy-content a {
          color: #7c3aed;
          font-weight: 600;
          text-decoration: none;
        }

        .privacy-content a:hover {
          text-decoration: underline;
        }

        /* FOOTER */
        .privacy-footer {
          padding: 25px;
          background: #f9fafb;
          text-align: center;
          font-size: 0.9rem;
          color: #6b7280;
        }

        @media (max-width: 768px) {
          .privacy-header h1 {
            font-size: 2.2rem;
          }
        }
      `}</style>

      <div className="privacy-wrapper">
        {/* ========== HEADER ========== */}
        <nav className="navbar navbar-expand-lg navbar-custom sticky-top">
          <div className="container">
            <a className="navbar-brand navbar-brand-custom d-flex align-items-center" href="/">
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
                  <a
                    className="nav-link nav-link-custom"
                    onClick={() => handleNavClick("features")}
                  >
                    Features
                  </a>
                </li>

                <li className="nav-item">
                  <a
                    className="nav-link nav-link-custom"
                    onClick={() => handleNavClick("pricing")}
                  >
                    Pricing
                  </a>
                </li>

                <li className="nav-item">
                  <a
                    className="nav-link nav-link-custom"
                    onClick={() => handleNavClick("ai")}
                  >
                    AI
                  </a>
                </li>

                <li className="nav-item">
                  <a
                    className="nav-link nav-link-custom"
                    onClick={() => handleNavClick("about")}
                  >
                    About
                  </a>
                </li>

                <li className="nav-item">
                  <a
                    className="nav-link nav-link-custom"
                    onClick={() => handleNavClick("contact")}
                  >
                    Contact
                  </a>
                </li>
              </ul>
              <div className="d-flex gap-2">
                <button
                  className="loginBtn btn btn-link text-decoration-none nav-link-custom"
                  onClick={() => navigate("/login")}
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

        {/* HEADER */}
        <header className="privacy-header">
          <h1>Privacy Policy</h1>
          <p>Last Updated: {formatDate(lastUpdated)}</p>
        </header>

        {/* CONTENT */}
        <main className="privacy-content">
          <button className="back-btn" onClick={() => window.history.back()}>
            ← Back
          </button>

          <p className="lead">
            This Privacy Policy describes how <strong>{companyName}</strong>
            collects, uses, stores, and protects your information when you use
            our AI-powered social media automation platform.
          </p>

          <h5>1. Information We Collect</h5>
          <ul>
            <li>Personal details such as name and email address</li>
            <li>Encrypted authentication credentials</li>
            <li>Connected social media account information</li>
            <li>Scheduled posts, captions, media, and analytics</li>
            <li>Technical data like IP address, device, and cookies</li>
          </ul>

          <h5>2. How We Use Your Information</h5>
          <p>
            We use your data to deliver automation services, generate AI
            content, schedule posts, analyze engagement, improve performance,
            and ensure platform security.
          </p>

          <h5>3. Social Media Platform Permissions</h5>
          <ul>
            <li>Facebook & Instagram (Meta)</li>
            <li>Twitter / X</li>
            <li>LinkedIn</li>
            <li>YouTube</li>
          </ul>

          <h5>4. Data Storage & Security</h5>
          <ul>
            <li>Encrypted passwords and access tokens</li>
            <li>Secure cloud infrastructure</li>
            <li>HTTPS, firewalls, and restricted access</li>
          </ul>

          <h5>5. Data Retention</h5>
          <p>
            We retain your data only as long as your account remains active or
            as required for legal, security, or operational purposes.
          </p>

          <h5>6. Cookies & Tracking</h5>
          <p>
            Cookies are used for authentication, analytics, and performance.
            Disabling cookies may limit some features.
          </p>

          <h5>7. Data Sharing</h5>
          <p>
            We do <strong>not</strong> sell your personal information. Data is
            shared only with trusted services required to operate the platform.
          </p>

          <h5>8. International Data Transfers</h5>
          <p>
            Your data may be processed on servers located outside your country,
            following strict security and compliance standards.
          </p>

          <h5>9. Your Rights</h5>
          <ul>
            <li>Access, update, or delete your data</li>
            <li>Disconnect social media accounts</li>
            <li>Download your data</li>
            <li>Request account deletion</li>
          </ul>

          <h5>10. Account Termination</h5>
          <p>
            Upon account deletion, your data will be permanently removed unless
            retention is required by law.
          </p>

          <h5>11. Children’s Privacy</h5>
          <p>
            Our services are not intended for children under 13 years of age.
          </p>

          <h5>12. Legal Compliance</h5>
          <p>
            We comply with applicable data protection and privacy regulations.
          </p>

          <h5>13. Policy Updates</h5>
          <p>
            We may update this policy from time to time. Changes will be posted
            on this page.
          </p>

          <h5>14. Contact Us</h5>
          <p>
            For any questions, reach us at{" "}
            <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.
          </p>
        </main>

        {/* ========== FOOTER ========== */}
        <footer className="footer-section">
          <div className="container">
            <div className="row align-items-center gy-4">

              {/* BRAND */}
              <div className="col-lg-6">
                <div className="footer-brand">
                  <div className="logo-icon"><img src={AIWingsLogo} alt="AIWings Logo" className="logo-icon-img" /></div>
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
                  <a
                    className=""
                    onClick={() => handleNavClick("features")}
                  >
                    Features
                  </a>
                  <a
                    className=""
                    onClick={() => handleNavClick("pricing")}
                  >
                    Pricing
                  </a>
                  <a
                    className=""
                    onClick={() => handleNavClick("contact")}
                  >
                    Contact
                  </a>
                  <a href="" onClick={() => navigate("/privacy-policy")}>Privacy Policy</a>
                  <a href="" onClick={() => navigate("/terms")}>Terms</a>
                </div>

                <div className="footer-social">
                  <a href="/facebook" className="footer-social-link" aria-label="Facebook">
                    <i className="bi bi-facebook"></i>
                  </a>
                  <a href="/twitter" className="footer-social-link" aria-label="Twitter">
                    <i className="bi bi-twitter-x"></i>
                  </a>
                  <a href="/instagram" className="footer-social-link" aria-label="Instagram">
                    <i className="bi bi-instagram"></i>
                  </a>
                  <a href="/linkedin" className="footer-social-link" aria-label="LinkedIn">
                    <i className="bi bi-linkedin"></i>
                  </a>
                  <a href="/youtube" className="footer-social-link" aria-label="Youtube">
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
    </>
  );
}
