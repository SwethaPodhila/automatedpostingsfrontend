import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function Sidebar({ onWidthChange }) {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleEnter = () => {
    setExpanded(true);
    onWidthChange(230);
  };

  const handleLeave = () => {
    setExpanded(false);
    onWidthChange(64);
  };

  const MenuItem = ({ icon, label, path }) => {
    const active = location.pathname === path;

    return (
      <div
        onClick={() => navigate(path)}
        style={{
          ...styles.menuItem,
          ...(active ? styles.activeItem : {}),
        }}
      >
        <i
          className={`bi ${icon}`}
          style={{
            ...styles.icon,
            ...(active ? styles.activeIcon : {}),
          }}
        />
        {expanded && <span style={styles.text}>{label}</span>}
      </div>
    );
  };

  return (
    <div
      style={{
        ...styles.sidebar,
        width: expanded ? "230px" : "64px",
      }}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <MenuItem icon="bi-speedometer2" label="Dashboard" path="/dashboard" />
      <MenuItem icon="bi-calendar-week" label="Posts" path="/weekly-calendar" />
      <MenuItem icon="bi-pencil-square" label="Manual Posting" path="/manualPosting" />
      <MenuItem icon="bi-robot" label="Automation" path="/auto-post" />
      <MenuItem icon="bi-graph-up" label="Analytics" path="/analytics" />
      <MenuItem icon="bi-headset" label="Support" path="/support" />
      <MenuItem icon="bi-person" label="Profile" path="/profile" />
      <MenuItem icon="bi-journal-text" label="Docs" path="/help" />
    </div>
  );
}

/* 🧠 TRUE PREMIUM STYLES */
const styles = {
  sidebar: {
    height: "100vh",
    paddingTop: "70px",
    position: "fixed",
    left: 0,
    top: 0,
    background: "linear-gradient(180deg,#0f172a,#020617)", // ✅ SAME AS YOUR APP
    borderRight: "1px solid rgba(255,255,255,0.06)",
    transition: "0.25s ease",
    overflow: "hidden",
  },

  menuItem: {
    margin: "4px 8px",
    padding: "12px 14px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    gap: "14px",
    cursor: "pointer",
    color: "#cbd5f5",
    fontSize: "14px",
    transition: "0.2s ease",
  },

  icon: {
    fontSize: "18px",
    color: "#94a3b8",
    minWidth: "22px",
  },

  text: {
    fontWeight: "500",
    whiteSpace: "nowrap",
  },

  /* 🔥 Active – subtle & premium */
  activeItem: {
    background: "rgba(124,58,237,0.15)",
  },

  activeIcon: {
    color: "#c4b5fd",
  },
};