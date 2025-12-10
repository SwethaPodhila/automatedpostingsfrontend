import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
    const [twitterAccount, setTwitterAccount] = useState(null);
    // Sidebar width
    const [sidebarWidth, setSidebarWidth] = useState(50);
    const token = localStorage.getItem("token");

    const navigate = useNavigate();
    const BACKEND_URL = "https://automatedpostingbackend.onrender.com";

    // Store connected accounts
    const [connected, setConnected] = useState({
        facebook: null,
        instagram: null
    });

    // Fetch connected accounts on load
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;

        const decoded = jwtDecode(token);
        const userId = decoded.id;

        fetch(`${BACKEND_URL}/social/${userId}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    const fb = data.accounts.find(a => a.platform === "facebook");
                    const ig = data.accounts.find(a => a.platform === "instagram");

                    setConnected({
                        facebook: fb || null,
                        instagram: ig || null
                    });
                }
            })
            .catch(err => console.error("Failed to fetch accounts:", err));
    }, []);

    // Connect Facebook
    const connectFacebook = () => {
        const token = localStorage.getItem("token");
        if (!token) return alert("Please login first!");
        const decoded = jwtDecode(token);
        const userId = decoded.id;

        window.location.href = `${BACKEND_URL}/social/facebook?userId=${userId}`;
    };

    // Connect Instagram
    const connectInstagram = () => {
        const token = localStorage.getItem("token");
        if (!token) return alert("Please login first!");
        const decoded = jwtDecode(token);
        const userId = decoded.id;

        window.location.href = `${BACKEND_URL}/social/instagram?userId=${userId}`;
    };

    // Disconnect account
    const disconnectAccount = async (platform) => {
        const token = localStorage.getItem("token");
        if (!token) return alert("Please login first!");
        const decoded = jwtDecode(token);
        const userId = decoded.id;

        if (!window.confirm(`Disconnect ${platform}?`)) return;

        try {
            const res = await fetch(`${BACKEND_URL}/social/${platform}/${userId}`, {
                method: "DELETE"
            });
            const data = await res.json();
            if (data.success) {
                setConnected(prev => ({ ...prev, [platform]: null }));
                alert(`${platform} disconnected`);
            }
        } catch (err) {
            console.error(err);
            alert("Failed to disconnect account");
        }
    };

    useEffect(() => {
        checkTwitterConnection();
    }, []);

    const checkTwitterConnection = async () => {
        if (!token) return;

        try {
            const decoded = jwtDecode(token);
            const userId = decoded.id;

            const response = await fetch(`${BACKEND_URL}/api/twitter/check?userId=${userId}`);
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.connected) {
                    setTwitterAccount(data.account);
                    // Also save to localStorage for persistence
                    localStorage.setItem('twitter_account', JSON.stringify(data.account));
                } else {
                    // Check localStorage as fallback
                    const savedAccount = localStorage.getItem('twitter_account');
                    if (savedAccount) {
                        setTwitterAccount(JSON.parse(savedAccount));
                    }
                }
            }
        } catch (error) {
            console.log("Twitter check error:", error);
            // Check localStorage as fallback
            const savedAccount = localStorage.getItem('twitter_account');
            if (savedAccount) {
                setTwitterAccount(JSON.parse(savedAccount));
            }
        }
    };

    const disconnectTwitter = async () => {
        if (!window.confirm("Are you sure you want to disconnect your Twitter account?")) {
            return;
        }

        try {
            const decoded = jwtDecode(token);
            const userId = decoded.id;

            const response = await fetch(`${BACKEND_URL}/api/twitter/disconnect`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ userId })
            });

            const data = await response.json();

            if (data.success) {
                setTwitterAccount(null);
                localStorage.removeItem('twitter_account');
                alert("Twitter account disconnected successfully!");
            } else {
                alert("Failed to disconnect: " + data.error);
            }
        } catch (error) {
            console.error("Error disconnecting:", error);
            alert("Failed to disconnect Twitter account");
        }
    };


    return (
        <div style={styles.page}>
            <Navbar />
            <div style={styles.layout}>
                <Sidebar onWidthChange={w => setSidebarWidth(w)} />

                <main
                    style={{
                        ...styles.content,
                        marginLeft: sidebarWidth,
                        transition: "0.3s ease",
                        marginTop: "60px",
                    }}
                >
                    <h2>Connect Your Social Media Accounts</h2>

                    <div style={styles.cardsContainer}>

                        {/* FACEBOOK */}

                        <div style={styles.card}>

                            <h3>Facebook</h3>

                            {connected.facebook ? (
                                <>
                                    <div
                                        onClick={() => navigate("/success")}      // 👈 CLICK → REDIRECT
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "10px",
                                            cursor: "pointer",                     // 👈 cursor pointer
                                            padding: "10px",
                                            borderRadius: "10px",
                                            background: "#f4f4f4"
                                        }}
                                    >
                                        <img
                                            src={connected.facebook.meta.picture}
                                            alt={connected.facebook.meta.name}
                                            style={{ width: 50, height: 50, borderRadius: "50%" }}
                                        />

                                        <span style={{ color: "green", fontWeight: "bold" }}>
                                            {connected.facebook.meta.name}
                                        </span>
                                    </div>

                                    <button
                                        onClick={() => disconnectAccount("facebook")}
                                        style={styles.disconnectBtn}
                                    >
                                        Disconnect
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={connectFacebook}
                                    style={styles.facebookBtn}
                                >
                                    Connect Facebook
                                </button>
                            )}
                        </div>

                        {/* INSTAGRAM */}
                        <div style={styles.card}>
                            <h3>Instagram</h3>
                            {connected.instagram ? (
                                <>
                                    <p style={{ color: "green", fontWeight: "bold" }}>
                                        Connected (IG ID: {connected.instagram.providerId})
                                    </p>
                                    <button
                                        onClick={() => disconnectAccount("instagram")}
                                        style={styles.disconnectBtn}
                                    >
                                        Disconnect
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={connectInstagram}
                                    style={styles.btn}
                                >
                                    Connect Instagram
                                </button>
                            )}
                        </div>

                        {/* TWITTER */}
                        <div style={styles.card}>
                            <h3>Twitter (X)</h3>
                            {twitterAccount ? (
                                <>
                                    <div style={styles.accountInfo}>
                                        <div style={styles.accountRow}>
                                            <img
                                                src={twitterAccount.profileImage || `https://unavatar.io/twitter/${twitterAccount.username}`}
                                                alt="Profile"
                                                style={styles.profileImage}
                                                onError={(e) => {
                                                    e.target.src = "https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png";
                                                }}
                                            />
                                            <div style={styles.accountDetails}>
                                                <p style={styles.accountName}>{twitterAccount.name || twitterAccount.username}</p>
                                                <p style={styles.accountUsername}>@{twitterAccount.username}</p>
                                            </div>
                                        </div>
                                        <p style={styles.connectedText}>✅ Connected</p>
                                    </div>
                                    <div style={styles.buttonGroup}>
                                        <button
                                            onClick={() => window.location.href = "/twitter-manager"}
                                            style={{
                                                ...styles.btn,
                                                backgroundColor: "#1DA1F2",
                                                flex: 1
                                            }}
                                        >
                                            Manage Twitter
                                        </button>
                                        <button
                                            onClick={disconnectTwitter}
                                            style={{
                                                ...styles.btn,
                                                backgroundColor: "#ff4d4f",
                                                marginLeft: "10px",
                                                flex: 1
                                            }}
                                        >
                                            Disconnect
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <button
                                    onClick={() => {
                                        const decoded = jwtDecode(token);
                                        if (!decoded?.id) {
                                            alert("User not logged in. Please login again.");
                                            return;
                                        }

                                        window.location.href = `${BACKEND_URL}/auth/twitter?userId=${decoded.id}`;
                                    }}

                                    style={{
                                        ...styles.btn,
                                        backgroundColor: "#000000",
                                    }}
                                >
                                    Connect Twitter
                                </button>
                            )}
                        </div>

                        {/* LINKEDIN */}
                        <div style={styles.card}>
                            <h3>LinkedIn</h3>
                            <button style={styles.btn}>Connect LinkedIn</button>
                        </div>

                        {/* YOUTUBE */}
                        <div style={styles.card}>
                            <h3>YouTube</h3>
                            <button
                                style={styles.btn}
                                onClick={() => {
                                    const token = localStorage.getItem("token");
                                    if (!token) return alert("Please login first!");
                                    const decoded = jwtDecode(token);
                                    const userId = decoded.id;

                                    window.location.href =
                                        `${BACKEND_URL}/social/youtube/auth?user=${userId}`;
                                }}
                            >
                                Connect YouTube
                            </button>

                        </div>

                    </div>
                </main>
            </div>
            <Footer />
        </div>
    );
}


const styles = {
    page: {
        background: "#f5f6fa",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
    },
    layout: { display: "flex", flex: 1 },
    content: { flex: 1, padding: "30px 40px" },
    cardsContainer: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "20px",
        marginTop: "20px",
    },
    card: {
        background: "white",
        padding: "20px",
        borderRadius: "12px",
        boxShadow: "0px 3px 6px rgba(0,0,0,0.1)",
        textAlign: "center",
    },
    btn: {
        background: "#0d6efd",
        color: "white",
        padding: "10px 18px",
        border: "none",
        borderRadius: "5px",
        marginTop: "10px",
        cursor: "pointer",
        fontSize: "16px",
    },
    facebookBtn: {
        padding: "12px 25px",
        backgroundColor: "#1877F2",
        color: "white",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "16px",
        marginTop: "20px",
    },
};