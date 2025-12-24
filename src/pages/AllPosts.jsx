import React, { useEffect, useState } from "react";
import axios from "axios";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";

const BACKEND_URL = "https://automatedpostingbackend.onrender.com";

export default function AllPosts() {
    const userId = localStorage.getItem("userId");

    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sidebarWidth, setSidebarWidth] = useState(50);

    const [platformFilter, setPlatformFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedDate, setSelectedDate] = useState("");

    useEffect(() => {
        if (!userId) return;

        const fetchPosts = async () => {
            try {
                const res = await axios.get(
                    `${BACKEND_URL}/social/posts/${userId}`
                );
                if (res.data.success) {
                    setPosts(res.data.posts);
                }
            } catch (err) {
                console.error("Fetch posts error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, [userId]);

    const truncateText = (text, maxLength = 160) => {
        if (!text) return "";
        return text.length > maxLength
            ? text.substring(0, maxLength) + "..."
            : text;
    };

    const filteredPosts = posts.filter((post) => {
        const postDate = new Date(post.createdAt).toISOString().split("T")[0];

        const matchesPlatform =
            platformFilter === "all" || post.platform === platformFilter;

        const matchesStatus =
            statusFilter === "all" || post.status === statusFilter;

        const matchesDate =
            !selectedDate || postDate === selectedDate;

        return matchesPlatform && matchesStatus && matchesDate;
    });

    return (
        <>
            <Navbar />

            <div style={{ display: "flex", minHeight: "calc(100vh - 120px)" }}>
                <Sidebar onWidthChange={setSidebarWidth} />

                <main
                    style={{
                        marginLeft: sidebarWidth,
                        transition: "0.3s",
                        flex: 1,
                        padding: "20px",
                        background: "#f4f6f8",
                    }}
                >

                    <h2 style={{ marginBottom: "20px" }}>
                        📄 My Posts
                    </h2>

                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "18px",
                            flexWrap: "wrap",
                            marginBottom: "22px",
                            background: "#ffffff",
                            padding: "16px 26px",
                            borderRadius: "12px",
                            boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
                        }}
                    >
                        {/* PLATFORM */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            <label style={styles.label}>Platform</label>
                            <select
                                style={styles.select}
                                value={platformFilter}
                                onChange={(e) => setPlatformFilter(e.target.value)}
                            >
                                <option value="all">All</option>
                                <option value="instagram">Instagram</option>
                                <option value="facebook">Facebook</option>
                            </select>
                        </div>

                        {/* STATUS */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            <label style={styles.label}>Status</label>
                            <select
                                style={styles.select}
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="all">All</option>
                                <option value="posted">Posted</option>
                                <option value="scheduled">Scheduled</option>
                                <option value="failed">Failed</option>
                            </select>
                        </div>

                        {/* DATE */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            <label style={styles.label}>Date</label>
                            <input
                                type="date"
                                style={styles.input}
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                            />
                        </div>
                    </div>


                    {loading && <p>Loading posts...</p>}

                    {!loading && posts.length === 0 && (
                        <p style={{ color: "#777" }}>
                            No posts found
                        </p>
                    )}

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(auto-fill, minmax(280px, 1fr))",
                            gap: "16px",
                        }}
                    >
                        {filteredPosts.map((post) => (
                            <div
                                key={post._id}
                                style={{
                                    background: "#fff",
                                    borderRadius: "14px",
                                    padding: "18px",
                                    boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "10px",
                                }}
                            >
                                {/* PLATFORM + STATUS */}
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                    }}
                                >
                                    <span
                                        style={{
                                            padding: "4px 12px",
                                            borderRadius: "20px",
                                            fontSize: "11px",
                                            fontWeight: "600",
                                            background:
                                                post.platform === "instagram"
                                                    ? "linear-gradient(45deg,#f58529,#dd2a7b,#8134af)"
                                                    : "#1877f2",
                                            color: "#fff",
                                            textTransform: "capitalize",
                                        }}
                                    >
                                        {post.platform}
                                    </span>

                                </div>

                                {/* MESSAGE */}
                                <p
                                    style={{
                                        fontSize: "14px",
                                        color: "#333",
                                        lineHeight: "1.5",
                                        margin: 0,
                                    }}
                                >
                                    <p
                                        title={post.message}
                                        style={{
                                            fontSize: "14px",
                                            color: "#333",
                                            lineHeight: "1.5",
                                            margin: 0,
                                        }}
                                    >
                                        {truncateText(post.message || "(No caption)", 160)}
                                    </p>

                                </p>

                                {/* POST URL */}
                                {post.mediaUrl && (
                                    <a
                                        href={post.mediaUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            fontSize: "13px",
                                            color: "#2563eb",
                                            textDecoration: "none",
                                            fontWeight: "500",
                                            wordBreak: "break-all",
                                        }}
                                    >
                                        🔗 View Post
                                    </a>
                                )}

                                {/* DATE */}
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <div
                                        style={{
                                            fontSize: "12px",
                                            color: "#6b7280",
                                            borderTop: "1px solid #eee",
                                            paddingTop: "8px",
                                            marginTop: "6px",
                                        }}
                                    >
                                        {new Date(post.createdAt).toLocaleString()}
                                    </div>
                                    <span
                                        style={{
                                            padding: "3px 10px",
                                            marginTop: "10px",
                                            borderRadius: "12px",
                                            fontSize: "11px",
                                            color: "#fff",
                                            backgroundColor:
                                                post.status === "posted"
                                                    ? "#16a34a"
                                                    : post.status === "scheduled"
                                                        ? "#2563eb"
                                                        : "#dc2626",
                                            textTransform: "capitalize",
                                        }}
                                    >
                                        {post.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {!loading && filteredPosts.length === 0 && (
                            <p style={{ color: "#777" }}>
                                No posts match the selected filters
                            </p>
                        )}

                    </div>
                </main>
            </div>

            <Footer />
        </>
    );
}

const styles = {
    label: {
        fontSize: "12px",
        fontWeight: "600",
        color: "#6b7280",
    },
    select: {
        padding: "8px 12px",
        borderRadius: "8px",
        border: "1px solid #d1d5db",
        fontSize: "14px",
        outline: "none",
        background: "#fff",
        minWidth: "150px",
    },
    input: {
        padding: "8px 12px",
        borderRadius: "8px",
        border: "1px solid #d1d5db",
        fontSize: "14px",
        outline: "none",
    },
};
