import React, { useEffect, useState } from "react";
import axios from "axios";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Sidebar from "../components/Sidebar";

import {
  FaFacebook,
  FaInstagram,
  FaTelegramPlane,
  FaPinterestP,
  FaTwitter,
  FaLinkedin,
} from "react-icons/fa";


const BACKEND_URL = "http://localhost:5000";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [connected, setConnected] = useState({
    facebook: null,
    instagram: null,
    telegram: null,
    pinterest: null,
  });

  const [twitterAccount, setTwitterAccount] = useState(null);
  const [linkedinAccount, setLinkedinAccount] = useState(null);

  const userId = localStorage.getItem("userId");
  const [sidebarWidth, setSidebarWidth] = useState(50);

  useEffect(() => {
    if (userId) {
      fetchProfile();
      fetchSocialAccounts();
    }
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/user/profile/${userId}`);
      setUser(res.data.data);
    } catch (err) {
      console.error("Profile fetch failed", err);
    }
  };

  useEffect(() => {
    const fetchTwitter = async () => {
      if (!userId) return;

      try {
        const res = await fetch(`${BACKEND_URL}/api/twitter/check?userId=${userId}`);
        const data = await res.json();
        if (data.success && data.connected) setTwitterAccount(data.account);
      } catch (err) {
        console.error("Twitter fetch error:", err);
      }
    };

    fetchTwitter();
  }, [userId]);
  useEffect(() => {
    const fetchLinkedIn = async () => {
      if (!userId) return;

      try {
        const res = await fetch(`${BACKEND_URL}/api/linkedin/check?userId=${userId}`);
        const data = await res.json();
        if (data.success && data.connected) {
          setLinkedinAccount(data.account);
          localStorage.setItem('linkedin_account', JSON.stringify(data.account));
        } else {
          const savedAccount = localStorage.getItem('linkedin_account');
          if (savedAccount) setLinkedinAccount(JSON.parse(savedAccount));
        }
      } catch (err) {
        console.error("LinkedIn fetch error:", err);
        const savedAccount = localStorage.getItem('linkedin_account');
        if (savedAccount) setLinkedinAccount(JSON.parse(savedAccount));
      }
    };

    fetchLinkedIn();
  }, [userId]);


  const fetchSocialAccounts = () => {
    fetch(`${BACKEND_URL}/social/${userId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
         // console.log("SOCIAL ACCOUNTS 👉", data.accounts);

          const fb = data.accounts.filter(a =>
            a.platform?.includes("facebook")
          );

          const ig = data.accounts.find(a =>
            a.platform?.includes("instagram")
          );

          const tg = data.accounts.find(a =>
            a.platform?.includes("telegram")
          );

          const pin = data.accounts.find(a =>
            a.platform?.includes("pinterest")
          );

          setConnected({
            facebook: fb.length ? fb : null, // multiple FB accounts
            instagram: ig || null,
            telegram: tg || null,
            pinterest: pin || null,
          });
        }
      })
      .catch(err => console.error(err));
  };

  if (!user) {
    return <div style={styles.loading}>Loading Profile...</div>;
  }

  return (
    <>
      <Navbar />
      <Sidebar onWidthChange={setSidebarWidth} />

      <main
        style={{
          ...styles.content,
          marginLeft: sidebarWidth,
          marginTop: 60,
        }}
      >
        <div style={styles.container}>
          <div style={styles.card}>

            {/* ===== BANNER ===== */}
            <div style={styles.banner}>
              <div style={styles.header}>
                <div style={styles.avatar}>
                  {user.name.charAt(0).toUpperCase()}
                </div>

                <div>
                  <h2 style={styles.name}>{user.name}</h2>
                  <p style={styles.email}>{user.email}</p>
                </div>
              </div>
            </div>

            {/* ===== DETAILS ===== */}
            <div>
              <Row label="Phone" value={user.phone || "-"} />
              <Row label="Verified" value={user.isVerified ? "Yes" : "No"} />
              <Row label="Plan" value={user.plan || "-"} />
              <Row label="Subscription" value={user.subscriptionStatus || "-"} />
              {user.planExpires && (
                <Row
                  label="Plan Expiry"
                  value={new Date(user.planExpires).toDateString()}
                />
              )}
            </div>

            {/* ===== SOCIAL MEDIA ===== */}
            <div style={styles.socialWrap}>
              <h3 style={styles.socialTitle}>Social Media Accounts</h3>

              <div style={styles.socialRow}>
                <SocialIcon
                  name="Facebook"
                  icon={<FaFacebook />}
                  platform="facebook"
                  data={connected.facebook}
                />

                <SocialIcon
                  name="Instagram"
                  icon={<FaInstagram />}
                  platform="instagram"
                  data={connected.instagram}
                />
                <SocialIcon
                  name="Telegram"
                  icon={<FaTelegramPlane />}
                  platform="telegram"
                  data={connected.telegram}
                />
                <SocialIcon
                  name="Pinterest"
                  icon={<FaPinterestP />}
                  platform="pinterest"
                  data={connected.pinterest}
                />
                <SocialIcon
                  name="Twitter"
                  icon={<FaTwitter />}
                  platform="twitter"
                  data={twitterAccount}
                />

                <SocialIcon
                  name="LinkedIn"
                  icon={<FaLinkedin />}
                  platform="linkedin"
                  data={linkedinAccount}
                />

              </div>
            </div>

          </div>
        </div>

        <Footer />
      </main>
    </>
  );
};

