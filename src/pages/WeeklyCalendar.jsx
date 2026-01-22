import { useEffect, useState } from "react";
import axios from "axios";
import {
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaTelegramPlane,
  FaPinterestP,
} from "react-icons/fa";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const HOURS = Array.from({ length: 24 }, (_, i) => i); // ✅ 0–23 FULL DAY

export default function SocialCalendar() {
  const [view, setView] = useState("MONTH");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [posts, setPosts] = useState([]);
  const [source, setSource] = useState("manual");
  const [selectedPost, setSelectedPost] = useState(null);
  const [sidebarWidth, setSidebarWidth] = useState(50);

  const userId = localStorage.getItem("userId");
  //const formatDate = d => d.toISOString().split("T")[0];
  const formatDate = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  /* ================= FETCH ================= */
  useEffect(() => {
    fetchData();
  }, [currentDate, view, source]); // ✅ source add cheyyi

  const fetchData = async () => {
    try {
      let dateParam;

      if (view === "MONTH") {
        dateParam = formatDate(
          new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
        );
      } else {
        dateParam = formatDate(getMonday(currentDate));
      }

      const res = await axios.get(
        `https://automatedpostingbackend-h9dc.onrender.com/automation/weekly/${userId}`,
        {
          params: {
            date: dateParam,
            view: view === "MONTH" ? "monthly" : "weekly",
          },
        }
      );

      setPosts(res.data.data || []);
    } catch (err) {
      console.error("Fetch calendar error:", err);
    }
  };

  /* ================= HELPERS ================= */

  const groupPosts = (posts) => {
    const map = {};
    posts.forEach(p => {
      const key = `${p.date}_${p.time}_${p.message}`;
      if (!map[key]) map[key] = [];
      map[key].push(p);
    });
    return Object.values(map);
  };

  const getMonday = d => {
    const date = new Date(d);
    const day = date.getDay() || 7;
    if (day !== 1) date.setDate(date.getDate() - day + 1);
    return date;
  };

  const weekDays = () => {
    const monday = getMonday(currentDate);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  };

  const monthDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const days = [];

    // ✅ JS getDay(): Sunday=0, Monday=1 ...
    // We want Monday = 0, Sunday = 6
    let startDay = firstDay.getDay();

    // convert Sunday(0) → 6, Monday(1) → 0, ...
    startDay = startDay === 0 ? 6 : startDay - 1;

    // 🔹 padding (previous month empty cells)
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }

    // 🔹 actual month days
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d));
    }

    return days;
  };


  /* ✅ WEEK VIEW POSITION FIX */
  const timeToTop = time => {
    if (!time) return 0;
    const [t, mer] = time.split(" ");
    let [h, m] = t.split(":").map(Number);

    if (mer === "PM" && h !== 12) h += 12;
    if (mer === "AM" && h === 12) h = 0;

    return h * 60 + m; // ✅ full day positioning
  };

  const icon = (p) =>
    p === "facebook" ? <FaFacebook color="#1877F2" /> :
      p === "instagram" ? <FaInstagram color="#E4405F" /> :
        p === "linkedin" ? <FaLinkedin color="#0A66C2" /> :
          p === "telegram" ? <FaTelegramPlane color="#0088cc" /> :
            p === "pinterest" ? <FaPinterestP color="#E60023" /> :
              null;

  const filtered = posts.filter(
    p => p.source?.toLowerCase() === source
  );
  //const filtered = posts.filter(p => p.source === source);

  /* ================= NAV ================= */
  const changeDate = (dir) => {
    const d = new Date(currentDate);

    if (view === "MONTH") {
      // 🔥 Always reset to 1st day of month
      d.setDate(1);
      d.setMonth(d.getMonth() + dir);
    }

    if (view === "WEEK") {
      d.setDate(d.getDate() + dir * 7);
    }

    if (view === "DAY") {
      d.setDate(d.getDate() + dir);
    }

    setCurrentDate(d);
  };

  return (
    <>
      <Navbar />
      <div style={styles.wrapper}>
        <Sidebar onWidthChange={setSidebarWidth} />
        <main
          style={{
            ...styles.content,
            marginLeft: sidebarWidth,
            marginTop: 60,
            transition: "0.3s ease",
            padding: "18px 32px",
          }}
        >

          {/* HEADER */}
          <div style={styles.header}>
            <h2>Content Calendar</h2>

            <div style={styles.actions}>
              <select value={view} onChange={e => setView(e.target.value)} style={styles.select}>
                <option value="MONTH">Month</option>
                <option value="WEEK">Week</option>
                <option value="DAY">Day</option>
              </select>

              <button onClick={() => changeDate(-1)}>◀</button>
              <span>{currentDate.toDateString()}</span>
              <button onClick={() => changeDate(1)}>▶</button>

              <button
                style={source === "manual" ? styles.active : styles.tab}
                onClick={() => setSource("manual")}
              >
                Manual
              </button>

              <button
                style={source === "automation" ? styles.active : styles.tab}
                onClick={() => setSource("automation")}
              >
                Automation
              </button>
            </div>
          </div>

          {/* ============ MONTH VIEW ============ */}
          {view === "MONTH" && (
            <div style={styles.monthGrid}>
              {DAYS.map(d => (
                <div key={d} style={styles.weekHead}>{d}</div>
              ))}

              {monthDays().map((d, i) => {
                if (!d) {
                  return <div key={i} style={styles.dayCell} />; // empty cell
                }

                const dayPosts = filtered.filter(
                  p => p.date === formatDate(d)
                );
                const grouped = groupPosts(dayPosts);

                return (
                  <div key={i} style={styles.dayCell}>
                    <div style={styles.dayDate}>{d.getDate()}</div>

                    <div style={styles.dayPosts}>
                      {grouped.map((group, idx) => (
                        <div key={idx} style={styles.pill}>
                          <div style={styles.pillIcons}>
                            {group.map((p, i) => (
                              <span key={i} style={styles.pillIcon}>
                                {icon(p.platform)}
                              </span>
                            ))}
                          </div>

                          <div style={styles.pillText}>
                            <span style={styles.pillCaption}>{group[0].message}</span>
                            <span style={styles.pillTime}>{group[0].time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

            </div>
          )}

          {/* ============ WEEK VIEW ============ */}
          {view === "WEEK" && (
            <div style={styles.weekWrap}>
              {/* HOURS COLUMN */}
              <div style={styles.timeCol}>
                {HOURS.map(h => (
                  <div key={h} style={{ ...styles.time, height: 60 }}>{h}:00</div>
                ))}
              </div>

              {/* DAYS COLUMN */}
              <div style={styles.weekGrid}>
                {weekDays().map((d, i) => {
                  const dayPosts = filtered.filter(p => p.date === formatDate(d));
                  const grouped = groupPosts(dayPosts);

                  return (
                    <div key={i} style={styles.dayCol}>
                      <div style={styles.dayHead}>
                        {DAYS[d.getDay()]}  {d.getDate()}<br />
                      </div>

                      <div style={{ ...styles.dayBody }}>
                        {grouped.map((group, idx) => {
                          const top = timeToTop(group[0].time) + 30; // 30px header offset
                          return (
                            <div key={idx} style={{ ...styles.post, top, position: "absolute" }}>
                              <div style={styles.pillIcons}>
                                {group.map((p, i) => (
                                  <span key={i} style={styles.pillIcon}>
                                    {icon(p.platform)}
                                  </span>
                                ))}
                              </div>
                              <div style={styles.pillText}>
                                <span style={styles.pillCaption}>{group[0].message}</span>
                                <span style={styles.pillTime}>{group[0].time}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ============ DAY VIEW ============ */}
          {view === "DAY" && (
            <div style={{ display: "flex" }}>
              {/* HOURS column */}
              <div style={{ marginTop: 60, width: 50, borderRight: "1px solid #ccc" }}>
                {HOURS.map(h => (
                  <div key={h} style={{ ...styles.time, height: 60 }}>
                    {h}:00
                  </div>
                ))}
              </div>

              {/* Single day column */}
              <div style={{ flex: 1, position: "relative" }}>
                <div style={{ ...styles.dayHead, textAlign: "center" }}>
                  {DAYS[currentDate.getDay()]} {currentDate.getDate()}
                </div>

                <div style={{ ...styles.dayBody, position: "relative", height: 24 * 60 + 30 }}>
                  {filtered
                    .filter(p => p.date === formatDate(currentDate))
                    .map((p, idx) => {
                      const top = timeToTop(p.time) + 30;
                      return (
                        <div key={idx} style={{ ...styles.post, top, position: "absolute", maxWidth: "12%" }} onClick={() => setSelectedPost(p)}>
                          <div style={styles.pillIcons}>
                            <span style={styles.pillIcon}>{icon(p.platform)}</span>
                          </div>
                          <div style={styles.pillText}>
                            <span style={styles.pillCaption}>{p.message}</span>
                            <span style={styles.pillTime}>{p.time}</span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}

          {/* MODAL */}
          {selectedPost && (
            <div style={styles.overlay} onClick={() => setSelectedPost(null)}>
              <div style={styles.modal} onClick={e => e.stopPropagation()}>
                <h3>{selectedPost.platform}</h3>
                <p>{selectedPost.date} • {selectedPost.time}</p>
                <p>{selectedPost.message}</p>
                <button onClick={() => setSelectedPost(null)}>Close</button>
              </div>
            </div>
          )}
        </main >
      </div>
      <Footer />

    </>
  );
}

/* ================= STYLES ================= */
const styles = {
  wrapper: {
    padding: 20,
    background: "#f4f6fb",
    minHeight: "100vh",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  actions: {
    display: "flex",
    gap: 6,
    alignItems: "center",
  },

  select: {
    padding: "5px 8px",
    borderRadius: 6,
    border: "1px solid #cfd4dc",
    fontSize: 13,
    background: "#fff",
  },

  tab: {
    padding: "5px 12px",
    borderRadius: 6,
    border: "1px solid #cfd4dc",
    background: "#fff",
    fontSize: 13,
    cursor: "pointer",
  },

  active: {
    padding: "5px 12px",
    borderRadius: 6,
    border: "1px solid #6366f1",
    background: "#eef2ff",
    color: "#3730a3",
    fontSize: 13,
    cursor: "pointer",
  },


  /* ===== MONTH VIEW styles ===== */
  monthGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: 6,
  },

  weekHead: {
    fontWeight: 600,
    textAlign: "center",
    fontSize: 13,
  },

  dayDate: {
    fontSize: 12,
    fontWeight: 600,
    color: "#555",
  },

  /* ===== POST PILL ===== */
  pill: {
    background: "#eef2ff",
    borderRadius: 6,
    padding: "4px 6px",

    display: "flex",
    alignItems: "center",
    gap: 6,

    height: 44,
    maxWidth: "100%",
    overflow: "hidden",
  },

  pillIcons: {
    display: "flex",
    gap: 4,
    flexShrink: 0,     // icons shrink avvakunda
  },

  pillIcon: {
    fontSize: 14,
  },

  pillText: {
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    flex: 1,
  },

  pillTime: {
    fontSize: 10,
    fontWeight: 600,
    lineHeight: "12px",
  },

  pillCaption: {
    fontSize: 12,
    color: "#444",
    whiteSpace: "nowrap",   // 🔒 single line
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: 120,          // 🔥 width control
  },
  dayCell: {
    background: "#fff",
    height: 130,              // 🔒 fixed height (same for all days)
    padding: 6,
    borderRadius: 8,

    display: "flex",
    flexDirection: "column",
    gap: 4,

    overflow: "hidden",       // 🔒 outer overflow block
  },

  dayPosts: {
    flex: 1,
    overflowY: "auto",
    paddingRight: 2,
    scrollbarWidth: "thin",          // Firefox
  },

  //weekly styles
  weekWrap: { display: "flex" },
  timeCol: { marginTop: 60, width: 50, borderRight: "1px solid #ccc" },
  weekGrid: { display: "flex", flex: 1 },
  dayCol: { flex: 1, borderLeft: "1px solid #ccc", borderRight: "1px solid #ccc", position: "relative" },
  dayHead: { height: 30, textAlign: "center", borderBottom: "1px solid #ccc", fontWeight: "bold" },
  dayBody: { position: "relative", height: 24 * 60 + 30, borderBottom: "1px solid #ccc", paddingTop: 0 },
  time: { height: 60, borderBottom: "1px solid #eee", textAlign: "right", paddingRight: 5 },
  //post: { background: "#d9f0ff", padding: "2px 4px", borderRadius: 4, fontSize: 12 },
  post: {
    position: "absolute",
    background: "#eef2ff",
    borderRadius: 6,
    padding: "4px 6px",
    boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
    width: "90%", // don’t overflow
    wordBreak: "break-word", // long messages wrap
    zIndex: 1,
  },

};