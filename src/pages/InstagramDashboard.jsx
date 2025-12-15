import React, { useEffect, useState } from "react";
import axios from "axios";

// EXISTING COMPONENTS (NO CHANGE)
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function InstagramDashboard() {
    const [sidebarWidth, setSidebarWidth] = useState(50);
    const [account, setAccount] = useState(null);
    const [metrics, setMetrics] = useState(null);
    const [caption, setCaption] = useState("");
    const [scheduleTime, setScheduleTime] = useState("");
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const nowPlus10 = new Date(Date.now() + 10 * 60000);


    const userId = localStorage.getItem("userId");

    useEffect(() => {
        if (!userId) return;

        axios
            .get(`https://automatedpostingbackend.onrender.com/social/instagram/metrics/${userId}`)
            .then(res => {
                setAccount(res.data.account);
                setMetrics(res.data.metrics);
            })
            .catch(err => console.error("IG fetch error:", err));
    }, [userId]);

    const publishPost = async () => {
        if (!caption || !image) {
            alert("Caption and image required");
            return;
        }

        const formData = new FormData();
        formData.append("caption", caption);
        formData.append("image", image);
        formData.append("userId", userId);

        // validation before appending
        if (scheduleTime) {
            const selectedTime = new Date(scheduleTime);
            const nowPlus10 = new Date(Date.now() + 10 * 60 * 1000);

            if (selectedTime < nowPlus10) {
                alert("Scheduled time must be at least 10 minutes from now");
                return;
            }

            // only append if valid
            formData.append("scheduleTime", scheduleTime);
        }

        try {
            setLoading(true);
            await axios.post(
                "https://automatedpostingbackend.onrender.com/social/publish/instagram",
                formData
            );
            alert(scheduleTime ? "Post Scheduled ✅" : "Post Published 🚀");
            // ✅ RESET FORM
            setCaption("");
            setImage(null);
            setScheduleTime("");
        } catch {
            alert("Post failed ❌");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ background: "#f5f7fb", minHeight: "100vh" }}>
            {/* SIDEBAR – UNCHANGED */}
            <Sidebar onWidthChange={setSidebarWidth} />

            {/* MAIN CONTENT */}
            <div
                style={{
                    marginLeft: sidebarWidth,
                    width: `calc(100% - ${sidebarWidth}px)`,
                    transition: "0.3s ease",
                    display: "flex",
                    flexDirection: "column",
                    minHeight: "100vh",
                }}
            >
                <Navbar />
                <main style={{ transition: "0.3s ease", marginTop: 60 }}>


                    <div style={page}>
                        {/* HEADER */}
                        <div style={headerRow}>
                            <div>
                                <h2 style={title}>Instagram Dashboard</h2>
                                <p style={subtitle}>Manage posts & analytics</p>
                            </div>

                        </div>

                        {!account && <p>Instagram account not connected</p>}

                        {account && (
                            <>
                                {/* INFO CARDS */}
                                <div style={grid4}>
                                    <InfoCard
                                        title="Account"
                                        value={`@${account.meta?.username}`}
                                    />
                                    <InfoCard
                                        title="Followers"
                                        value={metrics?.followers || 0}
                                    />
                                    <InfoCard
                                        title="Posts"
                                        value={metrics?.mediaCount || 0}
                                    />

                                    <div style={automationCard}>
                                        <span style={{ fontSize: 13, opacity: 0.9 }}>
                                            Automation Posts
                                        </span>

                                        <button
                                            style={{ ...autoWhiteBtn, marginTop: 14 }}
                                            onClick={() => (window.location.href = "/auto-post")}
                                        >
                                            Go to Automation →
                                        </button>
                                    </div>
                                </div>

                                {/* CREATE POST */}
                                <div style={postCard}>
                                    <h3 style={postTitle}>Create Instagram Post</h3>

                                    <textarea
                                        value={caption}
                                        onChange={e => setCaption(e.target.value)}
                                        placeholder="Write your caption here..."
                                        style={textarea}
                                    />

                                    {/* Upload + Schedule */}
                                    <div style={row}>
                                        {/* Image Upload */}
                                        <div style={inputCard}>
                                            <label style={label}>Upload Image</label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={e => setImage(e.target.files[0])}
                                                style={fileInput}
                                            />
                                        </div>

                                        {/* Schedule */}
                                        <div style={inputCard}>
                                            <label style={label}>Schedule Time (Optional)</label>
                                            <input
                                                type="datetime-local"
                                                value={scheduleTime}
                                                onChange={(e) => setScheduleTime(e.target.value)}
                                                style={datetimeInput}
                                            />
                                            <small style={hint}>
                                                Leave empty to publish immediately
                                            </small>
                                        </div>
                                    </div>

                                    {/* Publish */}
                                    <button
                                        onClick={publishPost}
                                        disabled={loading}
                                        style={publishBtn}
                                    >
                                        {loading ? "Publishing..." : "Publish Post 🚀"}
                                    </button>
                                </div>

                            </>
                        )}
                    </div>
                </main>

                <Footer />
            </div>
        </div>
    );
}

/* SMALL CARD COMPONENT */
const InfoCard = ({ title, value }) => (
    <div style={card}>
        <div style={cardTitle}>{title}</div>
        <div style={bigText}>{value}</div>
    </div>
);

/* STYLES */
const page = {
    padding: "32px 40px",
};

const headerRow = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 28,
};

const title = {
    fontSize: 24,
    fontWeight: 700,
    margin: 0,
};

const subtitle = {
    fontSize: 14,
    color: "#6b7280",
};

const grid4 = {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 20,
    marginBottom: 32,
};

const card = {
    background: "#fff",
    padding: 22,
    borderRadius: 18,
    boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
};

const automationCard = {
    ...card,
    background: "linear-gradient(135deg,#7c3aed,#ec4899)",
    color: "#fff",
};

const cardTitle = {
    fontSize: 13,
    color: "#6b7280",
};

const bigText = {
    fontSize: 26,
    fontWeight: 700,
};

const postCard = {
    background: "#fff",
    padding: 24,
    borderRadius: 18,
    boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
};

const textarea = {
    width: "100%",
    minHeight: 120,
    padding: 14,
    borderRadius: 14,
    border: "1px solid #e5e7eb",
    outline: "none",
    fontSize: 14,
    marginBottom: 14,
};

const postActions = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
};

const autoWhiteBtn = {
    padding: "8px 16px",
    background: "#fff",
    color: "#7c3aed",
    border: "none",
    borderRadius: 10,
    fontWeight: 700,
    cursor: "pointer",
};

const postTitle = {
    marginBottom: 16,
    fontSize: 20,
    fontWeight: 700,
};

const label = {
    fontSize: 13,
    fontWeight: 600,
    color: "#374151",
    marginBottom: 6,
    display: "block",
};

const row = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 20,
    marginBottom: 20,
};

const inputCard = {
    background: "#f9fafb",
    padding: 14,
    borderRadius: 14,
    border: "1px solid #e5e7eb",
};

const fileInput = {
    width: "100%",
};

const datetimeInput = {
    width: "100%",
    padding: "10px",
    borderRadius: 10,
    border: "1px solid #d1d5db",
    fontSize: 14,
};

const hint = {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 4,
    display: "block",
};

const publishBtn = {
    width: "100%",
    marginTop: 10,
    padding: "14px",
    background: "linear-gradient(135deg,#7c3aed,#ec4899)",
    color: "#fff",
    border: "none",
    borderRadius: 14,
    fontWeight: 700,
    fontSize: 15,
    cursor: "pointer",
};