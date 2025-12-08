import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        email: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError(""); // Clear error when user types
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Basic validation
        if (!form.email || !form.password) {
            setError("Email and password are required");
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(form.email)) {
            setError("Please enter a valid email address");
            return;
        }

        setLoading(true);
        setError("");
        
        try {
            const res = await axios.post("https://automatedpostingbackend.onrender.com/user/login", form);
            if (res.data.success) {
                alert("Login successful");
                localStorage.setItem("token", res.data.token);
                localStorage.setItem("userId", res.data.userId);
                navigate("/dashboard");
            } else {
                setError(res.data.msg || "Login failed");
            }
        } catch (err) {
            console.log(err);
            if (err.response && err.response.data && err.response.data.msg) {
                setError(err.response.data.msg);
            } else {
                setError("Server Error. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            {/* Left Side - AI Information & Image - 60% */}
            <div style={styles.leftPanel}>
                <div style={styles.aiContent}>
                    <div style={styles.logoContainer}>
                        <div style={styles.logo}>
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white" stroke="white" strokeWidth="2"/>
                                <path d="M2 17L12 22L22 17" fill="white" stroke="white" strokeWidth="2"/>
                                <path d="M2 12L12 17L22 12" fill="white" stroke="white" strokeWidth="2"/>
                            </svg>
                            <span style={styles.logoText}>SyncSocial AI</span>
                        </div>
                    </div>
                    
                    <h1 style={styles.aiTitle}>AI-Powered Social Platform</h1>
                    <p style={styles.aiSubtitle}>Where Artificial Intelligence meets Social Media</p>
                    
                    <div style={styles.aiImageContainer}>
                        <div style={styles.aiImagePlaceholder}>
                            {/* AI Social Network Connection Image */}
                            <svg width="320" height="320" viewBox="0 0 280 280" fill="none">
                                {/* Central AI Hub */}
                                <circle cx="140" cy="140" r="90" fill="url(#headGradient)" stroke="url(#borderGradient)" strokeWidth="4"/>
                                
                                {/* AI Processing Core */}
                                <circle cx="140" cy="110" r="25" fill="url(#brainGradient)">
                                    <animate attributeName="r" values="25;28;25" dur="2s" repeatCount="indefinite"/>
                                </circle>
                                
                                {/* Network Connections */}
                                <g>
                                    {/* Top Connection */}
                                    <path d="M140,85 L140,65" stroke="#7C3AED" strokeWidth="3" strokeLinecap="round"/>
                                    {/* Left Connections */}
                                    <path d="M110,110 L85,110" stroke="#EC4899" strokeWidth="3" strokeLinecap="round"/>
                                    <path d="M125,145 L105,165" stroke="#10B981" strokeWidth="3" strokeLinecap="round"/>
                                    {/* Right Connections */}
                                    <path d="M170,110 L195,110" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round"/>
                                    <path d="M155,145 L175,165" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round"/>
                                    
                                    {/* Diagonal Connections */}
                                    <path d="M100,80 L70,60" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round"/>
                                    <path d="M180,80 L210,60" stroke="#EC4899" strokeWidth="2" strokeLinecap="round"/>
                                    <path d="M100,200 L70,220" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round"/>
                                    <path d="M180,200 L210,220" stroke="#10B981" strokeWidth="2" strokeLinecap="round"/>
                                </g>
                                
                                {/* Floating Data Nodes */}
                                <g>
                                    {/* Top Nodes */}
                                    <circle cx="70" cy="50" r="6" fill="#7C3AED">
                                        <animate attributeName="r" values="6;8;6" dur="1.5s" repeatCount="indefinite"/>
                                    </circle>
                                    <circle cx="140" cy="40" r="7" fill="#EC4899">
                                        <animate attributeName="r" values="7;9;7" dur="1.8s" repeatCount="indefinite"/>
                                    </circle>
                                    <circle cx="210" cy="50" r="5" fill="#3B82F6">
                                        <animate attributeName="r" values="5;7;5" dur="1.6s" repeatCount="indefinite"/>
                                    </circle>
                                    
                                    {/* Side Nodes */}
                                    <circle cx="60" cy="110" r="6" fill="#10B981">
                                        <animate attributeName="cx" values="60;65;60" dur="2s" repeatCount="indefinite"/>
                                    </circle>
                                    <circle cx="220" cy="110" r="5" fill="#F59E0B">
                                        <animate attributeName="cx" values="220;215;220" dur="1.9s" repeatCount="indefinite"/>
                                    </circle>
                                    
                                    {/* Bottom Nodes */}
                                    <circle cx="70" cy="220" r="7" fill="#7C3AED">
                                        <animate attributeName="cy" values="220;215;220" dur="1.7s" repeatCount="indefinite"/>
                                    </circle>
                                    <circle cx="140" cy="230" r="6" fill="#EC4899">
                                        <animate attributeName="cy" values="230;225;230" dur="1.5s" repeatCount="indefinite"/>
                                    </circle>
                                    <circle cx="210" cy="220" r="8" fill="#3B82F6">
                                        <animate attributeName="cy" values="220;215;220" dur="1.8s" repeatCount="indefinite"/>
                                    </circle>
                                </g>
                                
                                {/* Data Flow Lines */}
                                <path d="M60,180 Q140,200 220,180" stroke="url(#lineGradient)" strokeWidth="2" strokeDasharray="5,5">
                                    <animate attributeName="stroke-dashoffset" values="0;20" dur="2s" repeatCount="indefinite"/>
                                </path>
                                <path d="M60,100 Q140,80 220,100" stroke="url(#lineGradient2)" strokeWidth="2" strokeDasharray="5,5">
                                    <animate attributeName="stroke-dashoffset" values="20;0" dur="2s" repeatCount="indefinite"/>
                                </path>
                                
                                {/* Floating Icons */}
                                <g>
                                    {/* AI Brain Icon */}
                                    <path d="M65,75 Q70,70 75,75 Q70,80 65,75" fill="#7C3AED" stroke="#7C3AED" strokeWidth="2">
                                        <animateTransform attributeName="transform" type="translate" values="0,0;0,-5;0,0" dur="3s" repeatCount="indefinite"/>
                                    </path>
                                    
                                    {/* Network Icon */}
                                    <path d="M205,70 L215,70 L215,80 L205,80 Z" fill="#EC4899" stroke="#EC4899" strokeWidth="2">
                                        <animateTransform attributeName="transform" type="translate" values="0,0;5,0;0,0" dur="2.5s" repeatCount="indefinite"/>
                                    </path>
                                    
                                    {/* Data Icon */}
                                    <path d="M50,230 L60,230 L60,240 L50,240 Z" fill="#3B82F6" stroke="#3B82F6" strokeWidth="2">
                                        <animateTransform attributeName="transform" type="translate" values="0,0;0,5;0,0" dur="3.5s" repeatCount="indefinite"/>
                                    </path>
                                    
                                    {/* Connection Icon */}
                                    <path d="M215,230 L225,230 L225,240 L215,240 Z" fill="#10B981" stroke="#10B981" strokeWidth="2">
                                        <animateTransform attributeName="transform" type="translate" values="0,0;-5,0;0,0" dur="2.8s" repeatCount="indefinite"/>
                                    </path>
                                </g>
                                
                                {/* Pulsing Rings */}
                                <circle cx="140" cy="110" r="35" stroke="#7C3AED" strokeWidth="1" strokeOpacity="0.3" fill="none">
                                    <animate attributeName="r" values="35;45;35" dur="3s" repeatCount="indefinite"/>
                                    <animate attributeName="stroke-opacity" values="0.3;0;0.3" dur="3s" repeatCount="indefinite"/>
                                </circle>
                                <circle cx="140" cy="110" r="50" stroke="#EC4899" strokeWidth="1" strokeOpacity="0.2" fill="none">
                                    <animate attributeName="r" values="50;60;50" dur="4s" repeatCount="indefinite"/>
                                    <animate attributeName="stroke-opacity" values="0.2;0;0.2" dur="4s" repeatCount="indefinite"/>
                                </circle>
                                
                                <defs>
                                    <linearGradient id="headGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#1a1a2e"/>
                                        <stop offset="100%" stopColor="#16213e"/>
                                    </linearGradient>
                                    <linearGradient id="borderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#7C3AED"/>
                                        <stop offset="50%" stopColor="#EC4899"/>
                                        <stop offset="100%" stopColor="#3B82F6"/>
                                    </linearGradient>
                                    <linearGradient id="brainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.8"/>
                                        <stop offset="100%" stopColor="#EC4899" stopOpacity="0.8"/>
                                    </linearGradient>
                                    <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#7C3AED" stopOpacity="0"/>
                                        <stop offset="50%" stopColor="#7C3AED" stopOpacity="1"/>
                                        <stop offset="100%" stopColor="#7C3AED" stopOpacity="0"/>
                                    </linearGradient>
                                    <linearGradient id="lineGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#EC4899" stopOpacity="0"/>
                                        <stop offset="50%" stopColor="#EC4899" stopOpacity="1"/>
                                        <stop offset="100%" stopColor="#EC4899" stopOpacity="0"/>
                                    </linearGradient>
                                </defs>
                            </svg>
                        </div>
                        <p style={styles.aiImageText}>AI Network Connecting Social Platforms</p>
                    </div>
                    
                    <div style={styles.featuresGrid}>
                        <div style={styles.featureCard}>
                            <div style={styles.featureIcon}>
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="#7C3AED" fillOpacity="0.2" stroke="#7C3AED" strokeWidth="2"/>
                                    <path d="M8 12L11 15L16 9" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                            <h4 style={styles.featureCardTitle}>Secure Authentication</h4>
                            <p style={styles.featureCardDesc}>Military-grade encryption for safe account access</p>
                        </div>
                        
                        <div style={styles.featureCard}>
                            <div style={styles.featureIcon}>
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="#EC4899" strokeWidth="2"/>
                                    <circle cx="9" cy="7" r="4" stroke="#EC4899" strokeWidth="2"/>
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="#EC4899" strokeWidth="2"/>
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="#EC4899" strokeWidth="2"/>
                                </svg>
                            </div>
                            <h4 style={styles.featureCardTitle}>Multi-Device Access</h4>
                            <p style={styles.featureCardDesc}>Login from any device with sync capabilities</p>
                        </div>
                        
                        <div style={styles.featureCard}>
                            <div style={styles.featureIcon}>
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                                    <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" fill="#3B82F6" fillOpacity="0.2" stroke="#3B82F6" strokeWidth="2"/>
                                    <path d="M19.4 15C20.2 13.4 20.2 11.6 19.4 10" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round"/>
                                    <path d="M4.6 15C3.8 13.4 3.8 11.6 4.6 10" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round"/>
                                    <path d="M16.8 7.2C17.5 8.3 17.5 9.7 16.8 10.8" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round"/>
                                    <path d="M7.2 7.2C6.5 8.3 6.5 9.7 7.2 10.8" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round"/>
                                </svg>
                            </div>
                            <h4 style={styles.featureCardTitle}>Smart Session Management</h4>
                            <p style={styles.featureCardDesc}>AI-powered session handling for optimal security</p>
                        </div>
                        
                        <div style={styles.featureCard}>
                            <div style={styles.featureIcon}>
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                                    <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.86" stroke="#10B981" strokeWidth="2" strokeLinecap="round"/>
                                    <path d="M22 4L12 14.01L9 11.01" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                            <h4 style={styles.featureCardTitle}>Real-time Monitoring</h4>
                            <p style={styles.featureCardDesc}>Track login activity with AI analytics</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form - 40% */}
            <div style={styles.rightPanel}>
                <div style={styles.formContainer}>
                    {/* Center the Login header */}
                    <div style={styles.formHeader}>
                        <h2 style={styles.formTitle}>Login</h2>
                        <p style={styles.formSubtitle}>Access SyncSocial AI Platform</p>
                    </div>

                    {/* Error Message Display */}
                    {error && (
                        <div style={styles.errorBox}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={styles.errorIcon}>
                                <circle cx="12" cy="12" r="10" fill="#FEE2E2" stroke="#DC2626"/>
                                <path d="M12 8V12" stroke="#DC2626" strokeWidth="2" strokeLinecap="round"/>
                                <circle cx="12" cy="16" r="1" fill="#DC2626"/>
                            </svg>
                            <span style={styles.errorText}>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Email Address</label>
                            <div style={styles.inputWrapper}>
                                <input
                                    name="email"
                                    placeholder="Enter your email"
                                    onChange={handleChange}
                                    value={form.email}
                                    style={styles.input}
                                    autoComplete="username"
                                    required
                                />
                                <span style={styles.inputIcon}>✉️</span>
                            </div>
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Password</label>
                            <div style={styles.inputWrapper}>
                                <input
                                    name="password"
                                    type="password"
                                    placeholder="Enter your password"
                                    onChange={handleChange}
                                    value={form.password}
                                    style={styles.input}
                                    autoComplete="current-password"
                                    required
                                />
                                <span style={styles.inputIcon}>🔒</span>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            style={loading ? { ...styles.submitBtn, ...styles.disabledBtn } : styles.submitBtn}
                        >
                            {loading ? (
                                <>
                                    <span style={styles.spinner}></span>
                                    Processing...
                                </>
                            ) : "Login"}
                        </button>
                    </form>

                    <p style={styles.registerLink}>
                        Don't have an account?{" "}
                        <Link to="/register" style={styles.registerText}>
                            Register
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: {
        display: "flex",
        minHeight: "100vh",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        overflowX: "hidden",
    },
    // Error Styles
    errorBox: {
        backgroundColor: "#FEE2E2",
        border: "1px solid #FCA5A5",
        borderRadius: "8px",
        padding: "12px",
        marginBottom: "20px",
        display: "flex",
        alignItems: "center",
        gap: "10px",
    },
    errorIcon: {
        flexShrink: 0,
    },
    errorText: {
        color: "#DC2626",
        fontSize: "14px",
        fontWeight: "500",
    },
    // Left Panel Styles - 60% (AI Info)
    leftPanel: {
        flex: "0 0 60%",
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
        color: "white",
        padding: "40px",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        overflow: "auto",
        minHeight: "100vh",
    },
    aiContent: {
        maxWidth: "800px",
        width: "100%",
        textAlign: "center",
    },
    logoContainer: {
        marginBottom: "30px",
    },
    logo: {
        display: "flex",
        alignItems: "center",
        gap: "15px",
        fontSize: "28px",
        fontWeight: "bold",
        justifyContent: "center",
    },
    logoText: {
        background: "linear-gradient(135deg, #7C3AED, #EC4899)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        fontWeight: "700",
    },
    aiTitle: {
        fontSize: "38px",
        fontWeight: "700",
        marginBottom: "12px",
        lineHeight: "1.2",
        background: "linear-gradient(135deg, #fff, #a5b4fc)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
    },
    aiSubtitle: {
        fontSize: "18px",
        color: "#cbd5e1",
        marginBottom: "30px",
        fontWeight: "400",
    },
    aiImageContainer: {
        marginBottom: "30px",
        padding: "20px",
        backgroundColor: "rgba(124, 58, 237, 0.1)",
        borderRadius: "20px",
        border: "1px solid rgba(124, 58, 237, 0.2)",
    },
    aiImagePlaceholder: {
        marginBottom: "15px",
    },
    aiImageText: {
        fontSize: "14px",
        color: "#cbd5e1",
        fontStyle: "italic",
        marginTop: "10px",
    },
    featuresGrid: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "20px",
        marginTop: "25px",
        marginBottom: "40px",
    },
    featureCard: {
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        padding: "20px",
        borderRadius: "14px",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        textAlign: "left",
        transition: "all 0.3s ease",
    },
    featureIcon: {
        width: "45px",
        height: "45px",
        backgroundColor: "rgba(124, 58, 237, 0.1)",
        borderRadius: "10px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: "12px",
    },
    featureCardTitle: {
        fontSize: "16px",
        fontWeight: "600",
        margin: "0 0 8px 0",
        color: "#fff",
    },
    featureCardDesc: {
        fontSize: "13px",
        color: "#cbd5e1",
        margin: "0",
        lineHeight: "1.4",
    },
    // Right Panel Styles
   rightPanel: {
        flex: "0 0 40%",
        backgroundColor: "#ffffff",
        display: "flex",
        alignItems: "flex-start", // Keep flex-start
        justifyContent: "center",
        padding: "30px 20px",
        paddingTop: "150px", // Increased from 40px to 80px to move form down
        overflowY: "auto",
        minHeight: "100vh",
    },
    formContainer: {
        maxWidth: "380px",
        width: "100%",
        margin: "0 auto",
        paddingBottom: "60px",
        minHeight: "100%",
    },
    formHeader: {
        textAlign: "center",
        marginBottom: "30px",
    },
    formTitle: {
        fontSize: "32px",
        fontWeight: "700",
        color: "#1f2937",
        margin: "0 0 8px 0",
    },
    formSubtitle: {
        fontSize: "15px",
        color: "#6b7280",
        margin: "0",
    },
    formGroup: {
        marginBottom: "18px",
    },
    label: {
        display: "block",
        fontSize: "13px",
        fontWeight: "600",
        color: "#374151",
        marginBottom: "6px",
    },
    inputWrapper: {
        position: "relative",
    },
    input: {
        width: "100%",
        padding: "12px 12px 12px 42px",
        border: "2px solid #e5e7eb",
        borderRadius: "8px",
        fontSize: "14px",
        color: "#1f2937",
        backgroundColor: "white",
        transition: "all 0.3s ease",
        outline: "none",
        boxSizing: "border-box",
    },
    inputIcon: {
        position: "absolute",
        left: "12px",
        top: "50%",
        transform: "translateY(-50%)",
        fontSize: "16px",
    },
    submitBtn: {
        width: "100%",
        padding: "14px",
        backgroundColor: "#7C3AED",
        color: "white",
        border: "none",
        borderRadius: "8px",
        fontSize: "15px",
        fontWeight: "600",
        cursor: "pointer",
        transition: "all 0.3s ease",
        marginTop: "8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
    },
    disabledBtn: {
        opacity: "0.7",
        cursor: "not-allowed",
        backgroundColor: "#9CA3AF",
    },
    spinner: {
        width: "18px",
        height: "18px",
        border: "3px solid rgba(255,255,255,0.3)",
        borderTopColor: "white",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
    },
    registerLink: {
        textAlign: "center",
        fontSize: "13px",
        color: "#6b7280",
        marginTop: "20px",
    },
    registerText: {
        color: "#7C3AED",
        fontWeight: "600",
        textDecoration: "none",
    },
};

// Add CSS animation
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(`
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`, styleSheet.cssRules.length);