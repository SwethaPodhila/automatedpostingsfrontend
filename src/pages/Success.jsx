import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function PostToPage() {
  const [pages, setPages] = useState([]);
  const [selectedPage, setSelectedPage] = useState("");
  const [metrics, setMetrics] = useState(null);
  const [metricsLoading, setMetricsLoading] = useState(false);

  const navigate = useNavigate();

  // Fetch pages on mount
  useEffect(() => {
    const savedUserId = localStorage.getItem("userId");
    if (!savedUserId) return;

    axios
      .get(`https://automatedpostingbackend.onrender.com/social/pages/${savedUserId}`)
      .then((res) => setPages(res.data.pages))
      .catch((err) => console.error(err));
  }, []);

  // Auto-select the first page and load its metrics
  useEffect(() => {
    if (pages.length > 0) {
      const firstPageId = pages[0].providerId;
      setSelectedPage(firstPageId);
      loadMetrics(firstPageId);
    }
  }, [pages]);

  // Load metrics for selected page
  const loadMetrics = async (pageId) => {
    setMetrics(null);
    setMetricsLoading(true);
    try {
      const res = await axios.get(`https://automatedpostingbackend.onrender.com/social/metrics/${pageId}`);
      if (res.data.success) setMetrics(res.data.metrics);
    } catch (err) {
      console.error("❌ Metrics load error", err);
    }
    setMetricsLoading(false);
  };

  const handlePageSelect = (id) => {
    setSelectedPage(id);
    if (id) loadMetrics(id);
  };

  return (
    <div style={styles.page}>
      <h1 style={styles.heading}>📊 Facebook Page Dashboard</h1>

      {/* Buttons at Top-Left */}
      <div style={styles.topButtons}>
        <button style={styles.secondaryButton} onClick={() => navigate("/manual-post")}>
          Create Manual Post
        </button>
        <button style={styles.secondaryButton} onClick={() => navigate("/auto-post")}>
          Create Automated Post
        </button>
      </div>

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

      {/* Metrics Loading */}
      {metricsLoading && <div style={styles.loadingBox}>⏳ Fetching metrics...</div>}

      {/* Show Metrics Only After Page Selection */}
      {metrics && (
        <div style={styles.dashboardCard}>
          {/* Header */}
          <div style={styles.profileHeader}>
            <h2 style={{ margin: 0 }}>{metrics.name}</h2>
            <p style={{ margin: 0, color: "gray" }}>Facebook Page Analytics</p>
          </div>

          {/* Metrics Grid */}
          <div style={styles.metricsGrid}>
            {Object.entries(metrics).map(([key, value], i) => (
              <div key={i} style={styles.metricBox}>
                <h4 style={styles.metricKey}>{key}</h4>
                <p style={styles.metricValue}>
                  {typeof value === "object" ? JSON.stringify(value) : value}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { padding: "30px", fontFamily: "Arial", maxWidth: "900px", margin: "auto" },
  heading: { marginBottom: "25px", textAlign: "center" },
  topButtons: { display: "flex", gap: "15px", marginBottom: "25px" },
  section: { marginBottom: "25px" },
  label: { fontSize: "16px", fontWeight: "bold" },
  dropdown: { width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #ccc", marginTop: "8px" },
  loadingBox: { padding: "15px", background: "#f3f3f3", borderRadius: "10px", textAlign: "center", marginBottom: "20px" },
  dashboardCard: { background: "#ffffff", padding: "25px", borderRadius: "15px", boxShadow: "0px 3px 12px rgba(0,0,0,0.1)", marginBottom: "25px" },
  profileHeader: { marginBottom: "20px" },
  metricsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" },
  metricBox: { padding: "15px", background: "#f7f9fc", borderRadius: "12px", boxShadow: "0px 2px 8px rgba(0,0,0,0.05)" },
  metricKey: { color: "#444", marginBottom: "5px", fontWeight: "bold", textTransform: "capitalize" },
  metricValue: { fontSize: "18px", fontWeight: "700", color: "#000" },
  secondaryButton: { padding: "10px 20px", background: "#4CAF50", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600" },
};
