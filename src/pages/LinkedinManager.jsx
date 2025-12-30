import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import { jwtDecode } from "jwt-decode";

export default function LinkedInManager() {
    // Local URLs
    const BACKEND_URL = "https://automatedpostingbackend.onrender.com";
    const FRONTEND_URL = "https://automatedpostingfrontend.onrender.com";
    
    const [sidebarWidth, setSidebarWidth] = useState(50);
    const [linkedinAccount, setLinkedinAccount] = useState(null);
    const [postContent, setPostContent] = useState("");
    const [isPosting, setIsPosting] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [posts, setPosts] = useState([]);
    const [showSchedule, setShowSchedule] = useState(false);
    const [scheduleTime, setScheduleTime] = useState("");
    const [aiPrompt, setAiPrompt] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [mediaFile, setMediaFile] = useState(null);
    const [mediaPreview, setMediaPreview] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [showProgress, setShowProgress] = useState(false);
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
        loadPosts();
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

    const loadPosts = async () => {
        try {
            const decoded = jwtDecode(token);
            const userId = decoded.id;

            const response = await fetch(`${BACKEND_URL}/api/linkedin/posts?userId=${userId}`);
            const data = await response.json();

            if (data.success) {
                setPosts(data.posts || []);
            }
        } catch (err) {
            console.error("❌ Error loading posts:", err);
        }
    };

    const handleMediaChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Check file type
        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');
        
        if (!isImage && !isVideo) {
            setError("Please select an image or video file");
            return;
        }

        // Check file size (LinkedIn: 10MB max)
        const maxSize = 10 * 1024 * 1024; // 10MB for LinkedIn
        
        if (file.size > maxSize) {
            setError("File size exceeds 10MB limit");
            return;
        }

        setMediaFile(file);
        setError("");
        
        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setMediaPreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const removeMedia = () => {
        setMediaFile(null);
        setMediaPreview(null);
        setError("");
    };

    const generateAICaption = async () => {
        if (!aiPrompt.trim()) {
            setError("Please enter a prompt for AI generation");
            return;
        }

        setIsGenerating(true);
        setError("");

        try {
            const response = await fetch(`${BACKEND_URL}/api/linkedin/ai-generate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: aiPrompt })
            });
            const data = await response.json();

            if (data.success && data.text) {
                setPostContent(data.text);
                setAiPrompt("");
                setMessage("✅ AI caption generated successfully!");
            } else if (data.text) {
                setPostContent(data.text);
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

    const simulateUploadProgress = () => {
        setShowProgress(true);
        setUploadProgress(0);
        
        const interval = setInterval(() => {
            setUploadProgress(prev => {
                if (prev >= 95) {
                    clearInterval(interval);
                    return 95;
                }
                return prev + 5;
            });
        }, 100);
        
        return interval;
    };

    const postToLinkedIn = async () => {
        if (!postContent.trim() && !mediaFile) {
            setError("Please enter post content or select media");
            return;
        }

        if (postContent.length > 3000) {
            setError("Post cannot exceed 3000 characters");
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

        // Simulate upload progress
        const progressInterval = simulateUploadProgress();

        try {
            const decoded = jwtDecode(token);
            const userId = decoded.id;

            const formData = new FormData();
            formData.append("userId", userId);
            formData.append("content", postContent);
            formData.append("visibility", visibility);
            
            if (mediaFile) {
                formData.append("media", mediaFile);
                console.log("📤 Uploading media file:", mediaFile.name, mediaFile.type);
            }
            
            if (showSchedule && scheduleTime) {
                formData.append("scheduleTime", scheduleTime);
            }

            const response = await fetch(`${BACKEND_URL}/api/linkedin/post`, {
                method: "POST",
                body: formData
            });
            
            clearInterval(progressInterval);
            setUploadProgress(100);
            
            const data = await response.json();
            console.log("📤 API Response:", data);

            if (data.success) {
                if (data.type === "scheduled") {
                    setMessage(`✅ Post scheduled for ${new Date(scheduleTime).toLocaleString()}!`);
                } else {
                    setMessage(`✅ Post published successfully! ${data.postUrl ? `View it here: ${data.postUrl}` : ''}`);
                }
                
                // Reset form
                setPostContent("");
                setMediaFile(null);
                setMediaPreview(null);
                setScheduleTime("");
                setShowSchedule(false);
                setAiPrompt("");
                
                // Reload posts after delay
                setTimeout(() => {
                    loadPosts();
                }, 1000);
            } else {
                setError(data.error || "Failed to publish post");
            }
        } catch (err) {
            console.error("❌ Post error:", err);
            setError("Failed to publish post. Please check your connection and try again.");
        } finally {
            setIsPosting(false);
            setTimeout(() => {
                setShowProgress(false);
                setUploadProgress(0);
            }, 1000);
        }
    };

    const deleteScheduledPost = async (postId) => {
        if (!window.confirm("Are you sure you want to delete this scheduled post?")) return;

        try {
            const decoded = jwtDecode(token);
            const userId = decoded.id;

            const response = await fetch(`${BACKEND_URL}/api/linkedin/post/delete`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ postId, userId })
            });
            
            const data = await response.json();

            if (data.success) {
                setMessage("✅ Scheduled post deleted successfully!");
                loadPosts(); // Refresh the list
            } else {
                setError(data.error || "Failed to delete scheduled post");
            }
        } catch (err) {
            console.error("❌ Delete error:", err);
            setError("Failed to delete scheduled post");
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
        window.location.href = `${BACKEND_URL}/auth/linkedin?userId=${encodeURIComponent(userId)}`;
    };

    const viewPostOnLinkedIn = (postUrl) => {
        if (postUrl) window.open(postUrl, "_blank", "noopener,noreferrer");
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

    if (!linkedinAccount) {
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
                            <h2>LinkedIn Publisher</h2>
                        </div>
                        <div style={styles.accountBadge}>
                            <img 
                                src={linkedinAccount.profileImage} 
                                alt="Profile" 
                                style={styles.badgeImage}
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = `https://ui-avatars.com/api/?name=${linkedinAccount.name}&background=0077B5&color=fff`;
                                }}
                            />
                            <div style={styles.accountInfo}>
                                <strong>{linkedinAccount.name}</strong>
                                {linkedinAccount.headline && (
                                    <small>{linkedinAccount.headline}</small>
                                )}
                                <small>Connected: {new Date(linkedinAccount.connectedAt).toLocaleDateString()}</small>
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

                    {showProgress && (
                        <div style={styles.progressContainer}>
                            <div style={styles.progressLabel}>Uploading media... {uploadProgress}%</div>
                            <div style={styles.progressBar}>
                                <div 
                                    style={{
                                        ...styles.progressFill,
                                        width: `${uploadProgress}%`
                                    }}
                                ></div>
                            </div>
                        </div>
                    )}

                    <div style={styles.publisherContainer}>
                        {/* Left Column: Post Composer */}
                        <div style={styles.composerCard}>
                            <h3 style={styles.sectionTitle}>Create LinkedIn Post</h3>
                            
                            {/* AI Caption Generator */}
                            <div style={styles.aiSection}>
                                <div style={styles.aiHeader}>
                                    <h4>🤖 AI Content Generator</h4>
                                    <small style={styles.aiHint}>Enter a topic and let AI create professional content</small>
                                </div>
                                <div style={styles.aiInputGroup}>
                                    <input
                                        type="text"
                                        value={aiPrompt}
                                        onChange={(e) => setAiPrompt(e.target.value)}
                                        placeholder="Enter topic (e.g., 'Career advice', 'Industry trends', 'Professional development')"
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
                            
                            {/* Post Textarea */}
                            <div style={styles.textareaContainer}>
                                <textarea
                                    value={postContent}
                                    onChange={(e) => setPostContent(e.target.value)}
                                    placeholder="What do you want to share with your professional network?"
                                    style={styles.postInput}
                                    maxLength={3000}
                                    rows={6}
                                />
                                <div style={styles.charCount}>
                                    <span style={{ 
                                        color: postContent.length > 2800 ? "#ff4d4f" : 
                                               postContent.length > 2500 ? "#ffa500" : "#666" 
                                    }}>
                                        {postContent.length}
                                    </span>/3000 characters
                                    {postContent.length > 2800 && (
                                        <span style={styles.charWarning}> (Almost full!)</span>
                                    )}
                                </div>
                            </div>
                            
                            {/* Media Upload */}
                            <div style={styles.mediaSection}>
                                <div style={styles.mediaHeader}>
                                    <h4>📸 Media (Optional)</h4>
                                    <small style={styles.mediaHint}>
                                        Add image to make your post more engaging (Max: 10MB)
                                    </small>
                                </div>
                                {!mediaPreview ? (
                                    <div style={styles.uploadArea}>
                                        <input
                                            type="file"
                                            id="mediaUpload"
                                            accept="image/*"
                                            onChange={handleMediaChange}
                                            style={styles.fileInput}
                                        />
                                        <label htmlFor="mediaUpload" style={styles.uploadButton}>
                                            <span style={styles.uploadIcon}>📁</span>
                                            Choose Image
                                        </label>
                                        <p style={styles.uploadHint}>
                                            Supports: JPG, PNG, GIF<br />
                                            Max: 10MB
                                        </p>
                                    </div>
                                ) : (
                                    <div style={styles.previewContainer}>
                                        <div style={styles.previewHeader}>
                                            <span style={styles.previewTitle}>📷 Image Preview</span>
                                            <button 
                                                onClick={removeMedia}
                                                style={styles.removeButton}
                                            >
                                                ✕ Remove
                                            </button>
                                        </div>
                                        <div style={styles.previewContent}>
                                            <img 
                                                src={mediaPreview} 
                                                alt="Preview" 
                                                style={styles.mediaPreview}
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = "https://via.placeholder.com/300x200?text=Preview+Failed";
                                                }}
                                            />
                                        </div>
                                        <div style={styles.fileInfo}>
                                            <span>{mediaFile?.name}</span>
                                            <span>{Math.round(mediaFile?.size / 1024)} KB</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            {/* Visibility Selection */}
                            <div style={styles.visibilitySection}>
                                <label style={styles.visibilityLabel}>Visibility:</label>
                                <select 
                                    value={visibility}
                                    onChange={(e) => setVisibility(e.target.value)}
                                    style={styles.visibilitySelect}
                                >
                                    <option value="PUBLIC">🌐 Public</option>
                                    <option value="CONNECTIONS">👥 Connections Only</option>
                                </select>
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
                                        📅 Schedule this post
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
                                            ⏰ Post will be published automatically at the scheduled time
                                        </p>
                                    </div>
                                )}
                            </div>
                            
                            {/* Post Button */}
                            <button
                                onClick={postToLinkedIn}
                                disabled={isPosting || (!postContent.trim() && !mediaFile)}
                                style={{
                                    ...styles.publishButton,
                                    background: "#0077B5",
                                    opacity: (!postContent.trim() && !mediaFile) ? 0.6 : 1,
                                    cursor: (!postContent.trim() && !mediaFile) ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {isPosting ? (
                                    <>
                                        <span style={styles.buttonSpinner}></span>
                                        {showSchedule && scheduleTime ? "Scheduling..." : "Publishing..."}
                                    </>
                                ) : (
                                    showSchedule && scheduleTime ? (
                                        <>
                                            <span style={styles.calendarIcon}>📅</span>
                                            Schedule Post
                                        </>
                                    ) : (
                                        <>
                                            <span style={styles.linkedinIconSmall}>💼</span>
                                            Publish Post
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
                                    <p>No posts yet</p>
                                    <small>Your published posts will appear here</small>
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
    linkedinIcon: {
        width: "60px",
        height: "60px",
        color: "#0077B5"
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
        marginTop: "20px",
        transition: "background 0.3s",
        "&:hover": {
            background: "#005a8c"
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
        border: "2px solid #0077B5"
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
    progressContainer: {
        marginBottom: "20px",
        padding: "15px",
        background: "white",
        borderRadius: "8px",
        boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
    },
    progressLabel: {
        marginBottom: "8px",
        color: "#0077B5",
        fontWeight: "500"
    },
    progressBar: {
        height: "6px",
        background: "#f0f0f0",
        borderRadius: "3px",
        overflow: "hidden"
    },
    progressFill: {
        height: "100%",
        background: "linear-gradient(90deg, #0077B5, #005a8c)",
        transition: "width 0.3s ease"
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
            borderColor: "#0077B5",
            boxShadow: "0 0 0 3px rgba(0, 119, 181, 0.1)"
        }
    },
    aiButton: {
        background: "linear-gradient(135deg, #0077B5 0%, #005a8c 100%)",
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
    postInput: {
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
            borderColor: "#0077B5",
            boxShadow: "0 0 0 3px rgba(0, 119, 181, 0.1)"
        }
    },
    charCount: {
        textAlign: "right",
        color: "#666",
        fontSize: "14px",
        marginTop: "8px",
        paddingRight: "5px"
    },
    charWarning: {
        color: "#ff4d4f",
        fontWeight: "500",
        marginLeft: "5px"
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
        color: "#333",
        minWidth: "150px"
    },
    mediaSection: {
        marginBottom: "25px"
    },
    mediaHeader: {
        marginBottom: "15px"
    },
    mediaHint: {
        color: "#666",
        fontSize: "12px",
        display: "block",
        marginTop: "5px"
    },
    uploadArea: {
        border: "2px dashed #0077B5",
        borderRadius: "8px",
        padding: "30px",
        textAlign: "center",
        cursor: "pointer",
        transition: "all 0.3s",
        background: "rgba(0, 119, 181, 0.05)",
        "&:hover": {
            background: "rgba(0, 119, 181, 0.1)"
        }
    },
    fileInput: {
        display: "none"
    },
    uploadButton: {
        background: "#0077B5",
        color: "white",
        padding: "12px 25px",
        borderRadius: "6px",
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        fontSize: "14px",
        fontWeight: "500",
        transition: "background 0.3s",
        "&:hover": {
            background: "#005a8c"
        }
    },
    uploadIcon: {
        fontSize: "18px"
    },
    uploadHint: {
        color: "#666",
        fontSize: "12px",
        marginTop: "15px",
        lineHeight: "1.4"
    },
    previewContainer: {
        border: "1px solid #ddd",
        borderRadius: "8px",
        overflow: "hidden",
        background: "#f8f9fa"
    },
    previewHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 15px",
        background: "#f0f0f0",
        borderBottom: "1px solid #ddd"
    },
    previewTitle: {
        fontWeight: "500",
        color: "#333"
    },
    removeButton: {
        background: "#ff4d4f",
        color: "white",
        border: "none",
        padding: "6px 12px",
        borderRadius: "4px",
        cursor: "pointer",
        fontSize: "12px",
        fontWeight: "500",
        transition: "background 0.2s",
        "&:hover": {
            background: "#e53935"
        }
    },
    previewContent: {
        padding: "15px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
    },
    mediaPreview: {
        maxWidth: "100%",
        maxHeight: "250px",
        objectFit: "contain",
        borderRadius: "6px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
    },
    fileInfo: {
        display: "flex",
        justifyContent: "space-between",
        padding: "10px 15px",
        background: "#f0f0f0",
        borderTop: "1px solid #ddd",
        fontSize: "12px",
        color: "#666"
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
        background: "linear-gradient(135deg, #0077B5 0%, #005a8c 100%)",
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
            boxShadow: "0 4px 12px rgba(0, 119, 181, 0.3)"
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
    linkedinIconSmall: {
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
        background: "#0077B5",
        color: "white",
        border: "none",
        padding: "5px 10px",
        borderRadius: "4px",
        cursor: "pointer",
        fontSize: "12px",
        fontWeight: "500",
        transition: "background 0.2s",
        "&:hover": {
            background: "#005a8c"
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
        border: "1px solid #0077B5",
        color: "#0077B5",
        padding: "6px 12px",
        borderRadius: "4px",
        fontSize: "12px",
        cursor: "pointer",
        transition: "all 0.2s",
        "&:hover": {
            background: "#0077B5",
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