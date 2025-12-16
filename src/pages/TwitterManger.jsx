import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import { jwtDecode } from "jwt-decode";

export default function TwitterManager() {
    const BACKEND_URL = "https://automatedpostingbackend.onrender.com";
    
    const [sidebarWidth, setSidebarWidth] = useState(50);
    const [twitterAccount, setTwitterAccount] = useState(null);
    const [tweetContent, setTweetContent] = useState("");
    const [isPosting, setIsPosting] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [postedTweets, setPostedTweets] = useState([]);

    const token = localStorage.getItem("token");

    // Android session verification function
    const verifyAndroidSession = async (sessionId) => {
        try {
            const response = await fetch(
                `${BACKEND_URL}/api/twitter/verify-session?session_id=${sessionId}`
            );
            const data = await response.json();
            
            if (data.success) {
                // Load Twitter account after verification
                loadTwitterAccount();
                setMessage("✅ Twitter connected successfully via Android!");
                // Clear the URL parameters
                window.history.replaceState({}, document.title, "/twitter-manager");
            } else {
                setError("Failed to verify Twitter session");
            }
        } catch (err) {
            console.error("Session verification error:", err);
            setError("Failed to verify Twitter session. Please try again.");
        }
    };

    useEffect(() => {
        if (!token) {
            window.location.href = "/login";
            return;
        }

        const urlParams = new URLSearchParams(window.location.search);
        
        // Check for Android callback first
        const sessionId = urlParams.get("session_id");
        const status = urlParams.get("status");
        
        if (sessionId && status === "success") {
            // This is an Android callback - verify the session
            verifyAndroidSession(sessionId);
            return;
        }

        // Check for web callback
        const twitterStatus = urlParams.get("twitter");
        const username = urlParams.get("username");

        if (twitterStatus === "connected" && username) {
            const account = {
                username,
                name: username,
                profileImage: `https://unavatar.io/twitter/${username}`,
                connectedAt: new Date().toISOString()
            };
            setTwitterAccount(account);
            localStorage.setItem("twitter_account", JSON.stringify(account));
            setMessage(`✅ Successfully connected to @${username}!`);
            window.history.replaceState({}, document.title, "/twitter-manager");
            setIsLoading(false);
            return;
        }

        loadTwitterAccount();
    }, [token]);

    const loadTwitterAccount = async () => {
        setIsLoading(true);
        try {
            const decoded = jwtDecode(token);
            const userId = decoded.id;

            const response = await fetch(`${BACKEND_URL}/api/twitter/check?userId=${userId}`);
            if (!response.ok) throw new Error(`API error: ${response.status}`);

            const data = await response.json();

            if (data.success && data.connected && data.account) {
                const account = {
                    username: data.account.username,
                    name: data.account.name || data.account.username,
                    profileImage: data.account.profileImage || `https://unavatar.io/twitter/${data.account.username}`,
                    connectedAt: data.account.connectedAt || new Date().toISOString()
                };
                setTwitterAccount(account);
                setError("");
                localStorage.setItem("twitter_account", JSON.stringify(account));
            } else {
                const savedAccount = localStorage.getItem("twitter_account");
                if (savedAccount) {
                    setTwitterAccount(JSON.parse(savedAccount));
                    setError("");
                } else {
                    setError("Twitter account not connected. Please connect first.");
                    localStorage.removeItem("twitter_account");
                }
            }
        } catch (err) {
            console.error("❌ Error loading Twitter account:", err);
            const savedAccount = localStorage.getItem("twitter_account");
            if (savedAccount) {
                setTwitterAccount(JSON.parse(savedAccount));
                setError("");
            } else {
                setError("Failed to load Twitter account. Please reconnect.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const postTweet = async () => {
        if (!tweetContent.trim()) {
            setError("Please enter tweet content");
            return;
        }
        if (tweetContent.length > 280) {
            setError("Tweet cannot exceed 280 characters");
            return;
        }

        setIsPosting(true);
        setError("");

        try {
            const decoded = jwtDecode(token);
            const userId = decoded.id;

            const response = await fetch(`${BACKEND_URL}/api/twitter/post`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, content: tweetContent })
            });
            const data = await response.json();

            if (data.success) {
                setMessage(`✅ Tweet posted successfully!`);
                const newTweet = {
                    id: data.tweetId,
                    content: tweetContent,
                    time: new Date().toISOString(),
                    url: data.tweetUrl
                };
                setPostedTweets(prev => [newTweet, ...prev]);
                setTweetContent("");
            } else {
                setError(data.error || "Failed to post tweet");
            }
        } catch (err) {
            console.error(err);
            setError("Failed to post tweet. Check backend.");
        } finally {
            setIsPosting(false);
        }
    };

    const disconnectTwitter = async () => {
        if (!window.confirm("Are you sure you want to disconnect your Twitter account?")) return;

        try {
            const decoded = jwtDecode(token);
            const userId = decoded.id;

            localStorage.removeItem("twitter_account");

            const response = await fetch(`${BACKEND_URL}/api/twitter/disconnect`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId })
            });
            const data = await response.json();

            if (data.success) {
                setMessage("✅ Twitter account disconnected successfully");
                setTwitterAccount(null);
                setTimeout(() => {
                    window.location.href = `/twitter-connect?force=true&userId=${userId}`;
                }, 1500);
            } else {
                setError(data.error || "Failed to disconnect");
            }
        } catch (err) {
            console.error(err);
            setError("Failed to disconnect Twitter account");
        }
    };

    const reconnectTwitter = () => {
        const decoded = jwtDecode(token);
        const userId = decoded.id;
        
        // Detect Android
        const isAndroid = /Android/i.test(navigator.userAgent);
        
        if (isAndroid) {
            // For Android - add platform parameter
            window.location.href = `${BACKEND_URL}/auth/twitter?userId=${encodeURIComponent(userId)}&platform=android`;
        } else {
            // For Web
            window.location.href = `${BACKEND_URL}/auth/twitter?userId=${encodeURIComponent(userId)}`;
        }
    };

    const viewTweetOnTwitter = (tweetUrl) => {
        if (tweetUrl) window.open(tweetUrl, "_blank", "noopener,noreferrer");
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
                            <p>Loading Twitter account information...</p>
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
                        <h2>Twitter Manager</h2>
                        {twitterAccount && (
                            <button 
                                onClick={reconnectTwitter}
                                style={styles.reconnectButton}
                            >
                                🔄 Reconnect
                            </button>
                        )}
                    </div>
                    
                    {message && (
                        <div style={styles.successBox}>
                            ✅ {message}
                            {message.includes("Tweet posted") && (
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

                    {twitterAccount ? (
                        <div style={styles.container}>
                            <div style={styles.card}>
                                <div style={styles.accountHeader}>
                                    <img 
                                        src={twitterAccount.profileImage || `https://unavatar.io/twitter/${twitterAccount.username}`} 
                                        alt="Profile" 
                                        style={styles.profileImage}
                                        onError={(e) => {
                                            e.target.src = "https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png";
                                        }}
                                    />
                                    <div style={styles.accountInfo}>
                                        <h3>{twitterAccount.name || twitterAccount.username}</h3>
                                        <p style={styles.username}>@{twitterAccount.username}</p>
                                        <p style={styles.connectedDate}>
                                            Connected: {new Date(twitterAccount.connectedAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                <div style={styles.section}>
                                    <h4>Post a Tweet</h4>
                                    <textarea
                                        value={tweetContent}
                                        onChange={(e) => setTweetContent(e.target.value)}
                                        placeholder="What's happening?"
                                        style={styles.tweetInput}
                                        maxLength={280}
                                        rows={4}
                                    />
                                    <div style={styles.charCount}>
                                        <span style={{ color: tweetContent.length > 260 ? "#ff4d4f" : "#657786" }}>
                                            {tweetContent.length}
                                        </span>/280 characters
                                    </div>
                                    <button
                                        onClick={postTweet}
                                        disabled={isPosting || !tweetContent.trim()}
                                        style={{
                                            ...styles.postButton,
                                            opacity: (!tweetContent.trim() || isPosting) ? 0.7 : 1,
                                            cursor: (!tweetContent.trim() || isPosting) ? 'not-allowed' : 'pointer'
                                        }}
                                    >
                                        {isPosting ? (
                                            <>
                                                <span style={styles.buttonSpinner}></span>
                                                Posting...
                                            </>
                                        ) : "Post Tweet"}
                                    </button>
                                </div>

                                {postedTweets.length > 0 && (
                                    <div style={styles.section}>
                                        <h4>Recent Tweets</h4>
                                        <div style={styles.tweetsList}>
                                            {postedTweets.slice(0, 3).map((tweet, index) => (
                                                <div key={index} style={styles.tweetItem}>
                                                    <p style={styles.tweetContent}>{tweet.content}</p>
                                                    <div style={styles.tweetActions}>
                                                        <span style={styles.tweetTime}>
                                                            {new Date(tweet.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                        {tweet.url && (
                                                            <button 
                                                                onClick={() => viewTweetOnTwitter(tweet.url)}
                                                                style={styles.viewTweetButton}
                                                            >
                                                                View on Twitter
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
                                        onClick={disconnectTwitter}
                                        style={styles.disconnectButton}
                                    >
                                        🚫 Disconnect Twitter Account
                                    </button>
                                    <p style={styles.note}>
                                        Note: Disconnecting will remove your Twitter access. You'll need to reconnect to post tweets.
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div style={styles.container}>
                            <div style={styles.card}>
                                <div style={styles.iconContainer}>
                                    <svg style={styles.twitterIcon} viewBox="0 0 24 24">
                                        <path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                                    </svg>
                                </div>
                                <h3>Twitter Account Not Connected</h3>
                                <p>Please connect your Twitter account to start posting tweets and managing your content.</p>
                                <button
                                    onClick={reconnectTwitter}
                                    style={styles.connectButton}
                                >
                                    Connect Twitter Account
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
        background: "#1DA1F2",
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
        borderTop: "4px solid #1DA1F2",
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
        border: "3px solid #1DA1F2"
    },
    accountInfo: {
        flex: 1
    },
    username: {
        color: "#657786",
        margin: "5px 0",
        fontSize: "16px"
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
    tweetInput: {
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
        color: "#657786",
        fontSize: "14px",
        marginBottom: "15px"
    },
    postButton: {
        background: "#1DA1F2",
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
    tweetsList: {
        marginTop: "15px"
    },
    tweetItem: {
        padding: "15px",
        backgroundColor: "#f8f9fa",
        borderRadius: "8px",
        marginBottom: "10px",
        borderLeft: "3px solid #1DA1F2"
    },
    tweetContent: {
        margin: "0 0 10px 0",
        lineHeight: "1.5"
    },
    tweetActions: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
    },
    tweetTime: {
        color: "#657786",
        fontSize: "13px"
    },
    viewTweetButton: {
        background: "none",
        color: "#1DA1F2",
        border: "1px solid #1DA1F2",
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
        background: "#000",
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
    twitterIcon: {
        width: "60px",
        height: "60px",
        color: "#000"
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