/* ===== ROW ===== */
const Row = ({ label, value }) => (
  <div style={styles.row}>
    <span style={styles.label}>{label}</span>
    <strong>{value}</strong>
  </div>
);

const SocialIcon = ({ name, icon, data }) => {

  // Helper to get display name
  const getDisplayName = (acc) => {
    if (!acc) return "Not Connected";
    return (
      acc.meta?.username ||
      acc.meta?.name ||
      acc.meta?.channelName ||
      acc.handle ||
      acc.username ||
      (acc.firstName && acc.lastName ? `${acc.firstName} ${acc.lastName}` : null) ||
      acc.providerId ||
      "Connected"
    );
  };

  // Handle click for disabled accounts
  const handleClick = () => {
    if (!data) {
      const confirmConnect = window.confirm(
        `Do you want to connect your ${name} account? Go to dashboard to connect it.`
      );
      if (confirmConnect) {
        window.location.href = "/dashboard"; // redirect to dashboard
      }
    }
  };

  // Multiple accounts support
  const accounts = Array.isArray(data) ? data : [data];

  return (
    <>
      {accounts.map((acc, idx) => (
        <div
          key={idx}
          style={{ ...styles.socialCard, cursor: !data ? "pointer" : "default", opacity: !data ? 0.4 : 1 }}
          onClick={handleClick}
        >
          <span style={data ? styles.socialIconActive : styles.socialIcon}>{icon}</span>

          <div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{name}</div>
            <div style={{ fontSize: 12, color: "#555" }}>
              {data ? getDisplayName(acc) : "Not Connected"}
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

/* ===== STYLES ===== */
const styles = {
  content: {
    transition: "0.3s ease",
    padding: "20px 32px",
    background: "#f4f6fb",
    minHeight: "100vh",
  },

  container: {
    display: "flex",
    justifyContent: "center",
  },

  card: {
    width: 900,
    background: "#fff",
    borderRadius: 14,
    padding: 24,
    boxShadow: "0 10px 28px rgba(0,0,0,0.08)",
  },

  banner: {
    background: "linear-gradient(135deg, #6366f1, #4f46e5)",
    padding: 26,
    borderRadius: 12,
    marginBottom: 24,
    color: "#fff",
  },

  header: {
    display: "flex",
    alignItems: "center",
    gap: 18,
  },

  avatar: {
    width: 84,
    height: 84,
    borderRadius: "50%",
    background: "#fff",
    color: "#4f46e5",
    fontSize: 30,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  name: {
    margin: 0,
    fontSize: 20,
    fontWeight: 600,
  },

  email: {
    marginTop: 4,
    fontSize: 13,
    opacity: 0.9,
  },

  row: {
    display: "flex",
    justifyContent: "space-between",
    padding: "12px 0",
    fontSize: 14,
    borderBottom: "1px solid #eee",
  },

  label: {
    color: "#666",
  },

  socialWrap: {
    marginTop: 32,
  },

  socialTitle: {
    fontSize: 15,
    fontWeight: 600,
    marginBottom: 12,
  },

  socialRow: {
    display: "flex",
    gap: 14,
    flexWrap: "wrap",
  },

  socialCard: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "12px 16px",
    borderRadius: 12,
    background: "#f4f6fb",
    textDecoration: "none",
    color: "#111",
    fontSize: 14,
    fontWeight: 500,
  },

  socialIcon: {
    fontSize: 18,
    color: "#999",
  },

  socialIconActive: {
    fontSize: 18,
    color: "#4f46e5",
  },

  loading: {
    textAlign: "center",
    marginTop: 100,
    fontSize: 16,
    color: "#555",
  },
};

export default Profile; 
