import React, { useEffect, useState } from "react";
import axios from "axios";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Sidebar from "../components/Sidebar";

const Profile = () => {
  const [user, setUser] = useState(null);
  const userId = localStorage.getItem("userId"); // login appudu store ayyi undali

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/user/profile/${userId}`
      );
      setUser(res.data.data);
    } catch (err) {
      console.error("Profile fetch failed", err);
    }
  };

  if (!user) {
    return <div style={styles.loading}>Loading Profile...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.avatar}>
            {user.name.charAt(0).toUpperCase()}
          </div>

          <div>
            <h2 style={styles.name}>{user.name}</h2>
            <p style={styles.email}>{user.email}</p>
          </div>
        </div>


        {/* Body */}
        <div>
          <Row label="Phone" value={user.phone} />
          <Row label="Verified" value={user.isVerified ? "Yes" : "No"} />
          <Row label="Plan" value={user.plan} />
          <Row label="Subscription" value={user.subscriptionStatus} />
          {user.planExpires && (
            <Row
              label="Plan Expiry"
              value={new Date(user.planExpires).toDateString()}
            />
          )}
        </div>

        {/* Button */}
        <button style={styles.button}>Edit Profile</button>
      </div>
    </div>
  );
};

const Row = ({ label, value }) => (
  <div style={styles.row}>
    <span style={styles.label}>{label}</span>
    <strong>{value}</strong>
  </div>
);

/* ================= STYLES ================= */

const styles = {
  container: {
    minHeight: "100vh",
    background: "#f4f6fb",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "Inter, Segoe UI, sans-serif",
  },

  card: {
    width: 420,
    background: "#fff",
    borderRadius: 12,
    padding: 24,
    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
  },

  header: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    marginBottom: 20,
    borderBottom: "1px solid #eee",
    paddingBottom: 16,
  },

  avatar: {
    width: 56,
    height: 56,
    borderRadius: "50%",
    background: "#6366f1",
    color: "#fff",
    fontSize: 22,
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  name: {
    margin: 0,
    fontSize: 18,
    fontWeight: 600,
    color: "#111",
  },

  email: {
    margin: "4px 0 0",
    fontSize: 13,
    color: "#666",
  },

  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 0",
    fontSize: 14,
    borderBottom: "1px solid #f1f1f1",
  },

  label: {
    color: "#666",
  },

  button: {
    width: "100%",
    marginTop: 20,
    padding: "10px 14px",
    borderRadius: 8,
    border: "1px solid #6366f1",
    background: "#6366f1",
    color: "#fff",
    fontSize: 14,
    cursor: "pointer",
  },

  loading: {
    textAlign: "center",
    marginTop: 100,
    fontSize: 16,
    color: "#555",
  },
};

export default Profile;
