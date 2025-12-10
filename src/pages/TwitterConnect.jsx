import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import { jwtDecode } from "jwt-decode";

export default function TwitterConnect() {
    // Use environment variable or fallback to production URL
    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "https://automatedpostingbackend.onrender.com";
    
    const [sidebarWidth, setSidebarWidth] = useState(50);
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState("");
    
    const token = localStorage.getItem("token");

    useEffect(() => {
        // Check if user is logged in
        if (!token) {
            window.location.href = "/login";
            return;
        }
        
        // Check URL parameters for callback result
        const urlParams = new URLSearchParams(window.location.search);
        const twitterStatus = urlParams.get('twitter');
        const username = urlParams.get('username');
        const errorMsg = urlParams.get('error');
        
        if (twitterStatus === 'connected' && username) {
            alert(`✅ Twitter connected successfully! Welcome @${username}`);
            // Redirect to Twitter Manager instead of Dashboard
            setTimeout(() => {
                window.location.href = "/twitter-manager";
            }, 2000);
        }
        
        if (errorMsg) {
            setError(`Twitter connection failed: ${errorMsg}`);
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
            console.log("Getting Twitter OAuth URL for user:", userId);
            
            // ✅ DIRECTLY use the correct auth endpoint
            // Add userId as query parameter
            const authUrl = `${BACKEND_URL}/auth/twitter?userId=${encodeURIComponent(userId)}`;
            
            console.log("Redirecting to:", authUrl);
            
            // ✅ Direct redirect (simplest solution)
            window.location.href = authUrl;
            
        } catch (error) {
            console.error("Twitter connection error:", error);
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
                            
                            <h3>Connect Your Twitter (X) Account</h3>
                            
                            <p style={styles.description}>
                                Connect your Twitter account to post tweets, schedule content, and analyze your Twitter performance.
                            </p>
                            
                            <p style={styles.permissions}>
                                📝 <strong>Permissions required:</strong> Post tweets, Read your profile
                            </p>
                            
                            {error && (
                                <div style={styles.errorBox}>
                                    ❌ {error}
                                </div>
                            )}
                            
                            <button
                                onClick={connectTwitter}
                                disabled={isConnecting}
                                style={{
                                    ...styles.connectButton,
                                    backgroundColor: isConnecting ? "#666" : "#000",
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
                            
                            <div style={styles.steps}>
                                <h4>How it works:</h4>
                                <ol style={styles.stepsList}>
                                    <li>Click "Connect with Twitter"</li>
                                    <li>Authorize our app on Twitter</li>
                                    <li>You'll be redirected to Twitter Manager page</li>
                                    <li>Start posting and scheduling tweets!</li>
                                </ol>
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
        textAlign: "left"
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
    steps: {
        textAlign: "left",
        marginTop: "30px",
        paddingTop: "20px",
        borderTop: "1px solid #eee"
    },
    stepsList: {
        paddingLeft: "20px",
        lineHeight: "1.8"
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