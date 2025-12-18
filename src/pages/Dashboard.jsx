import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";

import FacebookCard from "./FacebookCard";
import InstagramCard from "./InstagramCard";
import TwitterCard from "./TwitterCard";
import LinkedInCard from "./LinkedinCard";
import YouTubeCard from "./YoutubeCard";

const BACKEND_URL = "https://automatedpostingbackend.onrender.com";

export default function Dashboard() {
    const [sidebarWidth, setSidebarWidth] = useState(50);
    const [connected, setConnected] = useState({ facebook: null, instagram: null });
    const [twitterAccount, setTwitterAccount] = useState(null);
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const [linkedinAccount, setLinkedinAccount] = useState(null);

   useEffect(() => {
        if (token) {
            checkLinkedInConnection();
        }
    }, [token]);

    const getUserId = () => {
        if (!token) return null;
        try { return jwtDecode(token).id; }
        catch (err) { console.error("Invalid token:", err); return null; }
    };
    const userId = getUserId();

    useEffect(() => {
        if (!userId) return;
        fetch(`${BACKEND_URL}/social/${userId}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    const fb = data.accounts.find((a) => a.platform === "facebook");
                    const ig = data.accounts.find((a) => a.platform === "instagram");
                    setConnected({ facebook: fb || null, instagram: ig || null });
                }
            })
            .catch((err) => console.error(err));
    }, [userId]);

    const connectFacebook = () => userId && (window.location.href = `${BACKEND_URL}/social/facebook?userId=${userId}&source=web`);
 
    const connectInstagram = () => userId && (window.location.href = `${BACKEND_URL}/social/instagram/connect?userId=${userId}`);
   
    const disconnectAccount = async (platform) => {
        if (!userId || !window.confirm(`Disconnect ${platform}?`)) return;
        try {
            const res = await fetch(`${BACKEND_URL}/social/${platform}/disconnect`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId }),
            });
            const data = await res.json();
            if (data.success) setConnected(prev => ({ ...prev, [platform]: null }));
        } catch (err) { console.error(err); }
    };

    const connectTwitter = () => {
        if (!token) return;
        const id = jwtDecode(token).id;
        window.location.href = `${BACKEND_URL}/auth/twitter?userId=${id}`;
    };

    const disconnectTwitter = async () => {
        if (!window.confirm("Disconnect Twitter?")) return;
        try {
            const id = jwtDecode(token).id;
            const res = await fetch(`${BACKEND_URL}/api/twitter/disconnect`, {
                method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: id })
            });
            const data = await res.json();
            if (data.success) setTwitterAccount(null);
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        (async () => {
            if (!token) return;
            const id = jwtDecode(token).id;
            try {
                const res = await fetch(`${BACKEND_URL}/api/twitter/check?userId=${id}`);
                const data = await res.json();
                if (data.success && data.connected) setTwitterAccount(data.account);
            } catch (err) { console.error(err); }
        })();
    }, []);

    const checkLinkedInConnection = async () => {
        if (!token) return;

        try {
            const decoded = jwtDecode(token);
            const userId = decoded.id;

            const response = await fetch(`${BACKEND_URL}/api/linkedin/check?userId=${userId}`);
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.connected) {
                    setLinkedinAccount(data.account);
                    localStorage.setItem('linkedin_account', JSON.stringify(data.account));
                } else {
                    const savedAccount = localStorage.getItem('linkedin_account');
                    if (savedAccount) {
                        setLinkedinAccount(JSON.parse(savedAccount));
                    }
                }
            }
        } catch (error) {
            console.log("LinkedIn check error:", error);
            const savedAccount = localStorage.getItem('linkedin_account');
            if (savedAccount) {
                setLinkedinAccount(JSON.parse(savedAccount));
            }
        }
    };

    // ==== ADD THIS FUNCTION ====
    const disconnectLinkedIn = async () => {
        if (!window.confirm("Are you sure you want to disconnect your LinkedIn account?")) {
            return;
        }

        try {
            const decoded = jwtDecode(token);
            const userId = decoded.id;

            const response = await fetch(`${BACKEND_URL}/api/linkedin/disconnect`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ userId })
            });

            const data = await response.json();

            if (data.success) {
                setLinkedinAccount(null);
                localStorage.removeItem('linkedin_account');
                alert("LinkedIn account disconnected successfully!");
            } else {
                alert("Failed to disconnect: " + data.error);
            }
        } catch (error) {
            console.error("Error disconnecting:", error);
            alert("Failed to disconnect LinkedIn account");
        }
    };


    return (
        <div style={styles.page}>
            <Navbar />
            <div style={styles.layout}>
                <Sidebar onWidthChange={setSidebarWidth} />
                <main style={{ ...styles.content, marginLeft: sidebarWidth, transition: "0.3s ease", marginTop: 60 }}>
                    <h2>Connect Your Social Media Accounts</h2>
                    <div style={styles.cardsContainer}>
                        <div style={styles.card}><h3>Facebook</h3><FacebookCard account={connected.facebook} connect={connectFacebook} disconnect={disconnectAccount} navigate={navigate} /></div>
                        <div style={styles.card}><h3>Instagram</h3><InstagramCard account={connected.instagram} connect={connectInstagram} disconnect={disconnectAccount} /></div>
                        <div style={styles.card}><h3>Twitter</h3><TwitterCard account={twitterAccount} connect={connectTwitter} disconnect={disconnectTwitter} /></div>

                        <h3>LinkedIn</h3>
                        <LinkedInCard
                            connect={() => {
                                const decoded = jwtDecode(token);
                                if (!decoded?.id) {
                                    alert("User not logged in. Please login again.");
                                    return;
                                }
                                window.location.href = `${BACKEND_URL}/auth/linkedin?userId=${decoded.id}`;
                            }}
                            linkedinAccount={linkedinAccount}
                            disconnectLinkedIn={disconnectLinkedIn}
                        />

                        <div style={styles.card}><h3>YouTube</h3><YouTubeCard connect={() => window.location.href = `${BACKEND_URL}/social/youtube/auth?user=${userId}`} /></div>
                    </div>
                </main>
            </div >
            <Footer />
        </div >
    );
}

const styles = {
    page: { width: "100%", height: "100vh", background: "#f5f7fb" },

    layout: { display: "flex" },

    content: {
        flex: 1,
        padding: 30,
    },

    cardsContainer: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
        gap: 25,
        marginTop: 20,
    },

    card: {
        background: "#fff",
        borderRadius: 16,
        padding: 20,
        boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
    },

    platformTitle: {
        fontSize: 18,
        fontWeight: 600,
        marginBottom: 15,
    },

    connectedBadge: {
        background: "#e6f7ee",
        color: "#16a34a",
        fontSize: 12,
        fontWeight: 600,
        padding: "4px 10px",
        borderRadius: 20,
        width: "fit-content",
        marginBottom: 12,
    },

    profileRow: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        marginBottom: 15,
    },

    avatar: {
        width: 48,
        height: 48,
        borderRadius: "50%",
    },

    name: {
        fontWeight: 600,
    },

    username: {
        fontSize: 13,
        color: "#666",
    },

    actions: {
        display: "flex",
        gap: 10,
        marginTop: 10,
    },

    manageBtn: {
        flex: 1,
        padding: 10,
        borderRadius: 8,
        border: "none",
        background: "#2563eb",
        color: "#fff",
        fontWeight: 600,
        cursor: "pointer",
    },

    disconnectBtn: {
        flex: 1,
        padding: 10,
        borderRadius: 8,
        border: "none",
        background: "#ef4444",
        color: "#fff",
        fontWeight: 600,
        cursor: "pointer",
    },

    connectBtn: {
        marginTop: 20,
        padding: 12,
        borderRadius: 10,
        border: "none",
        background: "#111827",
        color: "#fff",
        fontWeight: 600,
        cursor: "pointer",
    },
};

