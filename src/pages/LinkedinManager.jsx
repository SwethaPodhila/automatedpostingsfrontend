// LinkedInManager.jsx
import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import { jwtDecode } from "jwt-decode";

export default function LinkedInManager() {
    // Production URLs
    const BACKEND_URL = "https://automatedpostingbackend.onrender.com";
    const FRONTEND_URL = "https://automatedpostingsfrontend.onrender.com";
    
    const [sidebarWidth, setSidebarWidth] = useState(50);
    const [linkedinAccount, setLinkedinAccount] = useState(null);
    const [postContent, setPostContent] = useState("");
    const [isPosting, setIsPosting] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [postedUpdates, setPostedUpdates] = useState([]);
    const [visibility, setVisibility] = useState("PUBLIC");

    const token = localStorage.getItem("token");

    useEffect(() => {
        if (!token) {
            window.location.href = "/login";
            return;
        }

        const urlParams = new URLSearchParams(window.location.search);
        const linkedinStatus = urlParams.get("linkedin");
        const name = urlParams.get("name");

        if (linkedinStatus === "connected" && name) {
            const account = {
                name,
                firstName: name.split(" ")[0],
                profileImage: `https://cdn-icons-png.flaticon.com/512/174/174857.png`,
                connectedAt: new Date().toISOString()
            };
            setLinkedinAccount(account);
            localStorage.setItem("linkedin_account", JSON.stringify(account));
            setMessage(`✅ Successfully connected to LinkedIn! Welcome ${name}`);
            window.history.replaceState({}, document.title, "/linkedin-manager");
            setIsLoading(false);
            return;
        }

        loadLinkedInAccount();
    }, [token]);

    const loadLinkedInAccount = async () => {
        setIsLoading(true);
        try {
            const decoded = jwtDecode(token);
            const userId = decoded.id;

            const response = await fetch(`${BACKEND_URL}/api/linkedin/check?userId=${userId}`);
            if (!response.ok) throw new Error(`API error: ${response.status}`);

            const data = await response.json();

            if (data.success && data.connected && data.account) {
                const account = {
                    name: data.account.name,
                    firstName: data.account.firstName,
                    lastName: data.account.lastName,
                    headline: data.account.headline,
                    profileImage: data.account.profileImage || `https://cdn-icons-png.flaticon.com/512/174/174857.png`,
                    connectedAt: data.account.connectedAt || new Date().toISOString()
                };
                setLinkedinAccount(account);
                setError("");
                localStorage.setItem("linkedin_account", JSON.stringify(account));
            } else {
                const savedAccount = localStorage.getItem("linkedin_account");
                if (savedAccount) {
                    setLinkedinAccount(JSON.parse(savedAccount));
                    setError("");
                } else {
                    setError("LinkedIn account not connected. Please connect first.");
                    localStorage.removeItem("linkedin_account");
                }
            }
        } catch (err) {
            console.error("❌ Error loading LinkedIn account:", err);
            const savedAccount = localStorage.getItem("linkedin_account");
            if (savedAccount) {
                setLinkedinAccount(JSON.parse(savedAccount));
                setError("");
            } else {
                setError("Failed to load LinkedIn account. Please reconnect.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const postToLinkedIn = async () => {
        if (!postContent.trim()) {
            setError("Please enter post content");
            return;
        }
        if (postContent.length > 3000) {
            setError("Post cannot exceed 3000 characters");
            return;
        }

        setIsPosting(true);
        setError("");

        try {
            const decoded = jwtDecode(token);
            const userId = decoded.id;

            const response = await fetch(`${BACKEND_URL}/api/linkedin/post`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ 
                    userId, 
                    content: postContent,
                    visibility: visibility
                })
            });
            const data = await response.json();

            if (data.success) {
                setMessage(`✅ LinkedIn post published successfully!`);
                const newUpdate = {
                    id: data.postId,
                    content: postContent,
                    time: new Date().toISOString(),
                    url: data.postUrl,
                    visibility: visibility
                };
                setPostedUpdates(prev => [newUpdate, ...prev]);
                setPostContent("");
            } else {
                setError(data.error || "Failed to post to LinkedIn");
            }
        } catch (err) {
            console.error(err);
            setError("Failed to post to LinkedIn. Check backend.");
        } finally {
            setIsPosting(false);
        }
    };

    const disconnectLinkedIn = async () => {
        if (!window.confirm("Are you sure you want to disconnect your LinkedIn account?")) return;

        try {
            const decoded = jwtDecode(token);
            const userId = decoded.id;

            localStorage.removeItem("linkedin_account");

            const response = await fetch(`${BACKEND_URL}/api/linkedin/disconnect`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId })
            });
            const data = await response.json();

            if (data.success) {
                setMessage("✅ LinkedIn account disconnected successfully");
                setLinkedinAccount(null);
                setTimeout(() => {
                    // Use production frontend URL
                    window.location.href = `${FRONTEND_URL}/linkedin-connect?force=true&userId=${userId}`;
                }, 1500);
            } else {
                setError(data.error || "Failed to disconnect");
            }
        } catch (err) {
            console.error(err);
            setError("Failed to disconnect LinkedIn account");
        }
    };

    const reconnectLinkedIn = () => {
        const decoded = jwtDecode(token);
        const userId = decoded.id;
        // Use production backend URL for LinkedIn OAuth
        window.location.href = `${BACKEND_URL}/auth/linkedin?userId=${encodeURIComponent(userId)}`;
    };

    const viewPostOnLinkedIn = (postUrl) => {
        if (postUrl) window.open(postUrl, "_blank", "noopener,noreferrer");
    };

    if (isLoading) {
        return (
            <div style={styles.page}>
                <Navbar />
                <div style={styles.layout}>
                    <Sidebar onWidthChange={(w) => setSidebarWidth(w)} />
                    <main style={{
                        ...styles.content,
                        marginLeft: sidebarWidth,
                        transition: "0.3s ease",
                        marginTop: "60px",
                    }}>
                        <div style={styles.loadingContainer}>
                            <div style={styles.spinner}></div>
                            <p>Loading LinkedIn account information...</p>
                        </div>
                    </main>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div style={styles.page}>
            <Navbar />
            <div style={styles.layout}>
                <Sidebar onWidthChange={(w) => setSidebarWidth(w)} />

                <main style={{
                    ...styles.content,
                    marginLeft: sidebarWidth,
                    transition: "0.3s ease",
                    marginTop: "60px",
                }}>
                    <div style={styles.header}>
                        <h2>LinkedIn Manager</h2>
                        {linkedinAccount && (
                            <button 
                                onClick={reconnectLinkedIn}
                                style={styles.reconnectButton}
                            >
                                🔄 Reconnect
                            </button>
                        )}
                    </div>
                    
                    {message && (
                        <div style={styles.successBox}>
                            ✅ {message}
                            {message.includes("published") && (
                                <button 
                                    onClick={() => setMessage("")}
                                    style={styles.closeButton}
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    )}
                    
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

                    {linkedinAccount ? (
                        <div style={styles.container}>
                            <div style={styles.card}>
                                <div style={styles.accountHeader}>
                                    <img 
                                        src={linkedinAccount.profileImage} 
                                        alt="Profile" 
                                        style={styles.profileImage}
                                        onError={(e) => {
                                            e.target.src = "https://cdn-icons-png.flaticon.com/512/174/174857.png";
                                        }}
                                    />
                                    <div style={styles.accountInfo}>
                                        <h3>{linkedinAccount.name}</h3>
                                        {linkedinAccount.headline && (
                                            <p style={styles.headline}>{linkedinAccount.headline}</p>
                                        )}
                                        <p style={styles.connectedDate}>
                                            Connected: {new Date(linkedinAccount.connectedAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                <div style={styles.section}>
                                    <h4>Create a Post</h4>
                                    <textarea
                                        value={postContent}
                                        onChange={(e) => setPostContent(e.target.value)}
                                        placeholder="What do you want to share with your network?"
                                        style={styles.postInput}
                                        maxLength={3000}
                                        rows={5}
                                    />
                                    <div style={styles.charCount}>
                                        <span style={{ color: postContent.length > 2800 ? "#ff4d4f" : "#666" }}>
                                            {postContent.length}
                                        </span>/3000 characters
                                    </div>
                                    
                                    <div style={styles.visibilitySection}>
                                        <label style={styles.visibilityLabel}>Visibility:</label>
                                        <select 
                                            value={visibility}
                                            onChange={(e) => setVisibility(e.target.value)}
                                            style={styles.visibilitySelect}
                                        >
                                            <option value="PUBLIC">Public</option>
                                            <option value="CONNECTIONS">Connections Only</option>
                                        </select>
                                    </div>
                                    
                                    <button
                                        onClick={postToLinkedIn}
                                        disabled={isPosting || !postContent.trim()}
                                        style={{
                                            ...styles.postButton,
                                            opacity: (!postContent.trim() || isPosting) ? 0.7 : 1,
                                            cursor: (!postContent.trim() || isPosting) ? 'not-allowed' : 'pointer'
                                        }}
                                    >
                                        {isPosting ? (
                                            <>
                                                <span style={styles.buttonSpinner}></span>
                                                Publishing...
                                            </>
                                        ) : "Publish Post"}
                                    </button>
                                </div>

                                {postedUpdates.length > 0 && (
                                    <div style={styles.section}>
                                        <h4>Recent Posts</h4>
                                        <div style={styles.postsList}>
                                            {postedUpdates.slice(0, 3).map((update, index) => (
                                                <div key={index} style={styles.postItem}>
                                                    <p style={styles.postContent}>{update.content}</p>
                                                    <div style={styles.postActions}>
                                                        <div style={styles.postMeta}>
                                                            <span style={styles.postTime}>
                                                                {new Date(update.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                            <span style={styles.visibilityBadge}>
                                                                {update.visibility === "PUBLIC" ? "🌐 Public" : "👥 Connections"}
                                                            </span>
                                                        </div>
                                                        {update.url && (
                                                            <button 
                                                                onClick={() => viewPostOnLinkedIn(update.url)}
                                                                style={styles.viewPostButton}
                                                            >
                                                                View on LinkedIn
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div style={styles.section}>
                                    <h4>Account Actions</h4>
                                    <button
                                        onClick={disconnectLinkedIn}
                                        style={styles.disconnectButton}
                                    >
                                        🚫 Disconnect LinkedIn Account
                                    </button>
                                    <p style={styles.note}>
                                        Note: Disconnecting will remove your LinkedIn access. You'll need to reconnect to post updates.
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div style={styles.container}>
                            <div style={styles.card}>
                                <div style={styles.iconContainer}>
                                    <svg style={styles.linkedinIcon} viewBox="0 0 24 24">
                                        <path fill="currentColor" d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z"/>
                                    </svg>
                                </div>
                                <h3>LinkedIn Account Not Connected</h3>
                                <p>Please connect your LinkedIn account to start sharing updates and managing your professional content.</p>
                                <button
                                    onClick={reconnectLinkedIn}
                                    style={styles.connectButton}
                                >
                                    Connect LinkedIn Account
                                </button>
                            </div>
                        </div>
                    )}
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
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px"
    },
    reconnectButton: {
        background: "#0077B5",
        color: "white",
        padding: "8px 16px",
        border: "none",
        borderRadius: "20px",
        cursor: "pointer",
        fontSize: "14px",
        display: "flex",
        alignItems: "center",
        gap: "5px"
    },
    loadingContainer: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "50vh",
        color: "#666"
    },
    spinner: {
        border: "4px solid #f3f3f3",
        borderTop: "4px solid #0077B5",
        borderRadius: "50%",
        width: "40px",
        height: "40px",
        animation: "spin 1s linear infinite",
        marginBottom: "20px"
    },
    container: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "60vh"
    },
    card: { 
        background: "white", 
        padding: "40px",
        borderRadius: "16px", 
        boxShadow: "0px 5px 15px rgba(0,0,0,0.1)", 
        maxWidth: "600px",
        width: "100%"
    },
    successBox: {
        backgroundColor: "#e7f7ef",
        color: "#0a7c42",
        padding: "15px",
        borderRadius: "8px",
        marginBottom: "20px",
        borderLeft: "4px solid #0a7c42",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
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
        alignItems: "center"
    },
    closeButton: {
        background: "none",
        border: "none",
        color: "inherit",
        fontSize: "18px",
        cursor: "pointer",
        padding: "0",
        marginLeft: "10px"
    },
    accountHeader: {
        display: "flex",
        alignItems: "center",
        gap: "20px",
        marginBottom: "30px",
        paddingBottom: "20px",
        borderBottom: "1px solid #eee"
    },
    profileImage: {
        width: "80px",
        height: "80px",
        borderRadius: "50%",
        objectFit: "cover",
        border: "3px solid #0077B5"
    },
    accountInfo: {
        flex: 1
    },
    headline: {
        color: "#666",
        margin: "5px 0",
        fontSize: "15px",
        fontStyle: "italic"
    },
    connectedDate: {
        color: "#999",
        fontSize: "14px",
        marginTop: "5px"
    },
    section: {
        marginBottom: "30px",
        paddingBottom: "20px",
        borderBottom: "1px solid #eee"
    },
    postInput: {
        width: "100%",
        padding: "15px",
        borderRadius: "8px",
        border: "1px solid #ddd",
        fontSize: "16px",
        marginBottom: "10px",
        resize: "vertical",
        fontFamily: "inherit",
        boxSizing: "border-box"
    },
    charCount: {
        textAlign: "right",
        color: "#666",
        fontSize: "14px",
        marginBottom: "15px"
    },
    visibilitySection: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        marginBottom: "15px"
    },
    visibilityLabel: {
        fontSize: "14px",
        color: "#666",
        fontWeight: "500"
    },
    visibilitySelect: {
        padding: "8px 12px",
        borderRadius: "6px",
        border: "1px solid #ddd",
        backgroundColor: "white",
        fontSize: "14px",
        color: "#333"
    },
    postButton: {
        background: "#0077B5",
        color: "white",
        padding: "12px 25px",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "16px",
        fontWeight: "bold",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px"
    },
    buttonSpinner: {
        border: "2px solid rgba(255,255,255,0.3)",
        borderTop: "2px solid white",
        borderRadius: "50%",
        width: "16px",
        height: "16px",
        animation: "spin 1s linear infinite"
    },
    postsList: {
        marginTop: "15px"
    },
    postItem: {
        padding: "15px",
        backgroundColor: "#f8f9fa",
        borderRadius: "8px",
        marginBottom: "10px",
        borderLeft: "3px solid #0077B5"
    },
    postContent: {
        margin: "0 0 10px 0",
        lineHeight: "1.5",
        fontSize: "15px"
    },
    postActions: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
    },
    postMeta: {
        display: "flex",
        alignItems: "center",
        gap: "10px"
    },
    postTime: {
        color: "#666",
        fontSize: "13px"
    },
    visibilityBadge: {
        fontSize: "12px",
        color: "#0077B5",
        backgroundColor: "#eef3f8",
        padding: "3px 8px",
        borderRadius: "12px"
    },
    viewPostButton: {
        background: "none",
        color: "#0077B5",
        border: "1px solid #0077B5",
        padding: "5px 12px",
        borderRadius: "15px",
        fontSize: "13px",
        cursor: "pointer"
    },
    disconnectButton: {
        background: "#ff4d4f",
        color: "white",
        padding: "12px 25px",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "16px",
        fontWeight: "bold",
        width: "100%",
        marginBottom: "10px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px"
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
        width: "100%",
        marginTop: "20px"
    },
    iconContainer: {
        display: "flex",
        justifyContent: "center",
        marginBottom: "20px"
    },
    linkedinIcon: {
        width: "60px",
        height: "60px",
        color: "#0077B5"
    },
    note: {
        color: "#666",
        fontSize: "14px",
        fontStyle: "italic",
        marginTop: "10px"
    }
};

// Add CSS animations
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(`
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`, styleSheet.cssRules.length);