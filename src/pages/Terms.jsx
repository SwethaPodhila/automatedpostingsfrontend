import React from "react";
import AIWingsLogo from "../components/AIWingsLogo.png";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";

export default function TermsAndConditions({
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
        .terms-wrapper {
          width: 100%;
          background: #ffffff;
          color: #374151;
        }

        /* HEADER */
        .terms-header {
          padding: 80px 20px 60px;
          background: linear-gradient(135deg, #7c3aed, #ec4899);
          color: #fff;
          text-align: center;
        }

        .terms-header h1 {
          font-size: 3rem;
          font-weight: 800;
          margin-bottom: 10px;
        }

        .terms-header p {
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
        .terms-content {
          max-width: 1100px;
          margin: auto;
          padding: 0px 20px 80px;
          line-height: 1.9;
        }

        .terms-content .lead {
          font-size: 1.15rem;
          margin-bottom: 30px;
          color: #111827;
        }

        .terms-content h5 {
          margin-top: 40px;
          margin-bottom: 10px;
          font-size: 1.2rem;
          font-weight: 700;
          color: #111827;
        }

        .terms-content ul {
          padding-left: 20px;
        }

        .terms-content li {
          margin-bottom: 10px;
        }

        .terms-content a {
          color: #7c3aed;
          font-weight: 600;
          text-decoration: none;
        }

        .terms-content a:hover {
          text-decoration: underline;
        }

        /* FOOTER */
        .terms-footer {
          padding: 25px;
          background: #f9fafb;
          text-align: center;
          font-size: 0.9rem;
          color: #6b7280;
        }

        @media (max-width: 768px) {
          .terms-header h1 {
            font-size: 2.2rem;
          }
        }
      `}</style>

      <div className="terms-wrapper">
        {/* HEADER */}
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

        <header className="terms-header">
          <h1>Terms & Conditions</h1>
          <p>Last Updated: {formatDate(lastUpdated)}</p>
        </header>

        {/* CONTENT */}
        <main className="terms-content">
          <button className="back-btn" onClick={() => window.history.back()}>
            ← Back
          </button>

          <p className="lead">
            These Terms & Conditions govern your access to and use of{" "}
            <strong>{companyName}</strong>. By using our platform, you agree to
            comply with these terms.
          </p>

          <h5>1. Acceptance of Terms</h5>
          <p>
            By accessing or using our services, you confirm that you have read,
            understood, and agreed to these Terms.
          </p>

          <h5>2. Eligibility</h5>
          <p>
            You must be at least 13 years old to use our services. By registering,
            you confirm that the information provided is accurate.
          </p>

          <h5>3. Account Registration</h5>
          <ul>
            <li>You are responsible for maintaining account security</li>
            <li>You must not share login credentials</li>
            <li>You are responsible for all activity under your account</li>
          </ul>

          <h5>4. Platform Usage</h5>
          <p>
            You agree to use the platform only for lawful purposes and in
            compliance with social media platform policies.
          </p>

          <h5>5. AI-Generated Content</h5>
          <p>
            AI-generated captions, hashtags, and suggestions are provided “as
            is”. We do not guarantee accuracy or platform acceptance.
          </p>

          <h5>6. Prohibited Activities</h5>
          <ul>
            <li>Violation of any applicable laws</li>
            <li>Abuse, spamming, or malicious activity</li>
            <li>Unauthorized access or scraping</li>
            <li>Misuse of APIs or automation tools</li>
          </ul>

          <h5>7. Subscription & Payments</h5>
          <p>
            Paid plans are billed as described at purchase. Fees are non-refundable
            unless required by law.
          </p>

          <h5>8. Account Suspension & Termination</h5>
          <p>
            We reserve the right to suspend or terminate accounts that violate
            these Terms without prior notice.
          </p>

          <h5>9. Intellectual Property</h5>
          <p>
            All platform content, branding, and software belong to{" "}
            <strong>{companyName}</strong> and may not be copied or reused.
          </p>

          <h5>10. Third-Party Services</h5>
          <p>
            We are not responsible for downtime, changes, or restrictions imposed
            by third-party platforms such as social media APIs.
          </p>

          <h5>11. Limitation of Liability</h5>
          <p>
            We are not liable for any indirect, incidental, or consequential
            damages arising from use of the platform.
          </p>

          <h5>12. Disclaimer</h5>
          <p>
            The service is provided on an “as-is” basis without warranties of any
            kind, express or implied.
          </p>

          <h5>13. Changes to Terms</h5>
          <p>
            We may update these Terms at any time. Continued use of the service
            indicates acceptance of updated terms.
          </p>

          <h5>14. Governing Law</h5>
          <p>
            These Terms shall be governed and interpreted according to applicable
            laws.
          </p>

          <h5>15. Contact Information</h5>
          <p>
            For questions about these Terms, contact us at{" "}
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
