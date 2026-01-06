import { useEffect, useState } from "react";
import axios from "axios";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function WeeklyCalendar() {
    const [weekStart, setWeekStart] = useState(getMonday(new Date()));
    const [posts, setPosts] = useState([]);

    const [selectedPost, setSelectedPost] = useState(null);

    function getMonday(date) {
        const d = new Date(date);
        const day = d.getDay() || 7;
        if (day !== 1) d.setDate(d.getDate() - day + 1);
        return d;
    }

    const formatDate = (date) => date.toISOString().split("T")[0];

    useEffect(() => {
        fetchPosts();
    }, [weekStart]);

    const fetchPosts = async () => {
        const userId = localStorage.getItem("userId");

        const res = await axios.get(
            `https://automatedpostingbackend-h9dc.onrender.com/automation/weekly/${userId}?weekStart=${formatDate(weekStart)}`
        );
         console.log("Fetched posts:", res.data);
        setPosts(res.data.data || []);
    };

    const getPostsForDate = (date) => {
        const d = formatDate(date);
        return posts.filter(p => p.date === d);
    };

    const changeWeek = (days) => {
        const newDate = new Date(weekStart);
        newDate.setDate(newDate.getDate() + days);
        setWeekStart(getMonday(newDate));
    };

    return (
        <div>
            <h2>Weekly Planner</h2>

            {/* CONTROLS */}
            <div style={{ marginBottom: 15 }}>
                <button onClick={() => changeWeek(-7)}>⬅ Prev</button>
                <button onClick={() => setWeekStart(getMonday(new Date()))}>Today</button>
                <button onClick={() => changeWeek(7)}>Next ➡</button>
            </div>

            {/* WEEK GRID */}
            <div style={styles.grid}>
                {days.map((day, index) => {
                    const date = new Date(weekStart);
                    date.setDate(weekStart.getDate() + index);

                    const dayPosts = getPostsForDate(date);

                    return (
                        <div key={day} style={styles.dayBox}>
                            {/* HEADER */}
                            <div style={styles.dayHeader}>
                                <strong>{day}</strong>
                                <span style={{ fontSize: 12 }}>{formatDate(date)}</span>
                            </div>

                            {/* COUNT */}
                            <div style={styles.count}>
                                {dayPosts.length} scheduled
                            </div>

                            {/* POSTS OR EMPTY */}
                            {dayPosts.length === 0 ? (
                                <div style={styles.empty}>
                                    No posts scheduled
                                </div>
                            ) : (
                                dayPosts.map((p, i) => (
                                    <div
                                        key={i}
                                        style={styles.postCard}
                                        onClick={() => setSelectedPost(p)}
                                    >
                                        <div style={styles.postTop}>
                                            <span>{p.time}</span>

                                            <span style={{
                                                fontSize: 10,
                                                padding: "2px 6px",
                                                borderRadius: 4,
                                                background: p.source === "automation" ? "#fde68a" : "#bfdbfe",
                                                color: "#000",
                                                marginLeft: 6
                                            }}>
                                                {p.source}
                                            </span>

                                            <span style={styles.platform}>{p.platform}</span>
                                        </div>


                                        {p.mediaUrl && p.mediaType === "image" && (
                                            <img
                                                src={p.mediaUrl}
                                                alt="post"
                                                style={styles.thumbnail}
                                            />
                                        )}

                                        {p.message && (
                                            <div style={styles.caption}>
                                                {p.message.slice(0, 40)}...
                                            </div>
                                        )}
                                    </div>
                                ))

                            )}
                        </div>
                    );
                })}
            </div>

            {selectedPost && (
                <div style={styles.modalOverlay} onClick={() => setSelectedPost(null)}>
                    <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <h3 style={{ marginBottom: 10 }}>Post Details</h3>

                        <p><b>Platform:</b> {selectedPost.platform}</p>
                        <p><b>Time:</b> {selectedPost.time}</p>
                        <p><b>Status:</b> {selectedPost.status}</p>

                        {selectedPost.mediaUrl && selectedPost.mediaType === "image" && (
                            <img
                                src={selectedPost.mediaUrl}
                                alt="media"
                                style={styles.modalImage}
                            />
                        )}

                        {selectedPost.message && (
                            <p style={{ marginTop: 10 }}>
                                <b>Caption:</b><br />
                                {selectedPost.message}
                            </p>
                        )}

                        <button
                            style={styles.closeBtn}
                            onClick={() => setSelectedPost(null)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
};

const styles = {
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(7, 1fr)",
        gap: 10,
    },
    dayBox: {
        border: "1px solid #ddd",
        borderRadius: 8,
        padding: 10,
        minHeight: 220,
        background: "#fff",
    },
    dayHeader: {
        display: "flex",
        justifyContent: "space-between",
        marginBottom: 5,
    },
    count: {
        fontSize: 12,
        fontWeight: "bold",
        marginBottom: 8,
    },
    empty: {
        fontSize: 12,
        color: "#999",
        marginTop: 20,
        textAlign: "center",
    },
    postCard: {
        background: "#f3f4f6",
        borderRadius: 4,
        padding: "4px 6px",
        marginBottom: 5,
        fontSize: 12,
        display: "flex",
        justifyContent: "space-between",
    },
    platform: {
        textTransform: "capitalize",
    },
    thumbnail: {
        width: "100%",
        height: 60,
        objectFit: "cover",
        borderRadius: 4,
        marginTop: 4,
    },

    caption: {
        fontSize: 11,
        color: "#555",
        marginTop: 4,
    },

    postTop: {
        display: "flex",
        justifyContent: "space-between",
        fontSize: 11,
    },

    modalOverlay: {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
    },

    modal: {
        background: "#fff",
        padding: 20,
        width: 350,
        borderRadius: 8,
        maxHeight: "80vh",
        overflowY: "auto",
    },

    modalImage: {
        width: "100%",
        marginTop: 10,
        borderRadius: 6,
    },

    closeBtn: {
        marginTop: 15,
        padding: "6px 12px",
        background: "#111",
        color: "#fff",
        border: "none",
        borderRadius: 4,
        cursor: "pointer",
    },
};
