import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import { jwtDecode } from "jwt-decode";

export default function YouTubeManager() {
    const BACKEND_URL = "https://automatedpostingbackend-h9dc.onrender.com";
    const FRONTEND_URL = "https://automatedpostingfrontend.onrender.com";
    
    const [sidebarWidth, setSidebarWidth] = useState(50);
    const [youtubeAccount, setYoutubeAccount] = useState(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [tags, setTags] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [videos, setVideos] = useState([]);
    const [videoFile, setVideoFile] = useState(null);
    const [videoPreview, setVideoPreview] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [showProgress, setShowProgress] = useState(false);
    const [privacyStatus, setPrivacyStatus] = useState("private");
    const [showSchedule, setShowSchedule] = useState(false);
    const [scheduleTime, setScheduleTime] = useState("");
    const [aiPrompt, setAiPrompt] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);

    const token = localStorage.getItem("token");

    // Add CSS animations
    useEffect(() => {
        const styleTag = document.createElement('style');
        styleTag.innerHTML = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
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
            
            @keyframes fadeIn {
                from {
                    opacity: 0;
                }
                to {
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(styleTag);
        
        return () => {
            if (styleTag.parentNode) {
                document.head.removeChild(styleTag);
            }
        };
    }, []);

    useEffect(() => {
        if (!token) {
            window.location.href = "/login";
            return;
        }

        const urlParams = new URLSearchParams(window.location.search);
        const youtubeStatus = urlParams.get("youtube");
        const channel = urlParams.get("channel");

        if (youtubeStatus === "connected" && channel) {
            const account = {
                channelName: channel,
                profileImage: "https://cdn-icons-png.flaticon.com/512/1384/1384060.png",
                connectedAt: new Date().toISOString()
            };
            setYoutubeAccount(account);
            localStorage.setItem("youtube_account", JSON.stringify(account));
            setMessage(`✅ Successfully connected to YouTube! Channel: ${channel}`);
            window.history.replaceState({}, document.title, "/youtube-manager");
            setIsLoading(false);
            return;
        }

        loadYouTubeAccount();
        loadVideos();
    }, [token]);

    const loadYouTubeAccount = async () => {
        setIsLoading(true);
        try {
            const decoded = jwtDecode(token);
            const userId = decoded.id;

            const response = await fetch(`${BACKEND_URL}/api/youtube/check`, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });
            
            if (!response.ok) throw new Error(`API error: ${response.status}`);

            const data = await response.json();

            if (data.success && data.connected) {
                const account = {
                    channelName: data.channelName || "YouTube Channel",
                    subscribers: data.subscribers || 0,
                    channelId: data.channelId,
                    profileImage: "https://cdn-icons-png.flaticon.com/512/1384/1384060.png",
                    connectedAt: data.connectedAt || new Date().toISOString(),
                    channelData: data.channelData
                };
                setYoutubeAccount(account);
                setError("");
                localStorage.setItem("youtube_account", JSON.stringify(account));
            } else {
                const savedAccount = localStorage.getItem("youtube_account");
                if (savedAccount) {
                    setYoutubeAccount(JSON.parse(savedAccount));
                    setError("");
                } else {
                    setError("YouTube account not connected. Please connect first.");
                    localStorage.removeItem("youtube_account");
                }
            }
        } catch (err) {
            console.error("❌ Error loading YouTube account:", err);
            const savedAccount = localStorage.getItem("youtube_account");
            if (savedAccount) {
                setYoutubeAccount(JSON.parse(savedAccount));
                setError("");
            } else {
                setError("Failed to load YouTube account. Please reconnect.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const loadVideos = async () => {
        try {
            const decoded = jwtDecode(token);
            const userId = decoded.id;

            const response = await fetch(`${BACKEND_URL}/api/youtube/videos`, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });
            const data = await response.json();

            if (data.success) {
                setVideos(data.videos || []);
            }
        } catch (err) {
            console.error("❌ Error loading videos:", err);
        }
    };

    const handleVideoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Check file type
        const isVideo = file.type.startsWith('video/');
        
        if (!isVideo) {
            setError("Please select a video file");
            return;
        }

        // Check file size (YouTube: 500MB max)
        const maxSize = 500 * 1024 * 1024;
        
        if (file.size > maxSize) {
            setError("File size exceeds 500MB limit for YouTube");
            return;
        }

        setVideoFile(file);
        setError("");
        
        // Create preview thumbnail
        const reader = new FileReader();
        reader.onloadend = () => {
            setVideoPreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const removeVideo = () => {
        setVideoFile(null);
        setVideoPreview(null);
        setError("");
    };

    const generateAIContent = async () => {
        if (!aiPrompt.trim()) {
            setError("Please enter a prompt for AI generation");
            return;
        }

        setIsGenerating(true);
        setError("");

        try {
            const response = await fetch(`${BACKEND_URL}/api/youtube/ai-generate`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ prompt: aiPrompt })
            });
            
            const data = await response.json();

            if (data.success) {
                setTitle(data.title || "");
                setDescription(data.description || "");
                setTags(data.tags || "");
                setAiPrompt("");
                setMessage("✅ AI content generated successfully!");
            } else {
                setError(data.error || "Failed to generate content");
            }
        } catch (err) {
            console.error("❌ AI Generation error:", err);
            setError("AI service temporarily unavailable");
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
        }, 200); // Slower for video uploads
        
        return interval;
    };

    const uploadYouTubeVideo = async () => {
        if (!title.trim()) {
            setError("Please enter a title for the video");
            return;
        }

        if (!videoFile) {
            setError("Please select a video file");
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

        setIsUploading(true);
        setError("");
        setMessage("");

        // Simulate upload progress
        const progressInterval = simulateUploadProgress();

        try {
            const formData = new FormData();
            formData.append("file", videoFile);
            formData.append("title", title);
            formData.append("description", description);
            formData.append("privacyStatus", privacyStatus);
            
            if (tags) {
                formData.append("tags", tags);
            }
            
            if (showSchedule && scheduleTime) {
                formData.append("scheduleTime", scheduleTime);
            }

            console.log("🚀 Uploading video to YouTube...");

            const response = await fetch(`${BACKEND_URL}/api/youtube/upload`, {
                method: "POST",
                headers: { 
                    Authorization: `Bearer ${token}`
                },
                body: formData
            });
            
            clearInterval(progressInterval);
            setUploadProgress(100);
            
            const data = await response.json();
            console.log("📤 API Response:", data);

            if (data.success) {
                const successMsg = data.scheduled 
                    ? `✅ Video scheduled for ${new Date(scheduleTime).toLocaleString()}!`
                    : `✅ Video uploaded successfully!`;
                
                if (data.youtubeUrl) {
                    setMessage(`${successMsg} View it here: ${data.youtubeUrl}`);
                } else {
                    setMessage(successMsg);
                }
                
                // Reset form
                setTitle("");
                setDescription("");
                setTags("");
                setVideoFile(null);
                setVideoPreview(null);
                setScheduleTime("");
                setShowSchedule(false);
                setAiPrompt("");
                
                // Reload videos after delay
                setTimeout(() => {
                    loadVideos();
                }, 2000);
            } else {
                setError(data.error || "Failed to upload video");
            }
        } catch (err) {
            console.error("❌ Upload error:", err);
            setError("Failed to upload video. Please check your connection and try again.");
        } finally {
            setIsUploading(false);
            setTimeout(() => {
                setShowProgress(false);
                setUploadProgress(0);
            }, 1000);
        }
    };

    const disconnectYouTube = async () => {
        if (!window.confirm("Are you sure you want to disconnect your YouTube account?")) return;

        try {
            const decoded = jwtDecode(token);
            const userId = decoded.id;

            localStorage.removeItem("youtube_account");

            const response = await fetch(`${BACKEND_URL}/api/youtube/disconnect`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ userId })
            });
            const data = await response.json();

            if (data.success) {
                setMessage("✅ YouTube account disconnected successfully");
                setYoutubeAccount(null);
                setTimeout(() => {
                    window.location.href = `${FRONTEND_URL}/youtube-connect?force=true&userId=${userId}`;
                }, 1500);
            } else {
                setError(data.error || "Failed to disconnect");
            }
        } catch (err) {
            console.error(err);
            setError("Failed to disconnect YouTube account");
        }
    };

    const reconnectYouTube = () => {
        const decoded = jwtDecode(token);
        const userId = decoded.id;
        window.location.href = `${BACKEND_URL}/api/youtube/connect?userId=${encodeURIComponent(userId)}`;
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

    const viewOnYouTube = (videoId) => {
        window.open(`https://youtube.com/watch?v=${videoId}`, "_blank");
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
                            <p>Loading YouTube account information...</p>
                        </div>
                    </main>
                </div>
                <Footer />
            </div>
        );
    }

    if (!youtubeAccount) {
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
                                    <svg style={styles.youtubeIcon} viewBox="0 0 24 24">
                                        <path fill="currentColor" d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                                    </svg>
                                </div>
                                <h3>YouTube Account Not Connected</h3>
                                <p>Please connect your YouTube account to start uploading videos and managing your channel.</p>
                                <button
                                    onClick={reconnectYouTube}
                                    style={styles.connectButton}
                                >
                                    Connect YouTube Account
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
                            <h2>YouTube Video Manager</h2>
                            <small style={styles.subtitle}>Upload and manage videos on your YouTube channel</small>
                        </div>
                        <div style={styles.accountBadge}>
                            <img 
                                src={youtubeAccount.profileImage} 
                                alt="Channel" 
                                style={styles.badgeImage}
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "https://cdn-icons-png.flaticon.com/512/1384/1384060.png";
                                }}
                            />
                            <div style={styles.accountInfo}>
                                <strong>{youtubeAccount.channelName}</strong>
                                {youtubeAccount.subscribers > 0 && (
                                    <small>👥 {youtubeAccount.subscribers.toLocaleString()} subscribers</small>
                                )}
                                <small>Connected: {new Date(youtubeAccount.connectedAt).toLocaleDateString()}</small>
                            </div>
                            <button
                                onClick={disconnectYouTube}
                                style={styles.disconnectButton}
                                title="Disconnect YouTube"
                            >
                                🔗
                            </button>
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
                            <div style={styles.progressLabel}>
                                {isUploading ? "Uploading video..." : "Processing..."} {uploadProgress}%
                            </div>
                            <div style={styles.progressBar}>
                                <div 
                                    style={{
                                        ...styles.progressFill,
                                        width: `${uploadProgress}%`
                                    }}
                                ></div>
                            </div>
                            <small style={styles.progressNote}>
                                ⏳ This may take several minutes for large videos...
                            </small>
                        </div>
                    )}

                    <div style={styles.managerContainer}>
                        {/* Left Column: Video Upload */}
                        <div style={styles.uploadCard}>
                            <h3 style={styles.sectionTitle}>Upload New Video</h3>
                            
                            {/* Video Upload Section */}
                            <div style={styles.videoSection}>
                                <div style={styles.videoHeader}>
                                    <h4>🎬 Video File *</h4>
                                    <small style={styles.videoHint}>
                                        YouTube supports MP4, MOV, AVI, WMV, FLV, MKV, WebM (Max: 500MB)
                                    </small>
                                </div>
                                {!videoPreview ? (
                                    <div style={styles.uploadArea}>
                                        <input
                                            type="file"
                                            id="videoUpload"
                                            accept="video/*"
                                            onChange={handleVideoChange}
                                            style={styles.fileInput}
                                        />
                                        <label htmlFor="videoUpload" style={styles.chooseFileButton}>
                                            <span style={styles.uploadIcon}>📁</span>
                                            Choose Video File
                                        </label>
                                        <p style={styles.uploadHint}>
                                            Supported: MP4, MOV, AVI, WMV, FLV, MKV, WebM<br />
                                            Maximum: 500MB
                                        </p>
                                    </div>
                                ) : (
                                    <div style={styles.previewContainer}>
                                        <div style={styles.previewHeader}>
                                            <span style={styles.previewTitle}>🎥 Video Preview</span>
                                            <button 
                                                onClick={removeVideo}
                                                style={styles.removeButton}
                                            >
                                                ✕ Remove
                                            </button>
                                        </div>
                                        <div style={styles.previewContent}>
                                            <video 
                                                src={videoPreview} 
                                                controls 
                                                style={styles.videoPreview}
                                            />
                                        </div>
                                        <div style={styles.fileInfo}>
                                            <span>{videoFile?.name}</span>
                                            <span>{Math.round(videoFile?.size / (1024*1024))} MB</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            {/* AI Content Generator */}
                            <div style={styles.aiSection}>
                                <div style={styles.aiHeader}>
                                    <h4>🤖 AI Content Generator</h4>
                                    <small style={styles.aiHint}>Enter a topic for AI to create title & description</small>
                                </div>
                                <div style={styles.aiInputGroup}>
                                    <input
                                        type="text"
                                        value={aiPrompt}
                                        onChange={(e) => setAiPrompt(e.target.value)}
                                        placeholder="Enter video topic (e.g., 'how to code', 'cooking tutorial', 'travel vlog')"
                                        style={styles.aiInput}
                                        onKeyPress={(e) => e.key === 'Enter' && generateAIContent()}
                                    />
                                    <button
                                        onClick={generateAIContent}
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
                            
                            {/* Title Input */}
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Video Title *</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Enter video title (required)"
                                    style={styles.titleInput}
                                    maxLength={100}
                                />
                                <div style={styles.charCount}>
                                    {title.length}/100 characters
                                </div>
                            </div>
                            
                            {/* Description Textarea */}
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Enter video description (supports markdown)"
                                    style={styles.descriptionInput}
                                    maxLength={5000}
                                    rows={5}
                                />
                                <div style={styles.charCount}>
                                    {description.length}/5000 characters
                                </div>
                            </div>
                            
                            {/* Tags Input */}
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Tags (Optional)</label>
                                <input
                                    type="text"
                                    value={tags}
                                    onChange={(e) => setTags(e.target.value)}
                                    placeholder="comma, separated, tags"
                                    style={styles.tagsInput}
                                />
                                <small style={styles.hintText}>Separate tags with commas</small>
                            </div>
                            
                            {/* Privacy & Scheduling */}
                            <div style={styles.optionsSection}>
                                <div style={styles.privacyGroup}>
                                    <label style={styles.label}>Privacy:</label>
                                    <select 
                                        value={privacyStatus}
                                        onChange={(e) => setPrivacyStatus(e.target.value)}
                                        style={styles.privacySelect}
                                    >
                                        <option value="private">🔒 Private</option>
                                        <option value="unlisted">👁️ Unlisted</option>
                                        <option value="public">🌐 Public</option>
                                    </select>
                                </div>
                                
                                <div style={styles.scheduleSection}>
                                    <label style={styles.scheduleToggle}>
                                        <input
                                            type="checkbox"
                                            checked={showSchedule}
                                            onChange={(e) => setShowSchedule(e.target.checked)}
                                            style={styles.checkbox}
                                        />
                                        <span style={styles.scheduleLabel}>
                                            📅 Schedule this video
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
                                                ⏰ Video will be published automatically at the scheduled time
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {/* Upload Button */}
                            <button
                                onClick={uploadYouTubeVideo}
                                disabled={isUploading || !title.trim() || !videoFile}
                                style={{
                                    ...styles.uploadButtonMain,
                                    opacity: (!title.trim() || !videoFile) ? 0.6 : 1,
                                    cursor: (!title.trim() || !videoFile) || isUploading ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {isUploading ? (
                                    <>
                                        <span style={styles.buttonSpinner}></span>
                                        {showSchedule && scheduleTime ? "Scheduling..." : "Uploading to YouTube..."}
                                    </>
                                ) : (
                                    showSchedule && scheduleTime ? (
                                        <>
                                            <span style={styles.calendarIcon}>📅</span>
                                            Schedule Video Upload
                                        </>
                                    ) : (
                                        <>
                                            <span style={styles.youtubeIconSmall}>🎬</span>
                                            Upload to YouTube
                                        </>
                                    )
                                )}
                            </button>
                            
                            <div style={styles.noteBox}>
                                <small>💡 <strong>Note:</strong> Videos are uploaded to Cloudinary first, then to YouTube</small>
                            </div>
                        </div>
                        
                        {/* Right Column: Recent Videos */}
                        <div style={styles.videosCard}>
                            <div style={styles.videosHeader}>
                                <h3 style={styles.sectionTitle}>Recent Videos</h3>
                                <button 
                                    onClick={loadVideos}
                                    style={styles.refreshSmallButton}
                                    title="Refresh videos"
                                >
                                    🔄
                                </button>
                            </div>
                            
                            {videos.length === 0 ? (
                                <div style={styles.emptyVideos}>
                                    <div style={styles.emptyIcon}>🎬</div>
                                    <p>No videos yet</p>
                                    <small>Your uploaded videos will appear here</small>
                                </div>
                            ) : (
                                <div style={styles.videosList}>
                                    {videos.slice(0, 5).map((video, index) => (
                                        <div key={video.videoId || index} style={styles.videoItem}>
                                            {video.thumbnail && (
                                                <img 
                                                    src={video.thumbnail} 
                                                    alt={video.title}
                                                    style={styles.videoThumbnail}
                                                    onClick={() => viewOnYouTube(video.videoId)}
                                                />
                                            )}
                                            <div style={styles.videoDetails}>
                                                <h4 style={styles.videoTitle} title={video.title}>
                                                    {video.title?.length > 50 
                                                        ? video.title.substring(0, 50) + '...' 
                                                        : video.title
                                                    }
                                                </h4>
                                                <p style={styles.videoChannel}>{video.channelTitle}</p>
                                                <p style={styles.videoDate}>
                                                    {new Date(video.publishedAt).toLocaleDateString()}
                                                </p>
                                                <button
                                                    onClick={() => viewOnYouTube(video.videoId)}
                                                    style={styles.watchButton}
                                                >
                                                    👁️ Watch
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            
                            {videos.length > 0 && (
                                <div style={styles.videosFooter}>
                                    <span style={styles.videosCount}>
                                        Showing {Math.min(videos.length, 5)} of {videos.length} videos
                                    </span>
                                    {videos.length > 5 && (
                                        <button 
                                            onClick={() => window.alert('View all videos feature coming soon!')}
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
        borderTop: "4px solid #FF0000",
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
    youtubeIcon: {
        width: "60px",
        height: "60px",
        color: "#FF0000"
    },
    connectButton: {
        background: "#FF0000",
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
            background: "#CC0000"
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
        flexDirection: "column",
        gap: "5px"
    },
    subtitle: {
        color: "#666",
        fontSize: "14px"
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
        border: "2px solid #FF0000"
    },
    accountInfo: {
        display: "flex",
        flexDirection: "column",
        gap: "2px"
    },
    disconnectButton: {
        background: "transparent",
        border: "1px solid #ddd",
        borderRadius: "50%",
        width: "32px",
        height: "32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        fontSize: "14px",
        transition: "all 0.2s",
        marginLeft: "10px",
        "&:hover": {
            background: "#ffe6e6",
            borderColor: "#ff4d4f",
            color: "#ff4d4f",
            transform: "rotate(45deg)"
        }
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
        color: "#FF0000",
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
        background: "linear-gradient(90deg, #FF0000, #CC0000)",
        transition: "width 0.3s ease"
    },
    progressNote: {
        display: "block",
        marginTop: "8px",
        color: "#666",
        fontSize: "12px"
    },
    managerContainer: {
        display: "grid",
        gridTemplateColumns: "2fr 1fr",
        gap: "30px"
    },
    uploadCard: {
        background: "white",
        padding: "30px",
        borderRadius: "12px",
        boxShadow: "0 3px 15px rgba(0,0,0,0.08)"
    },
    videosCard: {
        background: "white",
        padding: "30px",
        borderRadius: "12px",
        boxShadow: "0 3px 15px rgba(0,0,0,0.08)",
        display: "flex",
        flexDirection: "column"
    },
    videosHeader: {
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
    videoSection: {
        marginBottom: "25px"
    },
    videoHeader: {
        marginBottom: "15px"
    },
    videoHint: {
        color: "#666",
        fontSize: "12px",
        display: "block",
        marginTop: "5px"
    },
    uploadArea: {
        border: "2px dashed #FF0000",
        borderRadius: "8px",
        padding: "30px",
        textAlign: "center",
        cursor: "pointer",
        transition: "all 0.3s",
        background: "rgba(255, 0, 0, 0.05)",
        "&:hover": {
            background: "rgba(255, 0, 0, 0.1)"
        }
    },
    fileInput: {
        display: "none"
    },
    chooseFileButton: {
        background: "#FF0000",
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
            background: "#CC0000"
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
    videoPreview: {
        maxWidth: "100%",
        maxHeight: "250px",
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
    aiSection: {
        marginBottom: "25px",
        padding: "20px",
        background: "linear-gradient(135deg, #fff0f0 0%, #ffeaea 100%)",
        borderRadius: "10px",
        border: "1px solid #ffcccc"
    },
    aiHeader: {
        display: "flex",
        flexDirection: "column",
        marginBottom: "10px"
    },
    aiHint: {
        color: "#666",
        fontSize: "12px",
        marginTop: "5px"
    },
    aiInputGroup: {
        display: "flex",
        gap: "10px",
        marginTop: "15px"
    },
    aiInput: {
        flex: 1,
        padding: "12px 15px",
        border: "1px solid #ddd",
        borderRadius: "6px",
        fontSize: "14px",
        transition: "border 0.3s",
        "&:focus": {
            outline: "none",
            borderColor: "#FF0000",
            boxShadow: "0 0 0 3px rgba(255, 0, 0, 0.1)"
        }
    },
    aiButton: {
        background: "linear-gradient(135deg, #FF0000 0%, #CC0000 100%)",
        color: "white",
        border: "none",
        padding: "12px 20px",
        borderRadius: "6px",
        cursor: "pointer",
        fontSize: "14px",
        fontWeight: "500",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        transition: "all 0.3s",
        "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 4px 12px rgba(255, 0, 0, 0.2)"
        },
        "&:disabled": {
            opacity: 0.6,
            cursor: "not-allowed",
            transform: "none",
            boxShadow: "none"
        }
    },
    inputGroup: {
        marginBottom: "20px"
    },
    label: {
        display: "block",
        marginBottom: "8px",
        fontWeight: "500",
        color: "#333",
        fontSize: "14px"
    },
    titleInput: {
        width: "100%",
        padding: "12px 15px",
        border: "1px solid #ddd",
        borderRadius: "6px",
        fontSize: "16px",
        transition: "border 0.3s",
        "&:focus": {
            outline: "none",
            borderColor: "#FF0000",
            boxShadow: "0 0 0 3px rgba(255, 0, 0, 0.1)"
        }
    },
    descriptionInput: {
        width: "100%",
        padding: "12px 15px",
        border: "1px solid #ddd",
        borderRadius: "6px",
        fontSize: "14px",
        fontFamily: "inherit",
        resize: "vertical",
        transition: "border 0.3s",
        "&:focus": {
            outline: "none",
            borderColor: "#FF0000",
            boxShadow: "0 0 0 3px rgba(255, 0, 0, 0.1)"
        }
    },
    tagsInput: {
        width: "100%",
        padding: "12px 15px",
        border: "1px solid #ddd",
        borderRadius: "6px",
        fontSize: "14px",
        transition: "border 0.3s",
        "&:focus": {
            outline: "none",
            borderColor: "#FF0000",
            boxShadow: "0 0 0 3px rgba(255, 0, 0, 0.1)"
        }
    },
    charCount: {
        textAlign: "right",
        fontSize: "12px",
        color: "#666",
        marginTop: "5px"
    },
    hintText: {
        display: "block",
        marginTop: "5px",
        color: "#666",
        fontSize: "12px"
    },
    optionsSection: {
        marginBottom: "25px",
        padding: "20px",
        background: "#f8f9fa",
        borderRadius: "8px",
        border: "1px solid #e0e0e0"
    },
    privacyGroup: {
        display: "flex",
        alignItems: "center",
        gap: "15px",
        marginBottom: "20px"
    },
    privacySelect: {
        padding: "8px 15px",
        border: "1px solid #ddd",
        borderRadius: "6px",
        fontSize: "14px",
        background: "white",
        cursor: "pointer",
        transition: "border 0.3s",
        "&:focus": {
            outline: "none",
            borderColor: "#FF0000"
        }
    },
    scheduleSection: {
        display: "flex",
        flexDirection: "column",
        gap: "15px"
    },
    scheduleToggle: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        cursor: "pointer",
        userSelect: "none"
    },
    checkbox: {
        width: "18px",
        height: "18px",
        cursor: "pointer"
    },
    scheduleLabel: {
        fontSize: "14px",
        fontWeight: "500",
        color: "#333"
    },
    schedulePicker: {
        padding: "15px",
        background: "white",
        borderRadius: "6px",
        border: "1px solid #e0e0e0"
    },
    datetimeGroup: {
        display: "flex",
        flexDirection: "column",
        gap: "8px"
    },
    datetimeLabel: {
        fontSize: "13px",
        fontWeight: "500",
        color: "#555"
    },
    datetimeInput: {
        padding: "10px 15px",
        border: "1px solid #ddd",
        borderRadius: "6px",
        fontSize: "14px",
        transition: "border 0.3s",
        "&:focus": {
            outline: "none",
            borderColor: "#FF0000"
        }
    },
    scheduleHint: {
        fontSize: "12px",
        color: "#666",
        marginTop: "10px",
        fontStyle: "italic"
    },
    uploadButtonMain: {
        width: "100%",
        background: "linear-gradient(135deg, #FF0000 0%, #CC0000 100%)",
        color: "white",
        border: "none",
        padding: "16px",
        borderRadius: "8px",
        fontSize: "16px",
        fontWeight: "600",
        cursor: "pointer",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "10px",
        transition: "all 0.3s",
        marginTop: "20px",
        "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 6px 15px rgba(255, 0, 0, 0.3)"
        },
        "&:disabled": {
            opacity: 0.6,
            cursor: "not-allowed",
            transform: "none",
            boxShadow: "none"
        }
    },
    buttonSpinner: {
        display: "inline-block",
        width: "16px",
        height: "16px",
        border: "2px solid rgba(255, 255, 255, 0.3)",
        borderTop: "2px solid white",
        borderRadius: "50%",
        animation: "spin 1s linear infinite"
    },
    calendarIcon: {
        fontSize: "18px"
    },
    youtubeIconSmall: {
        fontSize: "18px"
    },
    noteBox: {
        marginTop: "15px",
        padding: "12px",
        background: "#e8f4fc",
        borderRadius: "6px",
        borderLeft: "4px solid #2196f3",
        fontSize: "12px",
        color: "#1976d2"
    },
    emptyVideos: {
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
        fontSize: "40px",
        marginBottom: "15px",
        opacity: 0.5
    },
    videosList: {
        display: "flex",
        flexDirection: "column",
        gap: "15px",
        marginBottom: "20px"
    },
    videoItem: {
        display: "flex",
        gap: "15px",
        padding: "15px",
        background: "#f8f9fa",
        borderRadius: "8px",
        border: "1px solid #e0e0e0",
        transition: "transform 0.2s, boxShadow 0.2s",
        "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
        }
    },
    videoThumbnail: {
        width: "100px",
        height: "70px",
        borderRadius: "6px",
        objectFit: "cover",
        cursor: "pointer",
        transition: "opacity 0.2s",
        "&:hover": {
            opacity: 0.8
        }
    },
    videoDetails: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center"
    },
    videoTitle: {
        margin: "0 0 5px 0",
        fontSize: "14px",
        fontWeight: "600",
        color: "#333",
        lineHeight: "1.3",
        cursor: "pointer",
        "&:hover": {
            color: "#FF0000"
        }
    },
    videoChannel: {
        margin: "0 0 3px 0",
        fontSize: "12px",
        color: "#666"
    },
    videoDate: {
        margin: "0 0 8px 0",
        fontSize: "11px",
        color: "#999"
    },
    watchButton: {
        alignSelf: "flex-start",
        background: "#FF0000",
        color: "white",
        border: "none",
        padding: "6px 12px",
        borderRadius: "4px",
        fontSize: "12px",
        fontWeight: "500",
        cursor: "pointer",
        transition: "background 0.2s",
        "&:hover": {
            background: "#CC0000"
        }
    },
    videosFooter: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        paddingTop: "15px",
        borderTop: "1px solid #e0e0e0",
        marginTop: "auto"
    },
    videosCount: {
        fontSize: "12px",
        color: "#666"
    },
    viewAllButton: {
        background: "transparent",
        color: "#FF0000",
        border: "1px solid #FF0000",
        padding: "6px 12px",
        borderRadius: "4px",
        fontSize: "12px",
        fontWeight: "500",
        cursor: "pointer",
        transition: "all 0.2s",
        "&:hover": {
            background: "rgba(255, 0, 0, 0.1)"
        }
    }
};