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
                        {posts.map((post) => (
                            <div
                                key={post._id}
                                style={{
                                    background: "#fff",
                                    borderRadius: "12px",
                                    padding: "16px",
                                    boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: "13px",
                                        color: "#1877f2",
                                        marginBottom: "6px",
                                    }}
                                >
                                    Facebook
                                </div>

                                <p
                                    style={{
                                        fontSize: "14px",
                                        marginBottom: "8px",
                                    }}
                                >
                                    {post.message || "(No caption)"}
                                </p>

                                {post.imageName && (
                                    <img
                                        src={`https://automatedpostingbackend.onrender.com/uploads/${post.imageName}`}
                                        alt="Post"
                                        style={{
                                            width: "100%",
                                            height: "180px",
                                            objectFit: "cover",
                                            borderRadius: "10px",
                                            marginBottom: "10px",
                                            border: "1px solid #eee",
                                        }}
                                        onError={(e) => {
                                            e.target.style.display = "none";
                                        }}
                                    />
                                )}

                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        fontSize: "12px",
                                        color: "#555",
                                        borderTop: "1px solid #eee",
                                        paddingTop: "8px",
                                    }}
                                >
                                    <span>
                                        {new Date(post.createdAt).toLocaleString()}
                                    </span>

                                    <span
                                        style={{
                                            padding: "3px 10px",
                                            borderRadius: "12px",
                                            color: "#fff",
                                            backgroundColor:
                                                post.status === "posted"
                                                    ? "green"
                                                    : post.status === "scheduled"
                                                        ? "#0d6efd"
                                                        : "red",
                                        }}
                                    >
                                        {post.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </main>
            </div>

            <Footer />
        </>
    );
}
