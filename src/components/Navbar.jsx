import React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "./AIWingsLogo.png"; // 🔹 make sure to have your logo in this path
import axios from "axios";

export default function Navbar() {
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);

  useEffect(() => {
    console.log("Subscription:", subscription);
    console.log("Days Remaining:", getDaysRemaining());
  }, [subscription]);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const userId = localStorage.getItem("userId");
        console.log("Fetching subscription for userId:", userId);
        if (!userId) return;

        const res = await axios.get(
          `https://automatedpostingbackend-h9dc.onrender.com/user/subscription/${userId}`
        );

        setSubscription(res.data.data);
        console.log("Fetched subscription:", res.data.data);
      } catch (err) {
        console.error("Failed to fetch subscription", err);
      } finally {
        setSubscriptionLoading(false);
      }
    };

    fetchSubscription();
  }, []);

  const getDaysRemaining = () => {
    if (!subscription?.planExpires) return null;

    const today = new Date();
    const expiry = new Date(subscription.planExpires);

    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  const renderExpiryWarning = () => {
    const daysRemaining = getDaysRemaining();

    if (
      daysRemaining === null ||
      daysRemaining > 7 ||
      daysRemaining <= 0
    ) {
      return null;
    }

    return (
      <div style={styles.expiryWarning}>
        ⏳ Your <b>{subscription.plan}</b> plan will expire in{" "}
        <b>{daysRemaining} day{daysRemaining !== 1 ? "s" : ""}</b>.{" "}
        <span
          style={styles.renewLink}
          onClick={() => navigate("/pricing")}
        >
          Renew now
        </span>
      </div>
    );
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <>
      <div style={styles.navbar}>
        {/* Logo Section */}
        <div style={styles.logoWrapper} onClick={() => navigate("/")}>
          <img src={logo} alt="logo" style={styles.logoImg} />
          <h2 style={styles.logoText}>AiWingsGlobal</h2>
        </div>
        {renderExpiryWarning()}
        <div style={styles.rightSection}>
          <button
            style={styles.upgradeBtn}
            onClick={() => navigate("/pricing")}
          >
            Upgrade
          </button>

          <button
            style={styles.logoutBtn}
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>
    </>
  );
}

/* 🔴 EXISTING CSS MOSTLY UNCHANGED */
const styles = {
  expiryWarning: {
    backgroundColor: "#fff3cd",
    color: "#856404",
    padding: "8px",
    textAlign: "center",
    fontSize: "14px",
  },

  renewLink: {
    color: "#d39e00",
    fontWeight: "bold",
    cursor: "pointer",
    marginLeft: "5px",
  },
  navbar: {
    height: "60px",
    background: "#fff", // unchanged
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 20px",
    borderBottom: "1px solid #ddd",
    position: "fixed",
    top: 0,
    width: "100%",
    zIndex: 999,
  },

  /* 🆕 Logo Wrapper */
  logoWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "3px",
    cursor: "pointer",
  },

  logoImg: {
    width: "52px",
    height: "52px",
    objectFit: "contain",
  },

  /* 🆕 Gradient text for h2 */
  logoText: {
    margin: 0,
    fontWeight: "700",
    fontSize: "22px",
    background: "linear-gradient(135deg,#7c3aed,#ec4899)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },

  rightSection: {
    display: "flex",
    gap: "10px",
  },

  /* Buttons (already correct) */
  upgradeBtn: {
    padding: "8px 16px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    background: "linear-gradient(135deg,#7c3aed,#ec4899)",
    color: "#fff",
  },

  logoutBtn: {
    padding: "8px 16px",
    borderRadius: "6px",
    border: "1px solid #ec4899",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    background: "#fff",
    color: "#ec4899",
  },
};
