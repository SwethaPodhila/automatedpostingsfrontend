import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import { jwtDecode } from "jwt-decode";

export default function TwitterConnect() {
    const BACKEND_URL = "https://automatedpostingbackend.onrender.com";
    
    const [sidebarWidth, setSidebarWidth] = useState(50);
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState("");
    
    const token = localStorage.getItem("token");

    useEffect(() => {
        if (!token) {
            window.location.href = "/login";
            return;
        }
        
        const urlParams = new URLSearchParams(window.location.search);
        
        // Check for Android callback
        const sessionId = urlParams.get("session_id");
        const status = urlParams.get("status");
        
        if (sessionId && status === "success") {
            // Android callback - redirect to manager
            setTimeout(() => {
                window.location.href = "/twitter-manager";
            }, 1000);
            return;
        }
        
        // Check for web callback
        const twitterStatus = urlParams.get('twitter');
        const username = urlParams.get('username');
        const errorMsg = urlParams.get('error');
        
        if (twitterStatus === 'connected' && username) {
            setTimeout(() => {
                window.location.href = "/twitter-manager";
            }, 2000);
        }
        
        if (errorMsg) {
            setError(`Twitter connection failed: ${decodeURIComponent(errorMsg)}`);
        }
    }, [token]);

    const connectTwitter = async () => {
        if (!token) {
            alert("Please login first!");
            return;
        }

        let decoded;
        try {
            decoded = jwtDecode(token);
        } catch (error) {
            console.error("Invalid token:", error);
            alert("Invalid token. Please login again.");
            return;
        }

        const userId = decoded.id;
        if (!userId) {
            alert("User ID not found in token!");
            return;
        }

        setIsConnecting(true);
        setError("");

        try {
            console.log("🔄 Starting Twitter OAuth for user:", userId);
            
            // Detect Android
            const isAndroid = /Android/i.test(navigator.userAgent);
            const platform = isAndroid ? "android" : "web";
            
            console.log("📱 Platform detected:", platform);
            
            // ✅ FIXED: Direct redirect to backend OAuth endpoint
            // Don't fetch - just redirect directly
            const authUrl = `${BACKEND_URL}/auth/twitter?userId=${encodeURIComponent(userId)}&platform=${platform}`;
            
            console.log("✅ Redirecting to:", authUrl);
            
            // Direct redirect (no fetch needed)
            window.location.href = authUrl;
            
        } catch (error) {
            console.error("❌ Twitter connection error:", error);
            setError("Failed to connect to Twitter: " + error.message);
            setIsConnecting(false);
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
                        marginTop: "60px",
                    }}
                >
                    <h2>Connect Twitter Account</h2>
                    
                    <div style={styles.container}>
                        <div style={styles.card}>
                            <div style={styles.iconContainer}>
                                <svg style={styles.twitterIcon} viewBox="0 0 24 24">
                                    <path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                                </svg>
                            </div>
                            
                            <h3>Connect Your Twitter Account</h3>
                            
                            <p style={styles.description}>
                                Connect your Twitter account to post tweets directly from AI Media Hub.
                            </p>
                            
                            <p style={styles.permissions}>
                                🔐 <strong>Secure connection:</strong> Your Twitter credentials are never stored
                            </p>
                            
                            {error && (
                                <div style={styles.errorBox}>
                                    ❌ {error}
                                    <button 
                                        onClick={() => setError("")}
                                        style={styles.closeButton}
                                    >
                                        ✕
                                    </button>
                                </div>
                            )}
                            
                            <button
                                onClick={connectTwitter}
                                disabled={isConnecting}
                                style={{
                                    ...styles.connectButton,
                                    backgroundColor: isConnecting ? "#666" : "#000",
                                    cursor: isConnecting ? "wait" : "pointer"
                                }}
                            >
                                {isConnecting ? (
                                    <>
                                        <span style={styles.spinner}></span>
                                        Connecting...
                                    </>
                                ) : (
                                    "Connect with Twitter"
                                )}
                            </button>
                            
                            <div style={styles.platformInfo}>
                                <p style={{ fontSize: "14px", color: "#666", marginTop: "20px" }}>
                                    {/Android/i.test(navigator.userAgent) 
                                        ? "📱 Android mode: Will redirect back to app" 
                                        : "💻 Web mode: Will redirect to manager page"}
                                </p>
                            </div>
                            
                            <div style={styles.steps}>
                                <h4>How it works:</h4>
                                <ol style={styles.stepsList}>
                                    <li>Click "Connect with Twitter"</li>
                                    <li>You'll be redirected to Twitter login</li>
                                    <li>Authorize AI Media Hub to post tweets</li>
                                    <li>You'll be redirected back automatically</li>
                                    <li>Start posting tweets immediately!</li>
                                </ol>
                            </div>
                            
                            <div style={styles.troubleshoot}>
                                <h4>Having issues?</h4>
                                <ul style={styles.troubleshootList}>
                                    <li>Make sure you're logged into Twitter</li>
                                    <li>Check if any browser extensions are blocking redirects</li>
                                    <li>Try in a private/incognito window</li>
                                </ul>
                            </div>
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
        flexDirection: "column" 
    },
    layout: { 
        display: "flex", 
        flex: 1 
    },
    content: { 
        flex: 1, 
        padding: "30px 40px" 
    },
    container: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "70vh"
    },
    card: { 
        background: "white", 
        padding: "40px",
        borderRadius: "16px", 
        boxShadow: "0px 5px 15px rgba(0,0,0,0.1)", 
        textAlign: "center",
        maxWidth: "500px",
        width: "100%"
    },
    iconContainer: {
        marginBottom: "20px"
    },
    twitterIcon: {
        width: "60px",
        height: "60px",
        color: "#000"
    },
    description: {
        color: "#666",
        marginBottom: "20px",
        lineHeight: "1.6"
    },
    permissions: {
        backgroundColor: "#f0f8ff",
        padding: "15px",
        borderRadius: "8px",
        marginBottom: "20px",
        color: "#333"
    },
    errorBox: {
        backgroundColor: "#ffe6e6",
        color: "#d32f2f",
        padding: "15px",
        borderRadius: "8px",
        marginBottom: "20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderLeft: "4px solid #d32f2f"
    },
    closeButton: {
        background: "none",
        border: "none",
        color: "#d32f2f",
        fontSize: "18px",
        cursor: "pointer",
        padding: "0 5px"
    },
    connectButton: { 
        background: "#000", 
        color: "white", 
        padding: "15px 30px", 
        border: "none", 
        borderRadius: "8px", 
        cursor: "pointer",
        fontSize: "16px",
        fontWeight: "bold",
        width: "100%",
        marginBottom: "20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px"
    },
    spinner: {
        border: "3px solid rgba(255,255,255,0.3)",
        borderRadius: "50%",
        borderTop: "3px solid white",
        width: "20px",
        height: "20px",
        animation: "spin 1s linear infinite"
    },
    platformInfo: {
        marginBottom: "20px"
    },
    steps: {
        textAlign: "left",
        marginTop: "30px",
        paddingTop: "20px",
        borderTop: "1px solid #eee"
    },
    stepsList: {
        paddingLeft: "20px",
        lineHeight: "1.8",
        fontSize: "14px",
        marginBottom: "20px"
    },
    troubleshoot: {
        textAlign: "left",
        marginTop: "20px",
        padding: "15px",
        backgroundColor: "#f9f9f9",
        borderRadius: "8px"
    },
    troubleshootList: {
        paddingLeft: "20px",
        lineHeight: "1.8",
        fontSize: "13px",
        color: "#666"
    }
};

// Add CSS animation for spinner
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(`
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`, styleSheet.cssRules.length);