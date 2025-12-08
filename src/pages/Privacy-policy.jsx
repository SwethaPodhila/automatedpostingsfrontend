// PrivacyPolicy.jsx
import React from "react";

/**
 * PrivacyPolicy component
 * Props:
 * - companyName (string) default: "Your App Name"
 * - contactEmail (string) default: "support@yourapp.com"
 * - lastUpdated (string | Date) optional - if not provided uses today
 *
 * Usage:
 * 1. Ensure Bootstrap CSS is loaded (see instructions below)
 * 2. import PrivacyPolicy from './PrivacyPolicy';
 * 3. <PrivacyPolicy companyName="MyApp" contactEmail="hello@myapp.com" />
 */

export default function PrivacyPolicy({
  companyName = "Your App Name",
  contactEmail = "support@yourapp.com",
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

  return (
    <div className="container py-5">
      <div className="card shadow-sm border-0">
        <div className="card-body p-4">
          <h1 className="card-title text-center mb-3">Privacy Policy</h1>
          <p className="text-center text-muted mb-4">
            Last Updated: <strong>{formatDate(lastUpdated)}</strong>
          </p>

          <p>
            This Privacy Policy explains how we collect, use, store, and protect
            the information of users who access and use our <strong>{companyName}</strong>{" "}
            Social Media Management Platform (manual posting, AI automation,
            analytics, and multi-platform integrations). By using our services,
            you agree to the practices described in this policy.
          </p>

          <h5 className="mt-4">1. Information We Collect</h5>
          <ul>
            <li>
              <strong>Personal Information:</strong> Full name, email, encrypted
              password, profile details.
            </li>
            <li>
              <strong>Social Media Info:</strong> Connected pages/accounts,
              page/channel IDs, access tokens (securely stored), permissions.
            </li>
            <li>
              <strong>Posting Data:</strong> Scheduled posts, automation
              workflows, uploaded media, AI-generated captions, publish status.
            </li>
            <li>
              <strong>Analytics Data:</strong> Impressions, reach, likes,
              comments, shares, engagement metrics (as provided by platform
              APIs).
            </li>
            <li>
              <strong>Technical Info:</strong> IP address, device & browser
              info, cookies for session handling.
            </li>
          </ul>

          <h5 className="mt-4">2. How We Use Your Information</h5>
          <p>
            We use your information to provide manual & automated posting,
            connect to social platforms, generate AI captions, show analytics,
            store media in cloud storage, maintain security, and improve your
            experience. We do not post on your behalf without proper action or
            explicit automation settings by you.
          </p>

          <h5 className="mt-4">3. Social Media API Permissions</h5>
          <p>We request only necessary permissions for posting and analytics:</p>
          <ul>
            <li>
              <strong>Meta (Facebook & Instagram):</strong> publish posts, read
              insights, manage pages (as permitted).
            </li>
            <li>
              <strong>Twitter/X:</strong> tweet posting & read engagement
              metrics.
            </li>
            <li>
              <strong>LinkedIn:</strong> post updates & read analytics.
            </li>
            <li>
              <strong>YouTube:</strong> upload videos & read channel analytics.
            </li>
          </ul>

          <h5 className="mt-4">4. Data Storage & Security</h5>
          <ul>
            <li>Passwords are encrypted; tokens are stored securely.</li>
            <li>Media files are stored in secure cloud storage (e.g., AWS S3).</li>
            <li>All network communication uses HTTPS/SSL.</li>
            <li>Access to data is restricted and logged for security.</li>
          </ul>

          <h5 className="mt-4">5. Third-Party Services</h5>
          <p>
            We integrate with third-party services to provide features:
            Meta, Twitter/X API, LinkedIn API, YouTube Data API, ChatGPT API
            (for AI content), and n8n (automation). These services may process
            data per their policies.
          </p>

          <h5 className="mt-4">6. Cookies</h5>
          <p>
            We use cookies for authentication, session management, and to
            improve user experience. You can change cookie settings in your
            browser, but some features may require cookies to work.
          </p>

          <h5 className="mt-4">7. Data Sharing</h5>
          <p>
            We do <strong>not</strong> sell or rent personal data. Data is only
            shared with the social platforms and tools required to deliver the
            service (posting, analytics, automation, AI services).
          </p>

          <h5 className="mt-4">8. Your Rights</h5>
          <ul>
            <li>Request deletion of your account and personal data.</li>
            <li>Disconnect any connected social account at any time.</li>
            <li>Download your posting history and analytics data.</li>
            <li>Update or correct your personal information.</li>
          </ul>
          <p>
            To exercise any of these rights, contact us at{" "}
            <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.
          </p>

          <h5 className="mt-4">9. Children's Privacy</h5>
          <p>
            Our service is not intended for children under 13. We do not
            knowingly collect information from children.
          </p>

          <h5 className="mt-4">10. Changes to This Policy</h5>
          <p>
            We may update this policy occasionally. We will post updates on
            this page and update the “Last Updated” date. Major changes will be
            communicated to active users.
          </p>

          <h5 className="mt-4">11. Contact</h5>
          <p>
            If you have questions about this Privacy Policy, contact us at{" "}
            <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.
          </p>

          <p className="text-center text-muted mt-4 mb-0">
            © {new Date().getFullYear()} {companyName}. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
