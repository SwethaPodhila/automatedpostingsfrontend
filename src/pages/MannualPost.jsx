import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";

export default function FacebookManualPost() {
  const [pages, setPages] = useState([]);
  const [selectedPage, setSelectedPage] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [message, setMessage] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [responseMsg, setResponseMsg] = useState("");
  const [sidebarWidth, setSidebarWidth] = useState(50);

  const navigate = useNavigate();

  // Fetch pages
  useEffect(() => {
    const savedUserId = localStorage.getItem("userId");
    if (!savedUserId) return;

    axios
      .get(`https://automatedpostingbackend.onrender.com/social/pages/${savedUserId}`)
      .then((res) => setPages(res.data.pages || []))
      .catch((err) => console.error(err));
  }, []);

  // Auto-select first page
  useEffect(() => {
    if (pages.length > 0) setSelectedPage(pages[0].providerId);
  }, [pages]);

  const handleGenerateAI = async () => {
    if (!aiPrompt.trim()) return alert("Please enter an AI prompt!");
    setLoading(true);
    try {
      const res = await axios.post("https://automatedpostingbackend.onrender.com/social/ai-generate", { prompt: aiPrompt });
      if (res.data.text) {
        setMessage(res.data.text);
        setResponseMsg("✨ AI Caption Generated!");
      }
    } catch (err) {
      console.error(err);
      setResponseMsg("❌ AI failed to generate caption.");
    }
    setLoading(false);
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) setImageFile(e.target.files[0]);
    else setImageFile(null);
  };

  const handlePost = async () => {
    if (!selectedPage) return alert("Select a page first!");
    if (!message.trim() && !imageFile) return alert("Message or image required!");

    // ✅ Schedule time validation (min 10 minutes from now)
    if (scheduleTime) {
      const selectedTime = new Date(scheduleTime);
      const now = new Date();
      const diffInMinutes = (selectedTime - now) / (1000 * 60);

      if (diffInMinutes < 10) {
        return alert("⏰ Schedule time must be at least 10 minutes from now!");
      }
    }

    setLoading(true);
    setResponseMsg("");

    try {
      const formData = new FormData();
      formData.append("pageId", selectedPage);
      formData.append("message", message);
      formData.append("userId", localStorage.getItem("userId"));
      if (imageFile) formData.append("image", imageFile);
      if (aiPrompt) formData.append("aiPrompt", aiPrompt);
      if (scheduleTime) formData.append("scheduleTime", scheduleTime);

      const res = await axios.post(
        "https://automatedpostingbackend.onrender.com/social/publish/facebook",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (res.data.success) {
        setResponseMsg("🎉 Post published successfully!");
        setMessage("");
        setImageFile(null);
        setAiPrompt("");
        setScheduleTime("");
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
      <Navbar />
      <div style={styles.layout}>
        <Sidebar onWidthChange={setSidebarWidth} />
        <main style={{ ...styles.content, marginLeft: sidebarWidth }}>
          {/* Header */}
          <div style={styles.header}>
            <h1 style={styles.title}>Facebook Manual Posting</h1>
            <p style={styles.subtitle}>
              Write posts, generate AI captions, upload images & schedule posts directly
            </p>
          </div>

          {/* Page Selector */}
          <div style={styles.card}>
            <label style={styles.label}>Select Facebook Page</label>
            <select
              value={selectedPage}
              onChange={(e) => setSelectedPage(e.target.value)}
              style={styles.dropdown}
            >
              {pages.map((page) => (
                <option key={page.providerId} value={page.providerId}>
                  {page.meta?.name}
                </option>
              ))}
            </select>
          </div>

          {/* Post Content */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>✍️ Post Content</div>
            <textarea
              placeholder="Write your post here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              style={styles.textarea}
            />
          </div>

          {/* AI Assist */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>💡 AI Assist Prompt (Optional)</div>
            <input
              type="text"
              placeholder="Give instructions for AI content"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              style={styles.input}
            />
            <button
              onClick={handleGenerateAI}
              disabled={loading}
              style={{ ...styles.button, background: "#7c3aed" }}
            >
              ✨ Generate Caption with AI
            </button>
          </div>

          {/* Image + Schedule Row */}
          <div style={styles.row}>
            <div style={{ ...styles.card, flex: 5 }}>
              <div style={styles.cardHeader}>📷 Upload Image (Optional)</div>
              <input type="file" accept="image/*" onChange={handleFileChange} />
              {imageFile && <p>Selected: {imageFile.name}</p>}
            </div>
            <div style={{ ...styles.card, flex: 5 }}>
              <div style={styles.cardHeader}>⏰ Schedule Post (Optional)</div>
              <input
                type="datetime-local"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                style={styles.input}
              />
              <small style={{ color: "#6b7280" }}>Leave empty for immediate publishing</small>
            </div>
          </div>

          {/* Publish Button */}
          <div style={styles.card}>
            <button onClick={handlePost} disabled={loading} style={styles.button}>
              {loading ? "🚀 Posting..." : "Publish"}
            </button>
            {responseMsg && <p style={styles.response}>{responseMsg}</p>}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}

/* ================= STYLES ================= */
const styles = {
  page: { background: "#f5f7fb", minHeight: "100vh" },
  layout: { display: "flex" },
  content: { flex: 1, padding: 30, marginTop: 60 },
  header: { marginBottom: 25 },
  title: { margin: 0, fontSize: 26, fontWeight: 700, color: "rgb(124, 58, 237)" },
  subtitle: { marginTop: 6, color: "#6b7280" },
  card: {
    background: "#fff",
    padding: 20,
    borderRadius: 16,
    boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
    marginBottom: 20,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  cardHeader: { fontWeight: 600, fontSize: 16, marginBottom: 8, color: "#111827" },
  label: { fontWeight: 600, color: "#111827" },
  dropdown: { width: "100%", padding: 12, borderRadius: 10, border: "1px solid #d1d5db" },
  textarea: {
    width: "100%",
    padding: 14,
    borderRadius: 12,
    border: "1px solid #d1d5db",
    fontSize: 16,
    resize: "vertical",
  },
  input: { width: "100%", padding: 12, borderRadius: 10, border: "1px solid #d1d5db", fontSize: 14 },
  button: {
    padding: 12,
    background: "linear-gradient(135deg,#7c3aed,#ec4899)",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: 16,
    transition: "0.3s",
  },
  response: { marginTop: 10, fontWeight: 600, fontSize: 15, color: "rgb(124, 58, 237)" },
  row: { display: "flex", gap: 20, marginBottom: 20, flexWrap: "wrap" },
};
