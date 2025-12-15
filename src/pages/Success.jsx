import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";

export default function PostToPage() {
  const [pages, setPages] = useState([]);
  const [selectedPage, setSelectedPage] = useState("");
  const [metrics, setMetrics] = useState(null);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(50);

  const navigate = useNavigate();

  /* Fetch pages */
  useEffect(() => {
    const savedUserId = localStorage.getItem("userId");
    if (!savedUserId) return;

    axios
      .get(`https://automatedpostingbackend.onrender.com/social/pages/${savedUserId}`)
      .then((res) => setPages(res.data.pages || []))
      .catch((err) => console.error(err));
  }, []);

  /* Auto select first page */
  useEffect(() => {
    if (pages.length > 0) {
      const firstPageId = pages[0].providerId;
      setSelectedPage(firstPageId);
      loadMetrics(firstPageId);
    }
  }, [pages]);

  const loadMetrics = async (pageId) => {
    setMetrics(null);
    setMetricsLoading(true);
    try {
      const res = await axios.get(`https://automatedpostingbackend.onrender.com/social/metrics/${pageId}`);
      if (res.data.success) setMetrics(res.data.metrics);
    } catch (err) {
      console.error(err);
    }
    setMetricsLoading(false);
  };

  return (
    <div style={styles.page}>
      <Navbar />

      <div style={styles.layout}>
        <Sidebar onWidthChange={setSidebarWidth} />

        <main style={{ ...styles.content, marginLeft: sidebarWidth }}>
          {/* Header */}
          <div style={styles.header}>
            <div>
              <h1 style={styles.title}>Facebook Page Dashboard</h1>
              <p style={styles.subtitle}>
                Manage pages, view insights and publish posts from one place
              </p>
            </div>

            <div style={styles.actions}>
              <button style={styles.secondaryBtn} onClick={() => navigate("/manual-post")}>
                Manual Post
              </button>
              <button style={styles.primaryBtn} onClick={() => navigate("/auto-post")}>
                Automated Post
              </button>
            </div>
          </div>

          {/* Page Selector */}
          <div style={styles.selectorCard}>
            <label style={styles.label}>Select Facebook Page</label>
            <select
              value={selectedPage}
              onChange={(e) => {
                setSelectedPage(e.target.value);
                loadMetrics(e.target.value);
              }}
              style={styles.dropdown}
            >
              {pages.map((page) => (
                <option key={page.providerId} value={page.providerId}>
                  {page.meta?.name}
                </option>
              ))}
            </select>
          </div>

          {/* Loading */}
          {metricsLoading && (
            <div style={styles.loadingCard}>⏳ Loading Facebook Insights...</div>
          )}

          {/* Metrics */}
          {metrics && (
            <div style={styles.analyticsCard}>
              <div style={styles.analyticsHeader}>
                <h2>{metrics.name}</h2>
                <span style={styles.badge}>Live Insights</span>
              </div>

              <div style={styles.metricsGrid}>
                {Object.entries(metrics).map(([key, value]) => (
                  <div key={key} style={styles.metricBox}>
                    <p style={styles.metricLabel}>{key.replace(/_/g, " ")}</p>
                    <h3 style={styles.metricValue}>
                      {typeof value === "object" ? "-" : value}
                    </h3>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  page: {
    background: "#f5f7fb",
    minHeight: "100vh",
  },

  layout: {
    display: "flex",
  },

  content: {
    flex: 1,
    padding: "30px",
    marginTop: "60px",
    transition: "0.3s ease",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
  },

  title: {
    margin: 0,
    fontSize: "26px",
    fontWeight: 700,
  },

  subtitle: {
    marginTop: 6,
    color: "#6b7280",
  },

  actions: {
    display: "flex",
    gap: 12,
  },

  primaryBtn: {
    padding: "10px 18px",
    background: "rgb(124, 58, 237)", // your purple
    color: "#fff",
    border: "none",
    borderRadius: 10,
    fontWeight: 600,
    cursor: "pointer",
  },

  secondaryBtn: {
    padding: "10px 18px",
    background: "rgb(236, 72, 153)", // your pink
    color: "#fff",
    border: "none",
    borderRadius: 10,
    fontWeight: 600,
    cursor: "pointer",
  },

  selectorCard: {
    background: "#fff",
    padding: 20,
    borderRadius: 16,
    boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
    marginBottom: 25,
  },

  label: {
    fontWeight: 600,
    display: "block",
    marginBottom: 8,
  },

  dropdown: {
    width: "100%",
    padding: 12,
    borderRadius: 10,
    border: "1px solid #d1d5db",
  },

  loadingCard: {
    background: "#fff",
    padding: 20,
    borderRadius: 14,
    textAlign: "center",
    fontWeight: 600,
    boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
  },

  analyticsCard: {
    background: "#fff",
    padding: 25,
    borderRadius: 18,
    boxShadow: "0 12px 30px rgba(0,0,0,0.1)",
  },

  analyticsHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },

  badge: {
    background: "rgba(124, 58, 237, 0.1)", // light purple background
    color: "rgb(124, 58, 237)", // purple text
    padding: "6px 14px",
    borderRadius: 20,
    fontSize: 13,
    fontWeight: 600,
  },

  metricsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: 20,
  },

  metricBox: {
    background: "#f7f9fc",
    padding: 20,
    borderRadius: 14,
    textAlign: "center",
  },

  metricLabel: {
    color: "#6b7280",
    marginBottom: 6,
    textTransform: "capitalize",
  },

  metricValue: {
    fontSize: 26,
    fontWeight: 700,
    color: "#111827",
  },
};
