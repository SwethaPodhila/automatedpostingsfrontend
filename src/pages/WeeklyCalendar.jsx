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
    try {
      const userId = localStorage.getItem("userId");

      const res = await axios.get(
        `https://automatedpostingbackend-h9dc.onrender.com/automation/weekly/${userId}?date=${formatDate(weekStart)}`
      );

      setPosts(res.data.data || []);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  const getPostsForDate = (date) => {
    const d = formatDate(date);
    return posts.filter((p) => p.date === d);
  };

  const changeWeek = (days) => {
    const newDate = new Date(weekStart);
    newDate.setDate(newDate.getDate() + days);
    setWeekStart(getMonday(newDate));
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>📅 Weekly Planner</h2>

      {/* CONTROLS */}
      <div style={styles.controls}>
        <button style={styles.btn} onClick={() => changeWeek(-7)}>⬅ Prev</button>
        <button style={styles.btn} onClick={() => setWeekStart(getMonday(new Date()))}>Today</button>
        <button style={styles.btn} onClick={() => changeWeek(7)}>Next ➡</button>
      </div>

      {/* GRID */}
      <div style={styles.grid}>
        {days.map((day, index) => {
          const date = new Date(weekStart);
          date.setDate(weekStart.getDate() + index);

          const dayPosts = getPostsForDate(date);

          return (
            <div key={day} style={styles.dayBox}>
              <div style={styles.dayHeader}>
                <strong>{day}</strong>
                <span style={styles.date}>{formatDate(date)}</span>
              </div>

              <div style={styles.count}>{dayPosts.length} posts</div>

              {dayPosts.length === 0 ? (
                <div style={styles.empty}>No posts</div>
              ) : (
                dayPosts.map((p, i) => (
                  <div
                    key={i}
                    style={styles.postCard}
                    onClick={() => setSelectedPost(p)}
                  >
                    <div style={styles.postTop}>
                      <span>{p.time}</span>

                      <span
                        style={{
                          ...styles.badge,
                          background: p.source === "automation" ? "#fde68a" : "#bfdbfe",
                        }}
                      >
                        {p.source}
                      </span>

                      <span style={styles.platform}>{p.platform}</span>
                    </div>

                    {p.mediaUrl && p.mediaType === "image" && (
                      <img src={p.mediaUrl} alt="media" style={styles.thumb} />
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

      {/* MODAL */}
      {selectedPost && (
        <div style={styles.overlay} onClick={() => setSelectedPost(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3>Post Details</h3>

            <p><b>Platform:</b> {selectedPost.platform}</p>
            <p><b>Time:</b> {selectedPost.time}</p>
            <p><b>Status:</b> {selectedPost.status}</p>
            <p><b>Source:</b> {selectedPost.source}</p>

            {selectedPost.mediaUrl && (
              <img src={selectedPost.mediaUrl} alt="media" style={styles.modalImg} />
            )}

            {selectedPost.message && (
              <p style={{ marginTop: 10 }}>
                <b>Caption:</b><br />{selectedPost.message}
              </p>
            )}

            <button style={styles.closeBtn} onClick={() => setSelectedPost(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  container: {
    padding: 20,
    fontFamily: "Arial, sans-serif",
    background: "#f9fafb",
  },
  title: {
    marginBottom: 10,
  },
  controls: {
    display: "flex",
    gap: 10,
    marginBottom: 20,
  },
  btn: {
    padding: "6px 14px",
    border: "1px solid #ccc",
    borderRadius: 6,
    cursor: "pointer",
    background: "#fff",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: 10,
  },
  dayBox: {
    background: "#fff",
    borderRadius: 10,
    padding: 10,
    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
    minHeight: 180,
  },
  dayHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  date: {
    fontSize: 12,
    color: "#666",
  },
  count: {
    fontSize: 12,
    marginBottom: 5,
    color: "#555",
  },
  empty: {
    fontSize: 12,
    color: "#aaa",
    marginTop: 20,
    textAlign: "center",
  },
  postCard: {
    border: "1px solid #eee",
    borderRadius: 6,
    padding: 6,
    marginBottom: 6,
    cursor: "pointer",
  },
  postTop: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 12,
  },
  badge: {
    fontSize: 10,
    padding: "2px 6px",
    borderRadius: 4,
  },
  platform: {
    marginLeft: "auto",
    fontSize: 11,
    color: "#444",
  },
  thumb: {
    width: "100%",
    marginTop: 6,
    borderRadius: 4,
  },
  caption: {
    fontSize: 12,
    marginTop: 5,
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modal: {
    background: "#fff",
    padding: 20,
    borderRadius: 10,
    width: 350,
    maxHeight: "80vh",
    overflowY: "auto",
  },
  modalImg: {
    width: "100%",
    marginTop: 10,
    borderRadius: 6,
  },
  closeBtn: {
    marginTop: 15,
    padding: "6px 12px",
    borderRadius: 6,
    border: "none",
    background: "#111",
    color: "#fff",
    cursor: "pointer",
  },
};