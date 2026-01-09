import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "./AiWings.jfif"; // 🔹 make sure to have your logo in this path

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div style={styles.navbar}>
      {/* Logo Section */}
      <div style={styles.logoWrapper} onClick={() => navigate("/")}>
        <img
          src={logo}   // 🔹 replace with your logo path
          alt="logo"
          style={styles.logoImg}
        />
        <h2 style={styles.logoText}>AiWingsGlobal</h2>
      </div>

      {/* Right Buttons */}
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
  );
}

/* 🔴 EXISTING CSS MOSTLY UNCHANGED */
const styles = {
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
