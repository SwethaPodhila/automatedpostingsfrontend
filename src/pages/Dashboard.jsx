import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

const BACKEND_URL = "https://automatedpostingbackend.onrender.com";

export default function Dashboard() {
    const [sidebarWidth, setSidebarWidth] = useState(50);
    const [connected, setConnected] = useState({
        facebook: null,
        instagram: null,
    });
    const [twitterAccount, setTwitterAccount] = useState(null);

    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    // --- Get current userId ---
    const getUserId = () => {
        if (!token) return null;
        try {
            const decoded = jwtDecode(token);
            return decoded.id;
        } catch (err) {
            console.error("Invalid token:", err);
            return null;
        }
    };

    const userId = getUserId();

    // --- Fetch connected accounts on mount ---
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
            .catch((err) => console.error("Failed to fetch accounts:", err));
    }, [userId]);

    // --- OAuth Connect Handlers ---
    const connectFacebook = () => {
        if (!userId) return alert("Please login first!");
        window.location.href = `${BACKEND_URL}/social/facebook?userId=${userId}`;
    };

    const connectInstagram = () => {
        if (!userId) return alert("Please login first!");
        // Redirect directly to backend connect endpoint
        window.location.href = `${BACKEND_URL}/social/instagram/connect?userId=${userId}`;
    };

    // --- Disconnect Handler ---
    const disconnectAccount = async (platform) => {
        if (!userId) return alert("Please login first!");
        if (!window.confirm(`Disconnect ${platform}?`)) return;

        try {
            const res = await fetch(`${BACKEND_URL}/social/${platform}/disconnect`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId }),
            });
            const data = await res.json();
            if (data.success) {
                setConnected((prev) => ({ ...prev, [platform]: null }));
                alert(`${platform} disconnected successfully!`);
            }
        } catch (err) {
            console.error("Disconnect error:", err);
            alert("Failed to disconnect account.");
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
                    localStorage.setItem('twitter_account', JSON.stringify(data.account));
                } else {
                    const savedAccount = localStorage.getItem('twitter_account');
                    if (savedAccount) {
                        setTwitterAccount(JSON.parse(savedAccount));
                    }
                }
            }
        } catch (error) {
            console.log("Twitter check error:", error);
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

    // --- Render Card ---
    const renderSocialCard = (platform) => {
        const account = connected[platform];
        switch (platform) {
            case "facebook":
                return account ? (
                    <>
                        <div
                            onClick={() => navigate("/success")}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                                cursor: "pointer",
                                padding: 10,
                                borderRadius: 10,
                                background: "#f4f4f4",
                            }}
                        >
                            <img
                                src={account.meta?.picture}
                                alt={account.meta?.name}
                                style={{ width: 50, height: 50, borderRadius: "50%" }}
                            />
                            <span style={{ color: "green", fontWeight: "bold" }}>
                                {account.meta?.name}
                            </span>
                        </div>
                        <button
                            onClick={() => disconnectAccount(platform)}
                            style={styles.disconnectBtn}
                        >
                            Disconnect
                        </button>
                    </>
                ) : (
                    <button onClick={connectFacebook} style={styles.facebookBtn}>
                        Connect Facebook
                    </button>
                );

            case "instagram":
                return account ? (
                    <>
                        <img
                            src={account.profilePicture || ""}
                            alt="IG Profile"
                            style={{ width: 50, borderRadius: "50%", marginBottom: 10 }}
                        />
                        <p style={{ color: "green", fontWeight: "bold" }}>
                            Connected (IG: {account.username})
                        </p>
                        <button
                            onClick={() => disconnectAccount(platform)}
                            style={styles.disconnectBtn}
                        >
                            Disconnect
                        </button>
                    </>
                ) : (
                    <button onClick={connectInstagram} style={styles.btn}>
                        Connect Instagram
                    </button>
                );

            default:
                return null;
        }
    };

    return (
        <div style={styles.page}>
            <Navbar />
            <div style={styles.layout}>
                <Sidebar onWidthChange={(w) => setSidebarWidth(w)} />
                <main
                    style={{
                        ...styles.content,
                        marginLeft: sidebarWidth,
                        transition: "0.3s ease",
                        marginTop: 60,
                    }}
                >
                    <h2>Connect Your Social Media Accounts</h2>
                    <div style={styles.cardsContainer}>
                        {/* FACEBOOK */}
                        <div style={styles.card}>
                            <h3>Facebook</h3>
                            {renderSocialCard("facebook")}
                        </div>

                        {/* INSTAGRAM */}
                        <div style={styles.card}>
                            <h3>Instagram</h3>
                            {renderSocialCard("instagram")}
                        </div>

                        {/* TWITTER - FIXED VISUAL */}
                        <div style={styles.card}>
                            <h3>Twitter (X)</h3>
                            {twitterAccount ? (
                                <>
                                    <div style={styles.twitterAccountInfo}>
                                        <div style={styles.twitterAccountRow}>
                                            <img
                                                src={twitterAccount.profileImage || `https://unavatar.io/twitter/${twitterAccount.username}`}
                                                alt="Profile"
                                                style={styles.twitterProfileImage}
                                                onError={(e) => {
                                                    e.target.src = "https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png";
                                                }}
                                            />
                                            <div style={styles.twitterAccountDetails}>
                                                <p style={styles.twitterAccountName}>{twitterAccount.name || twitterAccount.username}</p>
                                                <p style={styles.twitterAccountUsername}>@{twitterAccount.username}</p>
                                            </div>
                                        </div>
                                        <p style={styles.twitterConnectedText}>✅ Connected</p>
                                    </div>
                                    <div style={styles.twitterButtonGroup}>
                                        <button
                                            onClick={() => window.location.href = "/twitter-manager"}
                                            style={{
                                                ...styles.twitterBtn,
                                                backgroundColor: "#1DA1F2",
                                                flex: 1
                                            }}
                                        >
                                            Manage
                                        </button>
                                        <button
                                            onClick={disconnectTwitter}
                                            style={{
                                                ...styles.twitterBtn,
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

                        {/* Placeholder: LinkedIn & YouTube */}
                        <div style={styles.card}>
                            <h3>LinkedIn</h3>
                            <button style={styles.btn}>Connect LinkedIn</button>
                        </div>
                        <div style={styles.card}>
                            <h3>YouTube</h3>
                            <button
                                style={styles.btn}
                                onClick={() =>
                                    (window.location.href = `${BACKEND_URL}/social/youtube/auth?user=${userId}`)
                                }
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