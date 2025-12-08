import React, { useEffect, useState } from "react";
import axios from "axios";

export default function PostToPage() {
  const [pages, setPages] = useState([]);
  const [selectedPage, setSelectedPage] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [responseMsg, setResponseMsg] = useState("");

  const [metrics, setMetrics] = useState(null); // <-- NEW

  useEffect(() => {
    const savedUserId = localStorage.getItem("userId");

    if (!savedUserId) {
      console.error("❌ No userId found");
      return;
    }

    axios
      .get(
        `https://automatedpostingbackend.onrender.com/social/pages/${savedUserId}`
      )
      .then((res) => setPages(res.data.pages))
      .catch((err) => console.error(err));
  }, []);

  // 🔥 Load metrics when page is selected
  const loadMetrics = async (pageId) => {
    setMetrics(null);

    try {
      const res = await axios.get(
        `https://automatedpostingbackend.onrender.com/social/metrics?pageId=${pageId}`
      );
      if (res.data.success) setMetrics(res.data.metrics);
    } catch (err) {
      console.error("❌ Metrics load error", err);
      setMetrics(null);
    }
  };

  const handleSelectPage = (id) => {
    setSelectedPage(id);
    loadMetrics(id); // Load metrics automatically
  };

  const handlePost = async () => {
    if (!selectedPage) return alert("Please select a page");
    if (!message.trim()) return alert("Message cannot be empty");

    setLoading(true);
    setResponseMsg("");

    try {
      const res = await axios.post(
        "https://automatedpostingbackend.onrender.com/publish/facebook",
        { pageId: selectedPage, message }
      );

      res.data.success
        ? setResponseMsg("🎉 Post published successfully!")
        : setResponseMsg("❌ Failed to publish post");
    } catch (err) {
      console.error(err);
      setResponseMsg("❌ Error publishing post");
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: "30px" }}>
      <h2>Post to Facebook Page</h2>

      {/* Page Dropdown */}
      <label>Select Page</label>
      <select
        value={selectedPage}
        onChange={(e) => handleSelectPage(e.target.value)}
        style={{
          padding: "10px",
          width: "300px",
          marginBottom: "20px",
          display: "block",
        }}
      >
        <option value="">-- Select Page --</option>

        {pages.map((page) => (
          <option key={page.providerId} value={page.providerId}>
            {page.meta?.name}
          </option>
        ))}
      </select>

      {/* 📊 Metrics Display */}
      {metrics && (
        <div
          style={{
            border: "1px solid #ddd",
            padding: "15px",
            marginBottom: "20px",
            width: "320px",
            borderRadius: "8px",
            background: "#f9f9f9",
          }}
        >
          <h3>📊 Page Metrics</h3>
          <p><strong>Name:</strong> {metrics.name}</p>
          <p><strong>Followers:</strong> {metrics.followers_count}</p>
          <p><strong>Likes:</strong> {metrics.fan_count}</p>
          <p><strong>Engagement:</strong> {metrics.engagement?.count || "N/A"}</p>
        </div>
      )}

      {/* Message textarea */}
      <textarea
        placeholder="Write your post here..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows="5"
        style={{
          width: "300px",
          padding: "10px",
          borderRadius: "5px",
          marginBottom: "20px",
        }}
      />

      {/* Publish Button */}
      <button
        onClick={handlePost}
        disabled={loading}
        style={{
          padding: "10px 20px",
          background: "#1877f2",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        {loading ? "Posting..." : "Publish Post"}
      </button>

      {responseMsg && (
        <p style={{ marginTop: "20px", fontWeight: "bold" }}>{responseMsg}</p>
      )}
    </div>
  );
}
