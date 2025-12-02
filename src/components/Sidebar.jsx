import React, { useState } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function Sidebar({ onWidthChange }) {
  const [expanded, setExpanded] = useState(false);

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
      <div style={styles.menuItem}>
        <i className="bi bi-speedometer2"></i>
        {expanded && <span style={styles.text}>Dashboard</span>}
      </div>

      <div style={styles.menuItem}>
        <i className="bi bi-link-45deg"></i>
        {expanded && <span style={styles.text}>Connections</span>}
      </div>

      <div style={styles.menuItem}>
        <i className="bi bi-pencil-square"></i>
        {expanded && <span style={styles.text}>Manual Posting</span>}
      </div>

      <div style={styles.menuItem}>
        <i className="bi bi-robot"></i>
        {expanded && <span style={styles.text}>Automation</span>}
      </div>

      <div style={styles.menuItem}>
        <i className="bi bi-calendar-event"></i>
        {expanded && <span style={styles.text}>Calendar</span>}
      </div>

      <div style={styles.menuItem}>
        <i className="bi bi-graph-up"></i>
        {expanded && <span style={styles.text}>Analytics</span>}
      </div>

      <div style={styles.menuItem}>
        <i className="bi bi-gear"></i>
        {expanded && <span style={styles.text}>Settings</span>}
      </div>

      <div style={styles.menuItem}>
        <i className="bi bi-question-circle"></i>
        {expanded && <span style={styles.text}>Help</span>}
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
