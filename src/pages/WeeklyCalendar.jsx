import { useEffect, useState } from "react";
import axios from "axios";

const DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const HOURS = Array.from({ length: 12 }, (_, i) => i + 12); // 12PM–11PM

export default function SocialCalendar() {
  const [view, setView] = useState("MONTH");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [posts, setPosts] = useState([]);
  const [source, setSource] = useState("manual");
  const [selectedPost, setSelectedPost] = useState(null);

  const userId = localStorage.getItem("userId");
  const formatDate = d => d.toISOString().split("T")[0];

  /* ================= FETCH ================= */
  useEffect(() => {
    fetchData();
  }, [currentDate]);

  const fetchData = async () => {
    try {
      const monday = getMonday(currentDate);
      const res = await axios.get(
        `https://automatedpostingbackend-h9dc.onrender.com/automation/weekly/${userId}?date=${formatDate(monday)}`
      );
      setPosts(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= HELPERS ================= */
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
    const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    return Array.from({ length: end.getDate() }, (_, i) =>
      new Date(currentDate.getFullYear(), currentDate.getMonth(), i + 1)
    );
  };

  const timeToTop = time => {
    if (!time) return 0;
    const [t, mer] = time.split(" ");
    let [h, m] = t.split(":").map(Number);
    if (mer === "PM" && h !== 12) h += 12;
    if (mer === "AM" && h === 12) h = 0;
    return ((h * 60 + m - 720) / 60) * 60;
  };

  const icon = p =>
    p === "facebook" ? "📘" :
    p === "instagram" ? "📸" :
    p === "linkedin" ? "💼" : "🌐";

  const filtered = posts.filter(p => p.source === source);

  /* ================= NAV ================= */
  const changeDate = dir => {
    const d = new Date(currentDate);
    if (view === "MONTH") d.setMonth(d.getMonth() + dir);
    if (view === "WEEK") d.setDate(d.getDate() + dir * 7);
    if (view === "DAY") d.setDate(d.getDate() + dir);
    setCurrentDate(d);
  };

  return (
    <div style={styles.wrapper}>
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

      {/* MONTH */}
      {view === "MONTH" && (
        <div style={styles.monthGrid}>
          {DAYS.map(d => <div key={d} style={styles.weekHead}>{d}</div>)}
          {monthDays().map((d,i) => (
            <div key={i} style={styles.dayCell}>
              <b>{d.getDate()}</b>
              {filtered
                .filter(p => p.date === formatDate(d))
                .map((p,i) => (
                  <div key={i} style={styles.pill}>{icon(p.platform)} {p.time}</div>
                ))}
            </div>
          ))}
        </div>
      )}

      {/* WEEK (Metricool Style) */}
      {view === "WEEK" && (
        <div style={styles.weekWrap}>
          <div style={styles.timeCol}>
            {HOURS.map(h => <div key={h} style={styles.time}>{h}:00</div>)}
          </div>

          <div style={styles.weekGrid}>
            {weekDays().map((d,i) => (
              <div key={i} style={styles.dayCol}>
                <div style={styles.dayHead}>
                  {DAYS[d.getDay()]} <br /> {d.getDate()}
                </div>

                <div style={styles.dayBody}>
                  {filtered
                    .filter(p => p.date === formatDate(d))
                    .map((p,i) => (
                      <div
                        key={i}
                        style={{ ...styles.post, top: timeToTop(p.time) }}
                        onClick={() => setSelectedPost(p)}
                      >
                        <div style={styles.postHead}>
                          {icon(p.platform)} <span>{p.time}</span>
                        </div>
                        {p.image && <img src={p.image} style={styles.img} />}
                        <div>{p.message}</div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DAY */}
      {view === "DAY" && (
        <div style={styles.dayView}>
          {HOURS.map(h => (
            <div key={h} style={styles.hourRow}>
              <span>{h}:00</span>
              {filtered
                .filter(p =>
                  p.date === formatDate(currentDate) &&
                  p.time?.startsWith(h.toString())
                )
                .map((p,i) => (
                  <div key={i} style={styles.dayPost}>
                    {icon(p.platform)} {p.message}
                  </div>
                ))}
            </div>
          ))}
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
    </div>
  );
}

/* ================= STYLES ================= */
const styles = {
  wrapper:{ padding:20, background:"#f4f6fb", minHeight:"100vh"},
  header:{ display:"flex", justifyContent:"space-between", marginBottom:10},
  actions:{ display:"flex", gap:8, alignItems:"center"},
  select:{ padding:6, borderRadius:6},

  tab:{ padding:"6px 12px", borderRadius:20, border:"1px solid #ccc"},
  active:{ padding:"6px 12px", borderRadius:20, background:"#6366f1", color:"#fff"},

  monthGrid:{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:6},
  weekHead:{ fontWeight:600, textAlign:"center"},
  dayCell:{ background:"#fff", minHeight:80, padding:6, borderRadius:8},
  pill:{ fontSize:11, marginTop:4, background:"#eef2ff", padding:4, borderRadius:6},

  weekWrap:{ display:"flex"},
  timeCol:{ width:60},
  time:{ height:60, fontSize:12},
  weekGrid:{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", flex:1},

  dayCol:{ borderLeft:"1px solid #ddd"},
  dayHead:{ textAlign:"center", fontWeight:600, borderBottom:"1px solid #ddd"},
  dayBody:{ position:"relative", height:HOURS.length*60},

  post:{
    position:"absolute", left:6, right:6, background:"#eef2ff",
    borderRadius:8, padding:6, fontSize:11
  },
  postHead:{ fontWeight:600, marginBottom:4},
  img:{ width:"100%", borderRadius:6, marginBottom:4},

  dayView:{ background:"#fff", padding:10, borderRadius:10},
  hourRow:{ display:"flex", gap:10, borderBottom:"1px solid #eee", height:50},
  dayPost:{ background:"#c7d2fe", padding:6, borderRadius:6},

  overlay:{ position:"fixed", inset:0, background:"rgba(0,0,0,.4)", display:"flex", alignItems:"center", justifyContent:"center"},
  modal:{ background:"#fff", padding:20, borderRadius:10, width:350}
};
