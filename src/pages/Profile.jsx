import React, { useEffect, useState } from "react";
import axios from "axios";

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
          <h2 style={styles.name}>{user.name}</h2>
          <p style={styles.email}>{user.email}</p>
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
    background: "linear-gradient(135deg, #667eea, #764ba2)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "Segoe UI, sans-serif",
  },
  card: {
    width: "380px",
    background: "#fff",
    borderRadius: "16px",
    padding: "25px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
  },
  header: {
    textAlign: "center",
    marginBottom: "20px",
  },
  avatar: {
    width: "70px",
    height: "70px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #667eea, #764ba2)",
    color: "#fff",
    fontSize: "28px",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 10px",
  },
  name: {
    margin: "5px 0",
    color: "#333",
  },
  email: {
    fontSize: "14px",
    color: "#777",
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px 0",
    borderBottom: "1px solid #eee",
    fontSize: "14px",
  },
  label: {
    color: "#555",
  },
  button: {
    width: "100%",
    marginTop: "20px",
    padding: "12px",
    border: "none",
    borderRadius: "10px",
    background: "linear-gradient(135deg, #667eea, #764ba2)",
    color: "#fff",
    fontSize: "15px",
    cursor: "pointer",
  },
  loading: {
    textAlign: "center",
    marginTop: "100px",
    fontSize: "18px",
  },
};

export default Profile;
