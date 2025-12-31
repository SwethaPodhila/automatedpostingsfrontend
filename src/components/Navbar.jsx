import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // 👉 Close dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    // 🔴 clear auth data here
    localStorage.clear();
    navigate("/");
  };

  return (
    <div style={styles.navbar}>
      <h2
        style={{ ...styles.logo, cursor: "pointer" }}
        onClick={() => navigate("/")}
      >
        SyncSocial AI
      </h2>

      <div style={{ position: "relative" }} ref={dropdownRef}>
        <img
          src="https://ui-avatars.com/api/?name=User"
          alt="profile"
          style={{ ...styles.avatar, cursor: "pointer" }}
          onClick={() => setOpen(!open)}
        />

        {open && (
          <div style={styles.dropdown}>
            <div
              style={styles.dropdownItem}
              onClick={() => navigate("/profile")}
            >
              Profile
            </div>
            <div
              style={styles.dropdownItem}
              onClick={() => navigate("/pricing")}
            >
              Upgrade Plan
            </div>

            <div
              style={styles.dropdownItem}
              onClick={handleLogout}
            >
              Logout
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* 🔴 EXISTING CSS UNCHANGED */
const styles = {
  navbar: {
    height: "60px",
    background: "#fff",
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
  logo: {
    margin: 0,
    fontWeight: "600",
    color: "#333",
  },
  menu: {
    display: "flex",
    gap: "20px",
  },
  item: {
    fontSize: "14px",
    cursor: "pointer",
    color: "#333",
  },
  profile: {},
  avatar: {
    width: "35px",
    height: "35px",
    borderRadius: "50%",
  },

  /* 🆕 DROPDOWN STYLES */
  dropdown: {
    position: "absolute",
    right: 0,
    top: "45px",
    background: "#fff",
    border: "1px solid #ddd",
    borderRadius: "6px",
    minWidth: "140px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    overflow: "hidden",
  },
  dropdownItem: {
    padding: "10px 15px",
    cursor: "pointer",
    fontSize: "14px",
    borderBottom: "1px solid #eee",
  },
};
