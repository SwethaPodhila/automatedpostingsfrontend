import React, { useEffect, useState } from "react";

const BACKEND_URL = "https://automatedpostingbackend.onrender.com";

const YouTubeCard = ({ connect }) => {
  const [connected, setConnected] = useState(false);
  const [channelName, setChannelName] = useState("");
  const [subscribers, setSubscribers] = useState(0);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const checkStatus = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${BACKEND_URL}/api/youtube/check`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();

        if (data.success && data.connected) {
          setConnected(true);
          setChannelName(data.channelName || "YouTube Channel");
          setSubscribers(data.subscribers || 0);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, [token]);

  const disconnect = async () => {
    if (!window.confirm("Disconnect YouTube account?")) return;

    await fetch(`${BACKEND_URL}/api/youtube/disconnect`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    });

    setConnected(false);
    setChannelName("");
    setSubscribers(0);
  };

  if (loading) return null;

  return (
    <div style={styles.card}>
       {/* 👇 Paragraph ONLY before connection */}
    {!connected && (
      <p style={styles.helperText}>
        Connect your YouTube channel to upload videos, manage content, and schedule posts directly from your dashboard.
      </p>
    )}
      {connected ? (
        <>
          <div style={styles.profileRow}>
            <div style={styles.avatar}>📺</div>
            <div>
              <div style={styles.name}>{channelName}</div>
              <div style={styles.subs}>
                {subscribers.toLocaleString()} subscribers
              </div>
            </div>
          </div>

          <div style={styles.actions}>
            <button
              style={styles.manage}
              onClick={() => (window.location.href = "/youtube-manager")}
            >
              Manage
            </button>
            <button style={styles.disconnect} onClick={disconnect}>
              Disconnect
            </button>
          </div>
        </>
      ) : (
        <button style={styles.connect} onClick={connect}>
          Connect YouTube
        </button>
      )}
    </div>
  );
};

const styles = {

  profileRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "15px"
  },
  avatar: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    background: "#ff0000",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "22px"
  },
  name: {
    fontWeight: "600"
  },
  subs: {
    fontSize: "12px",
    color: "#6b7280"
  },
  actions: {
    display: "flex",
    gap: "10px"
  },
  manage: {
    flex: 1,
    padding: "10px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer"
  },
  disconnect: {
    flex: 1,
    padding: "10px",
    background: "#ef4444",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer"
  },
  connect: {
    width: "100%",
    padding: "12px",
    background: "#ff0000",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600"
  }
};

export default YouTubeCard;
