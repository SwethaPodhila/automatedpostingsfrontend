import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import { jwtDecode } from "jwt-decode";

export default function TwitterPublisher() {
    const BACKEND_URL = "https://automatedpostingbackend.onrender.com";
    
    const [sidebarWidth, setSidebarWidth] = useState(50);
    const [twitterAccount, setTwitterAccount] = useState(null);
    const [tweetContent, setTweetContent] = useState("");
    const [isPosting, setIsPosting] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [posts, setPosts] = useState([]);
    const [showSchedule, setShowSchedule] = useState(false);
    const [scheduleTime, setScheduleTime] = useState("");
    const [aiPrompt, setAiPrompt] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);

    const token = localStorage.getItem("token");

    useEffect(() => {
        if (!token) {
            window.location.href = "/login";
            return;
        }

        loadTwitterAccount();
        loadPosts();
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

    const loadPosts = async () => {
        try {
            const decoded = jwtDecode(token);
            const userId = decoded.id;

            const response = await fetch(`${BACKEND_URL}/api/twitter/posts?userId=${userId}`);
            const data = await response.json();

            if (data.success) {
                setPosts(data.posts || []);
            }
        } catch (err) {
            console.error("❌ Error loading posts:", err);
        }
    };

    const generateAICaption = async () => {
        if (!aiPrompt.trim()) {
            setError("Please enter a prompt for AI generation");
            return;
        }

        setIsGenerating(true);
        setError("");

        try {
            const response = await fetch(`${BACKEND_URL}/api/twitter/ai-generate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: aiPrompt })
            });
            const data = await response.json();

            if (data.success && data.text) {
                setTweetContent(data.text);
                setAiPrompt("");
                setMessage("✅ AI caption generated successfully!");
            } else if (data.text) {
                setTweetContent(data.text);
                setAiPrompt("");
                setMessage("✅ AI caption generated successfully!");
            } else {
                setError(data.error || "Failed to generate caption");
            }
        } catch (err) {
            console.error("❌ AI Generation error:", err);
            setError("Failed to generate AI caption");
        } finally {
            setIsGenerating(false);
        }
    };

    const publishTweet = async () => {
        if (!tweetContent.trim()) {
            setError("Please enter tweet content");
            return;
        }

        if (tweetContent.length > 280) {
            setError("Tweet cannot exceed 280 characters");
            return;
        }

        // Validate schedule time if enabled
        if (showSchedule && scheduleTime) {
            const scheduleDate = new Date(scheduleTime);
            const now = new Date();
            if (scheduleDate <= now) {
                setError("Schedule time must be in the future");
                return;
            }
        }

        setIsPosting(true);
        setError("");
        setMessage("");

        try {
            const decoded = jwtDecode(token);
            const userId = decoded.id;

            const postData = {
                userId: userId,
                content: tweetContent,
                scheduleTime: showSchedule && scheduleTime ? scheduleTime : null
            };

            console.log("📤 Sending tweet data:", postData);

            const response = await fetch(`${BACKEND_URL}/api/twitter/publish`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(postData)
            });
            
            const data = await response.json();
            console.log("📤 API Response:", data);

            if (data.success) {
                if (data.type === "scheduled") {
                    setMessage(`✅ Tweet scheduled for ${new Date(scheduleTime).toLocaleString()}!`);
                } else {
                    setMessage(`✅ Tweet posted successfully! ${data.tweetUrl ? `View it here: ${data.tweetUrl}` : ''}`);
                }
                
                // Reset form
                setTweetContent("");
                setScheduleTime("");
                setShowSchedule(false);
                setAiPrompt("");
                
                // Reload posts after delay
                setTimeout(() => {
                    loadPosts();
                }, 1000);
            } else {
                setError(data.error || "Failed to publish tweet");
                
                // Check for specific error codes
                if (data.code === "AUTH_EXPIRED") {
                    setError("Twitter authentication expired. Please reconnect your account.");
                    localStorage.removeItem("twitter_account");
                    setTwitterAccount(null);
                } else if (data.code === "RATE_LIMIT") {
                    setError("Rate limit exceeded. Please wait a few minutes and try again.");
                }
            }
        } catch (err) {
            console.error("❌ Publish error:", err);
            setError("Failed to publish tweet. Please check your connection and try again.");
        } finally {
            setIsPosting(false);
        }
    };

    const deleteScheduledPost = async (postId) => {
        if (!window.confirm("Are you sure you want to delete this scheduled tweet?")) return;

        try {
            const decoded = jwtDecode(token);
            const userId = decoded.id;

            const response = await fetch(`${BACKEND_URL}/api/twitter/post/delete`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ postId, userId })
            });
            
            const data = await response.json();

            if (data.success) {
                setMessage("✅ Scheduled tweet deleted successfully!");
                loadPosts(); // Refresh the list
            } else {
                setError(data.error || "Failed to delete scheduled tweet");
            }
        } catch (err) {
            console.error("❌ Delete error:", err);
            setError("Failed to delete scheduled tweet");
        }
    };

    const formatDateTimeLocal = (date) => {
        const d = new Date(date);
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
        return d.toISOString().slice(0, 16);
    };

    const clearMessages = () => {
        setMessage("");
        setError("");
    };

    const testBackendConnection = async () => {
        try {
            const response = await fetch(`${BACKEND_URL}/health`);
            const data = await response.json();
            console.log("🔗 Backend health check:", data);
            return data.status === "OK";
        } catch (err) {
            console.error("❌ Backend connection failed:", err);
            return false;
        }
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
                            <p>Loading Twitter publisher...</p>
                        </div>
                    </main>
                </div>
                <Footer />
            </div>
        );
    }

    if (!twitterAccount) {
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
                                    onClick={() => window.location.href = "/twitter-connect"}
                                    style={styles.connectButton}
                                >
                                    Connect Twitter Account
                                </button>
                            </div>
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
                    padding: "30px 40px"
                }}>
                    <div style={styles.header}>
                        <div style={styles.headerLeft}>
                            <h2>Twitter Publisher</h2>
                            <button 
                                onClick={testBackendConnection}
                                style={styles.testButton}
                                title="Test backend connection"
                            >
                                🔗 Test Connection
                            </button>
                        </div>
                        <div style={styles.accountBadge}>
                            <img 
                                src={twitterAccount.profileImage} 
                                alt="Profile" 
                                style={styles.badgeImage}
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = `https://ui-avatars.com/api/?name=${twitterAccount.username}&background=1DA1F2&color=fff`;
                                }}
                            />
                            <div style={styles.accountInfo}>
                                <strong>@{twitterAccount.username}</strong>
                                <small>Connected: {new Date(twitterAccount.connectedAt).toLocaleDateString()}</small>
                            </div>
                        </div>
                    </div>
                    
                    {message && (
                        <div style={styles.successBox}>
                            <span>✅ {message}</span>
                            <button 
                                onClick={clearMessages}
                                style={styles.closeButton}
                            >
                                ✕
                            </button>
                        </div>
                    )}
                    
                    {error && (
                        <div style={styles.errorBox}>
                            <span>❌ {error}</span>
                            <button 
                                onClick={clearMessages}
                                style={styles.closeButton}
                            >
                                ✕
                            </button>
                        </div>
                    )}

                    <div style={styles.publisherContainer}>
                        {/* Left Column: Tweet Composer */}
                        <div style={styles.composerCard}>
                            <h3 style={styles.sectionTitle}>Compose Tweet</h3>
                            
                            {/* AI Caption Generator */}
                            <div style={styles.aiSection}>
                                <div style={styles.aiHeader}>
                                    <h4>🤖 AI Caption Generator</h4>
                                    <small style={styles.aiHint}>Enter a topic and let AI create a tweet for you</small>
                                </div>
                                <div style={styles.aiInputGroup}>
                                    <input
                                        type="text"
                                        value={aiPrompt}
                                        onChange={(e) => setAiPrompt(e.target.value)}
                                        placeholder="Enter topic (e.g., 'Morning motivation', 'Tech news', 'Product launch')"
                                        style={styles.aiInput}
                                        onKeyPress={(e) => e.key === 'Enter' && generateAICaption()}
                                    />
                                    <button
                                        onClick={generateAICaption}
                                        disabled={isGenerating || !aiPrompt.trim()}
                                        style={styles.aiButton}
                                    >
                                        {isGenerating ? (
                                            <>
                                                <span style={styles.buttonSpinner}></span>
                                                Generating...
                                            </>
                                        ) : "✨ Generate"}
                                    </button>
                                </div>
                            </div>
                            
                            {/* Tweet Textarea */}
                            <div style={styles.textareaContainer}>
                                <textarea
                                    value={tweetContent}
                                    onChange={(e) => setTweetContent(e.target.value)}
                                    placeholder="What's happening?"
                                    style={styles.tweetInput}
                                    maxLength={280}
                                    rows={6}
                                />
                                <div style={styles.charCount}>
                                    <span style={{ 
                                        color: tweetContent.length > 260 ? "#ff4d4f" : 
                                               tweetContent.length > 230 ? "#ffa500" : "#657786" 
                                    }}>
                                        {tweetContent.length}
                                    </span>/280 characters
                                    {tweetContent.length > 260 && (
                                        <span style={styles.charWarning}> (Almost full!)</span>
                                    )}
                                </div>
                            </div>
                            
                            {/* Scheduling */}
                            <div style={styles.scheduleSection}>
                                <label style={styles.scheduleToggle}>
                                    <input
                                        type="checkbox"
                                        checked={showSchedule}
                                        onChange={(e) => setShowSchedule(e.target.checked)}
                                        style={styles.checkbox}
                                    />
                                    <span style={styles.scheduleLabel}>
                                        📅 Schedule this tweet
                                    </span>
                                </label>
                                
                                {showSchedule && (
                                    <div style={styles.schedulePicker}>
                                        <div style={styles.datetimeGroup}>
                                            <label style={styles.datetimeLabel}>Schedule Date & Time:</label>
                                            <input
                                                type="datetime-local"
                                                value={scheduleTime}
                                                onChange={(e) => setScheduleTime(e.target.value)}
                                                min={formatDateTimeLocal(new Date())}
                                                style={styles.datetimeInput}
                                            />
                                        </div>
                                        <p style={styles.scheduleHint}>
                                            ⏰ Tweet will be published automatically at the scheduled time
                                        </p>
                                    </div>
                                )}
                            </div>
                            
                            {/* Post Button */}
                            <button
                                onClick={publishTweet}
                                disabled={isPosting || !tweetContent.trim()}
                                style={{
                                    ...styles.publishButton,
                                    opacity: !tweetContent.trim() ? 0.6 : 1,
                                    cursor: !tweetContent.trim() ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {isPosting ? (
                                    <>
                                        <span style={styles.buttonSpinner}></span>
                                        {showSchedule && scheduleTime ? "Scheduling..." : "Posting..."}
                                    </>
                                ) : (
                                    showSchedule && scheduleTime ? (
                                        <>
                                            <span style={styles.calendarIcon}>📅</span>
                                            Schedule Tweet
                                        </>
                                    ) : (
                                        <>
                                            <span style={styles.birdIcon}>🐦</span>
                                            Post Tweet
                                        </>
                                    )
                                )}
                            </button>
                        </div>
                        
                        {/* Right Column: Recent Posts */}
                        <div style={styles.postsCard}>
                            <div style={styles.postsHeader}>
                                <h3 style={styles.sectionTitle}>Recent Posts</h3>
                                <button 
                                    onClick={loadPosts}
                                    style={styles.refreshSmallButton}
                                    title="Refresh posts"
                                >
                                    🔄
                                </button>
                            </div>
                            
                            {posts.length === 0 ? (
                                <div style={styles.emptyPosts}>
                                    <div style={styles.emptyIcon}>📭</div>
                                    <p>No tweets posted yet</p>
                                    <small>Your published tweets will appear here</small>
                                </div>
                            ) : (
                                <div style={styles.postsList}>
                                    {posts.slice(0, 8).map((post, index) => (
                                        <div key={post._id || index} style={styles.postItem}>
                                            <div style={styles.postHeader}>
                                                <span style={{
                                                    ...styles.statusBadge,
                                                    backgroundColor: post.status === 'posted' ? '#e7f7ef' :
                                                                   post.status === 'scheduled' ? '#fff3cd' :
                                                                   post.status === 'failed' ? '#ffe6e6' :
                                                                   '#f0f0f0',
                                                    color: post.status === 'posted' ? '#0a7c42' :
                                                          post.status === 'scheduled' ? '#856404' :
                                                          post.status === 'failed' ? '#d32f2f' :
                                                          '#666'
                                                }}>
                                                    {post.status?.charAt(0).toUpperCase() + post.status?.slice(1)}
                                                </span>
                                                {post.status === 'scheduled' && post.scheduledTime && (
                                                    <span style={styles.scheduledTime}>
                                                        📅 {new Date(post.scheduledTime).toLocaleString()}
                                                    </span>
                                                )}
                                                {post.status === 'posted' && post.postedAt && (
                                                    <span style={styles.postedTime}>
                                                        🕐 {new Date(post.postedAt).toLocaleString()}
                                                    </span>
                                                )}
                                            </div>
                                            
                                            <div style={styles.postContentContainer}>
                                                <p style={styles.postContent}>
                                                    {post.content?.length > 100 
                                                        ? post.content.substring(0, 100) + '...' 
                                                        : post.content
                                                    }
                                                </p>
                                                {post.mediaType && (
                                                    <div style={styles.postMedia}>
                                                        {post.mediaType === 'video' ? '🎥 Video' : '📸 Image'}
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div style={styles.postActions}>
                                                {post.status === 'scheduled' && (
                                                    <button
                                                        onClick={() => deleteScheduledPost(post._id)}
                                                        style={styles.deleteButton}
                                                    >
                                                        Delete
                                                    </button>
                                                )}
                                                {post.status === 'posted' && post.postUrl && (
                                                    <button
                                                        onClick={() => window.open(post.postUrl, '_blank')}
                                                        style={styles.viewButton}
                                                    >
                                                        View
                                                    </button>
                                                )}
                                                {post.status === 'failed' && (
                                                    <button
                                                        onClick={() => setError(post.error || 'Post failed')}
                                                        style={styles.errorButton}
                                                        title={post.error}
                                                    >
                                                        Error
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            
                            {posts.length > 0 && (
                                <div style={styles.postsFooter}>
                                    <span style={styles.postsCount}>
                                        Showing {Math.min(posts.length, 8)} of {posts.length} posts
                                    </span>
                                    {posts.length > 8 && (
                                        <button 
                                            onClick={() => window.alert('View all posts feature coming soon!')}
                                            style={styles.viewAllButton}
                                        >
                                            View All
                                        </button>
                                    )}
                                </div>
                            )}
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
        background: "#f5f6fa"
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
        minHeight: "60vh",
        padding: "40px"
    },
    card: { 
        background: "white", 
        padding: "40px",
        borderRadius: "16px", 
        boxShadow: "0px 5px 15px rgba(0,0,0,0.1)", 
        maxWidth: "500px",
        width: "100%",
        textAlign: "center"
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
    connectButton: {
        background: "#1DA1F2",
        color: "white",
        padding: "15px 30px",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "16px",
        fontWeight: "bold",
        width: "100%",
        marginTop: "20px",
        transition: "background 0.3s",
        "&:hover": {
            background: "#0c8de4"
        }
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "30px",
        paddingBottom: "20px",
        borderBottom: "1px solid #e0e0e0"
    },
    headerLeft: {
        display: "flex",
        alignItems: "center",
        gap: "15px"
    },
    testButton: {
        background: "transparent",
        border: "1px solid #1DA1F2",
        color: "#1DA1F2",
        padding: "5px 10px",
        borderRadius: "4px",
        fontSize: "12px",
        cursor: "pointer",
        transition: "all 0.3s",
        "&:hover": {
            background: "#1DA1F2",
            color: "white"
        }
    },
    accountBadge: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        background: "white",
        padding: "10px 20px",
        borderRadius: "30px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        transition: "transform 0.2s",
        "&:hover": {
            transform: "translateY(-2px)"
        }
    },
    badgeImage: {
        width: "40px",
        height: "40px",
        borderRadius: "50%",
        objectFit: "cover",
        border: "2px solid #1DA1F2"
    },
    accountInfo: {
        display: "flex",
        flexDirection: "column",
        gap: "2px"
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
        alignItems: "center",
        animation: "slideIn 0.3s ease"
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
        animation: "slideIn 0.3s ease"
    },
    closeButton: {
        background: "none",
        border: "none",
        color: "inherit",
        fontSize: "18px",
        cursor: "pointer",
        padding: "0 5px",
        marginLeft: "10px",
        transition: "opacity 0.2s",
        "&:hover": {
            opacity: 0.7
        }
    },
    publisherContainer: {
        display: "grid",
        gridTemplateColumns: "2fr 1fr",
        gap: "30px"
    },
    composerCard: {
        background: "white",
        padding: "30px",
        borderRadius: "12px",
        boxShadow: "0 3px 15px rgba(0,0,0,0.08)"
    },
    postsCard: {
        background: "white",
        padding: "30px",
        borderRadius: "12px",
        boxShadow: "0 3px 15px rgba(0,0,0,0.08)",
        display: "flex",
        flexDirection: "column"
    },
    postsHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px"
    },
    refreshSmallButton: {
        background: "transparent",
        border: "1px solid #ddd",
        borderRadius: "6px",
        padding: "6px 10px",
        cursor: "pointer",
        fontSize: "14px",
        transition: "all 0.2s",
        "&:hover": {
            background: "#f5f6fa"
        }
    },
    sectionTitle: {
        marginBottom: "0",
        color: "#333",
        fontSize: "20px",
        fontWeight: "600"
    },
    aiSection: {
        marginBottom: "25px",
        padding: "20px",
        background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
        borderRadius: "10px",
        border: "1px solid #e0e0e0"
    },
    aiHeader: {
        marginBottom: "15px"
    },
    aiHint: {
        color: "#666",
        fontSize: "12px",
        display: "block",
        marginTop: "5px"
    },
    aiInputGroup: {
        display: "flex",
        gap: "10px"
    },
    aiInput: {
        flex: 1,
        padding: "12px",
        borderRadius: "6px",
        border: "1px solid #ddd",
        fontSize: "14px",
        transition: "border 0.3s",
        "&:focus": {
            outline: "none",
            borderColor: "#1DA1F2",
            boxShadow: "0 0 0 3px rgba(29, 161, 242, 0.1)"
        }
    },
    aiButton: {
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        border: "none",
        padding: "12px 20px",
        borderRadius: "6px",
        cursor: "pointer",
        fontSize: "14px",
        fontWeight: "500",
        minWidth: "100px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        transition: "transform 0.2s",
        "&:hover:not(:disabled)": {
            transform: "translateY(-1px)"
        },
        "&:disabled": {
            opacity: 0.6,
            cursor: "not-allowed"
        }
    },
    textareaContainer: {
        marginBottom: "25px"
    },
    tweetInput: {
        width: "100%",
        padding: "15px",
        borderRadius: "8px",
        border: "1px solid #ddd",
        fontSize: "16px",
        resize: "vertical",
        fontFamily: "inherit",
        boxSizing: "border-box",
        minHeight: "120px",
        transition: "border 0.3s",
        "&:focus": {
            outline: "none",
            borderColor: "#1DA1F2",
            boxShadow: "0 0 0 3px rgba(29, 161, 242, 0.1)"
        }
    },
    charCount: {
        textAlign: "right",
        color: "#657786",
        fontSize: "14px",
        marginTop: "8px",
        paddingRight: "5px"
    },
    charWarning: {
        color: "#ff4d4f",
        fontWeight: "500",
        marginLeft: "5px"
    },
    scheduleSection: {
        marginBottom: "25px"
    },
    scheduleToggle: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        cursor: "pointer",
        marginBottom: "15px",
        padding: "10px",
        borderRadius: "6px",
        transition: "background 0.2s",
        "&:hover": {
            background: "#f8f9fa"
        }
    },
    checkbox: {
        width: "18px",
        height: "18px",
        cursor: "pointer"
    },
    scheduleLabel: {
        fontSize: "14px",
        fontWeight: "500"
    },
    schedulePicker: {
        padding: "20px",
        background: "#fff3cd",
        borderRadius: "6px",
        border: "1px solid #ffeaa7",
        animation: "fadeIn 0.3s ease"
    },
    datetimeGroup: {
        marginBottom: "10px"
    },
    datetimeLabel: {
        display: "block",
        marginBottom: "8px",
        fontSize: "14px",
        fontWeight: "500",
        color: "#856404"
    },
    datetimeInput: {
        width: "100%",
        padding: "10px",
        borderRadius: "6px",
        border: "1px solid #ffeaa7",
        fontSize: "14px",
        background: "white"
    },
    scheduleHint: {
        color: "#856404",
        fontSize: "12px",
        marginTop: "10px",
        lineHeight: "1.4"
    },
    publishButton: {
        background: "linear-gradient(135deg, #1DA1F2 0%, #0c8de4 100%)",
        color: "white",
        padding: "16px",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "16px",
        fontWeight: "bold",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px",
        transition: "all 0.3s",
        "&:hover:not(:disabled)": {
            transform: "translateY(-2px)",
            boxShadow: "0 4px 12px rgba(29, 161, 242, 0.3)"
        },
        "&:disabled": {
            cursor: "not-allowed",
            opacity: 0.6
        }
    },
    buttonSpinner: {
        border: "2px solid rgba(255,255,255,0.3)",
        borderTop: "2px solid white",
        borderRadius: "50%",
        width: "16px",
        height: "16px",
        animation: "spin 1s linear infinite"
    },
    calendarIcon: {
        fontSize: "18px"
    },
    birdIcon: {
        fontSize: "18px"
    },
    emptyPosts: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
        color: "#666",
        textAlign: "center"
    },
    emptyIcon: {
        fontSize: "48px",
        marginBottom: "15px",
        opacity: 0.5
    },
    postsList: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: "15px",
        overflowY: "auto",
        maxHeight: "400px",
        paddingRight: "5px"
    },
    postItem: {
        padding: "15px",
        background: "#f8f9fa",
        borderRadius: "8px",
        border: "1px solid #e9ecef",
        transition: "transform 0.2s",
        "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
        }
    },
    postHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "10px"
    },
    statusBadge: {
        padding: "4px 10px",
        borderRadius: "12px",
        fontSize: "11px",
        fontWeight: "bold",
        textTransform: "uppercase",
        letterSpacing: "0.5px"
    },
    scheduledTime: {
        color: "#856404",
        fontSize: "11px",
        display: "flex",
        alignItems: "center",
        gap: "4px"
    },
    postedTime: {
        color: "#0a7c42",
        fontSize: "11px",
        display: "flex",
        alignItems: "center",
        gap: "4px"
    },
    postContentContainer: {
        marginBottom: "10px"
    },
    postContent: {
        margin: "8px 0",
        fontSize: "13px",
        lineHeight: "1.5",
        color: "#333"
    },
    postMedia: {
        display: "inline-block",
        padding: "4px 8px",
        background: "#e9ecef",
        borderRadius: "4px",
        fontSize: "11px",
        color: "#666",
        marginTop: "5px"
    },
    postActions: {
        display: "flex",
        justifyContent: "flex-end",
        gap: "8px",
        marginTop: "10px"
    },
    deleteButton: {
        background: "#ff4d4f",
        color: "white",
        border: "none",
        padding: "5px 10px",
        borderRadius: "4px",
        cursor: "pointer",
        fontSize: "12px",
        fontWeight: "500",
        transition: "background 0.2s",
        "&:hover": {
            background: "#e53935"
        }
    },
    viewButton: {
        background: "#1DA1F2",
        color: "white",
        border: "none",
        padding: "5px 10px",
        borderRadius: "4px",
        cursor: "pointer",
        fontSize: "12px",
        fontWeight: "500",
        transition: "background 0.2s",
        "&:hover": {
            background: "#0c8de4"
        }
    },
    errorButton: {
        background: "#ff9800",
        color: "white",
        border: "none",
        padding: "5px 10px",
        borderRadius: "4px",
        cursor: "pointer",
        fontSize: "12px",
        fontWeight: "500",
        transition: "background 0.2s",
        "&:hover": {
            background: "#f57c00"
        }
    },
    postsFooter: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: "20px",
        paddingTop: "15px",
        borderTop: "1px solid #e0e0e0"
    },
    postsCount: {
        fontSize: "12px",
        color: "#666"
    },
    viewAllButton: {
        background: "transparent",
        border: "1px solid #1DA1F2",
        color: "#1DA1F2",
        padding: "6px 12px",
        borderRadius: "4px",
        fontSize: "12px",
        cursor: "pointer",
        transition: "all 0.2s",
        "&:hover": {
            background: "#1DA1F2",
            color: "white"
        }
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

styleSheet.insertRule(`
    @keyframes slideIn {
        from { 
            opacity: 0; 
            transform: translateY(-10px); 
        }
        to { 
            opacity: 1; 
            transform: translateY(0); 
        }
    }
`, styleSheet.cssRules.length);

styleSheet.insertRule(`
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
`, styleSheet.cssRules.length);