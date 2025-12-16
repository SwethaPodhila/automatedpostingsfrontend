// LinkedInConnect.jsx - FIXED VERSION
import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import { jwtDecode } from "jwt-decode";

export default function LinkedInConnect() {
    const BACKEND_URL = "https://automatedpostingbackend.onrender.com";
    
    const [sidebarWidth, setSidebarWidth] = useState(50);
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState("");
    const [debugInfo, setDebugInfo] = useState("");
    
    const token = localStorage.getItem("token");

    useEffect(() => {
        if (!token) {
            window.location.href = "/login";
            return;
        }
        
        const urlParams = new URLSearchParams(window.location.search);
        const linkedinStatus = urlParams.get('linkedin');
        const name = urlParams.get('name');
        const errorMsg = urlParams.get('error');
        
        if (linkedinStatus === 'connected' && name) {
            alert(`✅ LinkedIn connected successfully! Welcome ${name}`);
            setTimeout(() => {
                window.location.href = "/linkedin-manager";
            }, 2000);
        }
        
        if (errorMsg) {
            setError(`LinkedIn connection failed: ${errorMsg}`);
        }
    }, [token]);

    const connectLinkedIn = async () => {
        console.clear();
        console.log("🔍 LinkedIn Connect Button Clicked");
        
        if (!token) {
            alert("Please login first!");
            return;
        }

        let decoded;
        let userId;
        
        try {
            // Decode JWT token
            decoded = jwtDecode(token);
            console.log("🔍 Decoded JWT Token:", decoded);
            
            // Try different possible user ID fields
            userId = decoded.id || decoded.userId || decoded.sub || decoded.user_id || decoded._id;
            
            console.log("🔍 User ID Search Results:", {
                id: decoded.id,
                userId: decoded.userId,
                sub: decoded.sub,
                user_id: decoded.user_id,
                _id: decoded._id,
                selectedUserId: userId
            });
            
            if (!userId) {
                const errorMsg = "User ID not found in token. Available fields: " + JSON.stringify(decoded, null, 2);
                console.error("❌", errorMsg);
                setDebugInfo(errorMsg);
                alert("User ID not found in token. Check console for details.");
                return;
            }
            
            console.log("✅ Using User ID:", userId);
            
        } catch (error) {
            console.error("❌ JWT Decode Error:", error);
            alert("Invalid token. Please login again.");
            return;
        }

        setIsConnecting(true);
        setError("");
        setDebugInfo(`User ID: ${userId}\nPreparing to connect...`);

        try {
            // Build the LinkedIn OAuth URL
            const linkedinAuthUrl = `${BACKEND_URL}/auth/linkedin?userId=${encodeURIComponent(userId)}`;
            
            console.log("🔄 Redirecting to LinkedIn OAuth...");
            console.log("🔗 URL:", linkedinAuthUrl);
            
            setDebugInfo(`Redirecting to:\n${linkedinAuthUrl}`);
            
            // Add small delay to show loading state
            setTimeout(() => {
                window.location.href = linkedinAuthUrl;
            }, 500);
            
        } catch (error) {
            console.error("❌ LinkedIn Connection Error:", error);
            setError("Failed to connect to LinkedIn: " + error.message);
            setDebugInfo("Error: " + error.message);
            setIsConnecting(false);
        }
    };

    const testDirectLink = () => {
        // For debugging: Create a direct link
        const testUserId = "test_real_user_" + Date.now();
        const testUrl = `${BACKEND_URL}/auth/linkedin?userId=${testUserId}`;
        
        console.log("🔗 Test URL:", testUrl);
        setDebugInfo(`Test URL:\n${testUrl}\n\nClick this link to test directly.`);
        
        // Copy to clipboard
        navigator.clipboard.writeText(testUrl);
        alert("Test URL copied to clipboard! Paste in browser to test.");
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
                    <h2>Connect LinkedIn Account</h2>
                    
                    <div style={styles.container}>
                        <div style={styles.card}>
                            <div style={styles.iconContainer}>
                                <svg style={styles.linkedinIcon} viewBox="0 0 24 24">
                                    <path fill="currentColor" d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z"/>
                                </svg>
                            </div>
                            
                            <h3>Connect Your LinkedIn Account</h3>
                            
                            <p style={styles.description}>
                                Connect your LinkedIn account to post updates, share content, and manage your professional network.
                            </p>
                            
                            <p style={styles.permissions}>
                                📝 <strong>Permissions required:</strong> Basic profile info, Email address, Post updates
                            </p>
                            
                            {error && (
                                <div style={styles.errorBox}>
                                    ❌ {error}
                                </div>
                            )}
                            
                            <div style={styles.buttonGroup}>
                                <button
                                    onClick={connectLinkedIn}
                                    disabled={isConnecting}
                                    style={{
                                        ...styles.connectButton,
                                        backgroundColor: isConnecting ? "#666" : "#0077B5",
                                        cursor: isConnecting ? "wait" : "pointer"
                                    }}
                                >
                                    {isConnecting ? (
                                        <>
                                            <span style={styles.spinner}></span>
                                            Connecting...
                                        </>
                                    ) : (
                                        "Connect with LinkedIn"
                                    )}
                                </button>
                                
                                <button
                                    onClick={testDirectLink}
                                    style={styles.testButton}
                                >
                                    🔧 Test Direct Link
                                </button>
                            </div>
                            
                            {debugInfo && (
                                <div style={styles.debugBox}>
                                    <h4>Debug Information:</h4>
                                    <pre style={styles.debugText}>
                                        {debugInfo}
                                    </pre>
                                    <small>Open browser console (F12) for more details</small>
                                </div>
                            )}
                            
                            <div style={styles.troubleshoot}>
                                <h4>Troubleshooting:</h4>
                                <ol style={styles.troubleshootList}>
                                    <li>Open browser console (F12 → Console)</li>
                                    <li>Click "Connect with LinkedIn"</li>
                                    <li>Check console for User ID information</li>
                                    <li>If error persists, click "Test Direct Link"</li>
                                    <li>Copy test URL and open in new tab</li>
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
        maxWidth: "600px",
        width: "100%"
    },
    iconContainer: {
        marginBottom: "20px"
    },
    linkedinIcon: {
        width: "60px",
        height: "60px",
        color: "#0077B5"
    },
    description: {
        color: "#666",
        marginBottom: "20px",
        lineHeight: "1.6"
    },
    permissions: {
        backgroundColor: "#eef3f8",
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
        textAlign: "left",
        borderLeft: "4px solid #d32f2f"
    },
    buttonGroup: {
        display: "flex",
        gap: "10px",
        marginBottom: "20px"
    },
    connectButton: { 
        background: "#0077B5", 
        color: "white", 
        padding: "15px 30px", 
        border: "none", 
        borderRadius: "8px", 
        cursor: "pointer",
        fontSize: "16px",
        fontWeight: "bold",
        flex: 3,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px"
    },
    testButton: {
        background: "#666",
        color: "white",
        padding: "15px 20px",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "14px",
        flex: 1
    },
    spinner: {
        border: "3px solid rgba(255,255,255,0.3)",
        borderRadius: "50%",
        borderTop: "3px solid white",
        width: "20px",
        height: "20px",
        animation: "spin 1s linear infinite"
    },
    debugBox: {
        backgroundColor: "#f8f9fa",
        border: "1px solid #ddd",
        borderRadius: "8px",
        padding: "15px",
        marginBottom: "20px",
        textAlign: "left"
    },
    debugText: {
        fontSize: "12px",
        whiteSpace: "pre-wrap",
        wordBreak: "break-all",
        backgroundColor: "#fff",
        padding: "10px",
        borderRadius: "4px",
        border: "1px solid #eee"
    },
    troubleshoot: {
        textAlign: "left",
        marginTop: "20px",
        paddingTop: "20px",
        borderTop: "1px solid #eee"
    },
    troubleshootList: {
        paddingLeft: "20px",
        lineHeight: "1.8",
        fontSize: "14px",
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