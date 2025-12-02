import React from "react";

export default function Navbar() {
  return (
    <div style={styles.navbar}>
      <h2 style={styles.logo}>SyncSocial AI</h2>

      <div style={styles.menu}>
        <span style={styles.item}>Dashboard</span>
        <span style={styles.item}>Posts</span>
        <span style={styles.item}>Automation</span>
        <span style={styles.item}>Analytics</span>
        <span style={styles.item}>Help</span>
      </div>

      <div style={styles.profile}>
        <img
          src="https://ui-avatars.com/api/?name=User"
          alt="profile"
          style={styles.avatar}
        />
      </div>
    </div>
  );
}

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
};
