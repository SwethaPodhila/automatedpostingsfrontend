import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function Sidebar({ onWidthChange }) {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  const handleEnter = () => {
    setExpanded(true);
    onWidthChange(220);
  };

  const handleLeave = () => {
    setExpanded(false);
    onWidthChange(50);
  };

  return (
    <div
      style={{
        ...styles.sidebar,
        width: expanded ? "220px" : "50px",
      }}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <div style={styles.menuItem} onClick={() => navigate("/dashboard")}>
        <i className="bi bi-speedometer2"></i>
        {expanded && <span style={styles.text}>Dashboard</span>}
      </div>

      <div style={styles.menuItem} onClick={() => navigate("/weekly-calendar")}>
        <i className="bi bi-pencil-square"></i>
        {expanded && <span style={styles.text}>Posts</span>}
      </div>

      <div style={styles.menuItem} onClick={() => navigate("/manualPosting")}>
        <i className="bi bi-pencil-square"></i>
        {expanded && <span style={styles.text}>Manual Posting</span>}
      </div>

      <div style={styles.menuItem} onClick={() => navigate("/auto-post")}>
        <i className="bi bi-robot"></i>
        {expanded && <span style={styles.text}>Automation</span>}
      </div>

      <div style={styles.menuItem} onClick={() => navigate("/analytics")}>
        <i className="bi bi-graph-up"></i>
        {expanded && <span style={styles.text}>Analytics</span>}
      </div>

      {/* 🆕 SUPPORT */}
      <div style={styles.menuItem} onClick={() => navigate("/support")}>
        <i className="bi bi-headset"></i>
        {expanded && <span style={styles.text}>Support</span>}
      </div>

      <div style={styles.menuItem} onClick={() => navigate("/settings")}>
        <i className="bi bi-gear"></i>
        {expanded && <span style={styles.text}>Settings</span>}
      </div>

      <div style={styles.menuItem} onClick={() => navigate("/help")}>
        <i className="bi bi-question-circle"></i>
        {expanded && <span style={styles.text}>Docs</span>}
      </div>
    </div>
  );
}

const styles = {
  sidebar: {
    background: "#f8f9fa",
    height: "100vh",
    paddingTop: "60px",
    position: "fixed",
    left: 0,
    top: 0,
    borderRight: "1px solid #ddd",
    overflow: "hidden",
    transition: "0.3s ease-in-out",
    whiteSpace: "nowrap",
  },

  menuItem: {
    padding: "15px 15px",
    cursor: "pointer",
    fontSize: "16px",
    color: "#333",
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },

  text: {
    transition: "0.3s",
  },
};
