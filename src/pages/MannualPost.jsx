import React, { useEffect, useState } from "react";
import axios from "axios";

export default function FacebookDashboard() {
  const [pages, setPages] = useState([]);
  const [selectedPage, setSelectedPage] = useState("");
  
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [responseMsg, setResponseMsg] = useState("");

  // Fetch pages on mount
  useEffect(() => {
    const savedUserId = localStorage.getItem("userId");
    if (!savedUserId) return;

    axios
      .get(`https://automatedpostingbackend.onrender.com/social/pages/${savedUserId}`)
      .then((res) => setPages(res.data.pages))
      .catch((err) => console.error(err));
  }, []);

  // Auto-select first page
  useEffect(() => {
    if (pages.length > 0) {
      const firstPageId = pages[0].providerId;
      setSelectedPage(firstPageId);
    }
  }, [pages]);


  const handlePageSelect = (pageId) => {
    setSelectedPage(pageId);
  };

  const handlePost = async () => {
    if (!selectedPage) return alert("Select a page first!");
    if (!message.trim()) return alert("Message is empty!");
    setLoading(true);
    setResponseMsg("");

    try {
      const res = await axios.post(
        "https://automatedpostingbackend.onrender.com/publish/facebook",
        { pageId: selectedPage, message }
      );
      if (res.data.success) {
        setResponseMsg("🎉 Post published successfully!");
        setMessage("");
      } else {
        setResponseMsg("❌ Failed to publish post.");
      }
    } catch (err) {
      console.error(err);
      setResponseMsg("❌ Error publishing post.");
    }

    setLoading(false);
  };

  return (
    <div style={styles.page}>
      <h1 style={styles.heading}>📊 Facebook Page Dashboard</h1>

      {/* Select Page */}
      <div style={styles.section}>
        <label style={styles.label}>Select Page</label>
        <select
          value={selectedPage}
          onChange={(e) => handlePageSelect(e.target.value)}
          style={styles.dropdown}
        >
          {pages.map((page) => (
            <option key={page.providerId} value={page.providerId}>
              {page.meta?.name}
            </option>
          ))}
        </select>
      </div>
      

      {/* Manual Post Section */}
      <div style={styles.section}>
        <h2>📤 Publish to Facebook</h2>
        <textarea
          placeholder="Write your post here..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows="4"
          style={styles.textarea}
        />
        <button onClick={handlePost} disabled={loading} style={styles.button}>
          {loading ? "🚀 Posting..." : "Publish"}
        </button>
        {responseMsg && <p style={styles.response}>{responseMsg}</p>}
      </div>
    </div>
  );
}

const styles = {
  page: { padding: "30px", fontFamily: "Arial", maxWidth: "900px", margin: "auto" },
  heading: { marginBottom: "25px", textAlign: "center" },
  section: { marginBottom: "25px", display: "flex", flexDirection: "column", gap: "10px" },
  label: { fontSize: "16px", fontWeight: "bold" },
  dropdown: { width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #ccc" },
  loadingBox: { padding: "15px", background: "#f3f3f3", borderRadius: "10px", textAlign: "center", marginBottom: "20px" },
  dashboardCard: { background: "#ffffff", padding: "20px", borderRadius: "15px", boxShadow: "0px 3px 12px rgba(0,0,0,0.1)", marginBottom: "25px" },
  metricsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" },
  metricBox: { padding: "15px", background: "#f7f9fc", borderRadius: "12px", boxShadow: "0px 2px 8px rgba(0,0,0,0.05)" },
  metricKey: { fontWeight: "bold", color: "#444", marginBottom: "5px", textTransform: "capitalize" },
  metricValue: { fontWeight: "700", fontSize: "16px" },
  textarea: { width: "100%", padding: "14px", borderRadius: "10px", border: "1px solid #ccc", fontSize: "16px" },
  button: { padding: "12px", background: "#1877f2", color: "#fff", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "bold", fontSize: "16px" },
  response: { marginTop: "10px", fontWeight: "bold", fontSize: "15px" },
};
