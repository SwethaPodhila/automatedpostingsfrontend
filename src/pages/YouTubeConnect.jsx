import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { jwtDecode } from "jwt-decode";

export default function YouTubeConnect() {
    const BACKEND_URL = "https://automatedpostingbackend.onrender.com";
    const FRONTEND_URL = "https://automatedpostingfrontend.onrender.com";
    
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [userId, setUserId] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");
        
        if (!token) {
            window.location.href = "/login";
            return;
        }

        const urlParams = new URLSearchParams(window.location.search);
        const errorParam = urlParams.get("error");
        const messageParam = urlParams.get("message");
        
        if (errorParam === "auth_failed") {
            setError(`Connection failed: ${decodeURIComponent(messageParam || "Unknown error")}`);
        }

        // Get user ID from token
        try {
            const decoded = jwtDecode(token);
            setUserId(decoded.id);
        } catch (err) {
            console.error("Error decoding token:", err);
            setError("Invalid session. Please login again.");
        }
    }, []);

    const connectYouTube = () => {
        if (!userId) {
            setError("User ID not found. Please login again.");
            return;
        }
        
        setIsLoading(true);
        setError("");
        window.location.href = `${BACKEND_URL}/api/youtube/connect?userId=${encodeURIComponent(userId)}`;
    };

    return (
        <div style={styles.page}>
            <Navbar />
            <main style={styles.content}>
                <div style={styles.container}>
                    <div style={styles.card}>
                        <div style={styles.iconContainer}>
                            <svg style={styles.youtubeIcon} viewBox="0 0 24 24">
                                <path fill="currentColor" d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                            </svg>
                        </div>
                        
                        <h2 style={styles.title}>Connect Your YouTube Account</h2>
                        <p style={styles.description}>
                            Connect your YouTube account to upload videos directly from this platform.
                            You'll be redirected to Google to authorize access to your YouTube channel.
                        </p>
                        
                        {error && (
                            <div style={styles.errorBox}>
                                <span>❌ {error}</span>
                                <button 
                                    onClick={() => setError("")}
                                    style={styles.closeButton}
                                >
                                    ✕
                                </button>
                            </div>
                        )}
                        
                        <div style={styles.infoBox}>
                            <h4>What you'll authorize:</h4>
                            <ul style={styles.permissionsList}>
                                <li>✅ Upload videos to your YouTube channel</li>
                                <li>✅ View your YouTube videos</li>
                                <li>✅ Get your channel information</li>
                                <li>✅ Schedule video uploads</li>
                            </ul>
                            <p style={styles.note}>
                                Your YouTube data is stored securely and is only used for the features you enable.
                            </p>
                        </div>
                        
                        <button
                            onClick={connectYouTube}
                            disabled={isLoading || !userId}
                            style={styles.connectButton}
                        >
                            {isLoading ? (
                                <>
                                    <div style={styles.spinner}></div>
                                    Connecting to YouTube...
                                </>
                            ) : (
                                <>
                                    <span style={styles.buttonIcon}>🔗</span>
                                    Connect to YouTube
                                </>
                            )}
                        </button>
                        
                        {userId && (
                            <div style={styles.userInfo}>
                                <small>UserId: {userId}</small>
                            </div>
                        )}
                        
                        <div style={styles.footerNote}>
                            <small>
                                By connecting, you agree to YouTube's Terms of Service and Privacy Policy.
                                You can disconnect your account at any time from the YouTube Manager.
                            </small>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}

const styles = {
    page: { 
        background: "#f5f6fa", 
        minHeight: "100vh", 
        display: "flex", 
        flexDirection: "column" 
    },
    content: { 
        flex: 1,
        background: "#f5f6fa",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    },
    container: {
        width: "100%",
        maxWidth: "600px",
        padding: "20px"
    },
    card: { 
        background: "white", 
        padding: "40px",
        borderRadius: "16px", 
        boxShadow: "0px 5px 15px rgba(0,0,0,0.1)", 
        textAlign: "center"
    },
    iconContainer: {
        display: "flex",
        justifyContent: "center",
        marginBottom: "20px"
    },
    youtubeIcon: {
        width: "80px",
        height: "80px",
        color: "#FF0000"
    },
    title: {
        fontSize: "28px",
        fontWeight: "bold",
        color: "#333",
        marginBottom: "15px"
    },
    description: {
        color: "#666",
        fontSize: "16px",
        lineHeight: "1.6",
        marginBottom: "25px"
    },
    errorBox: {
        backgroundColor: "#ffe6e6",
        color: "#d32f2f",
        padding: "15px",
        borderRadius: "8px",
        marginBottom: "20px",
        borderLeft: "4px solid #d32f2f",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        textAlign: "left"
    },
    closeButton: {
        background: "none",
        border: "none",
        color: "inherit",
        fontSize: "18px",
        cursor: "pointer",
        padding: "0 5px"
    },
    infoBox: {
        backgroundColor: "#f8f9fa",
        padding: "20px",
        borderRadius: "10px",
        marginBottom: "25px",
        textAlign: "left"
    },
    permissionsList: {
        listStyle: "none",
        padding: "0",
        margin: "15px 0"
    },
    permissionsList : {
        padding: "8px 0",
        color: "#555",
        fontSize: "14px"
    },
    note: {
        fontSize: "12px",
        color: "#777",
        fontStyle: "italic",
        marginTop: "10px"
    },
    connectButton: {
        background: "#FF0000",
        color: "white",
        padding: "18px 40px",
        border: "none",
        borderRadius: "10px",
        cursor: "pointer",
        fontSize: "18px",
        fontWeight: "bold",
        width: "100%",
        marginTop: "10px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
        transition: "background 0.3s",
        "&:hover": {
            background: "#CC0000"
        },
        "&:disabled": {
            opacity: 0.6,
            cursor: "not-allowed"
        }
    },
    spinner: {
        border: "3px solid rgba(255, 255, 255, 0.3)",
        borderTop: "3px solid white",
        borderRadius: "50%",
        width: "20px",
        height: "20px",
        animation: "spin 1s linear infinite"
    },
    buttonIcon: {
        fontSize: "20px"
    },
    userInfo: {
        marginTop: "15px",
        padding: "10px",
        background: "#f0f0f0",
        borderRadius: "6px",
        fontSize: "12px",
        color: "#666"
    },
    footerNote: {
        marginTop: "25px",
        paddingTop: "15px",
        borderTop: "1px solid #eee",
        fontSize: "12px",
        color: "#777",
        lineHeight: "1.5"
    }
};