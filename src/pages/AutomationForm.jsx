import { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Sidebar from "../components/Sidebar";

const AutomationForm = () => {
  const [prompt, setPrompt] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [times, setTimes] = useState([""]); // 🔹 array of times
  const [accounts, setAccounts] = useState([]);
  const [selectedAccounts, setSelectedAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(50);

  const token = localStorage.getItem("token");
  const decodedToken = token ? jwtDecode(token) : null;

  const isFreeTrialActive = (decoded) => {
    if (!decoded) return false;
    if (decoded.plan !== "FREE") return false;
    if (decoded.subscriptionStatus !== "ACTIVE") return false;

    const issuedAt = decoded.iat * 1000; // sec → ms
    const now = Date.now();
    const diffDays = (now - issuedAt) / (1000 * 60 * 60 * 24);

    return diffDays <= 7;
  };

  const getMaxSelectableAccounts = (decoded) => {
    if (!decoded) return 0;

    // ENTERPRISE → unlimited
    if (decoded.plan === "ENTERPRISE") return Infinity;

    // PRO → 3
    if (decoded.plan === "PRO") return 3;

    // FREE
    if (decoded.plan === "FREE") {
      // ❌ subscription inactive → no access
      if (decoded.subscriptionStatus !== "ACTIVE") {
        return 0;
      }

      // ✅ active trial (7 days)
      if (isFreeTrialActive(decoded)) {
        return Infinity;
      }

      // fallback (safety)
      return 0;
    }

    return 0;
  };

  const maxSelectable = getMaxSelectableAccounts(decodedToken);

  const today = new Date();
  today.setDate(today.getDate());

  const formatDate = (date) => date.toISOString().split("T")[0];

  const getMaxEndDate = () => {
    if (!startDate) return "";
    const max = new Date(startDate);
    max.setMonth(max.getMonth() + 1);
    return formatDate(max);
  };

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const userId = localStorage.getItem("userId");
        const res = await axios.get(
          `https://automatedpostingbackend-h9dc.onrender.com/automation/accounts/${userId}`,
          { headers: { "Cache-Control": "no-cache" } }
        );
        setAccounts(res.data.data || []);
      } catch (err) {
        setAccounts([]);
      }
    };
    fetchAccounts();
  }, []);

  const toggleAccount = (id) => {
    setSelectedAccounts((prev) => {
      // already selected → allow unselect
      if (prev.includes(id)) {
        return prev.filter((a) => a !== id);
      }

      // ❌ limit reached
      if (prev.length >= maxSelectable) {
        return prev;
      }

      // ✅ allow select
      return [...prev, id];
    });
  };


  // 🔹 Handle time change
  const handleTimeChange = (index, value) => {
    const newTimes = [...times];
    newTimes[index] = value;
    setTimes(newTimes);
  };

  // 🔹 Add new time input
  const addTime = () => {
    if (times.length < 3) setTimes([...times, ""]);
  };

  // 🔹 Remove a time input
  const removeTime = (index) => {
    const newTimes = times.filter((_, i) => i !== index);
    setTimes(newTimes);
  };

  const submitAutomation = async () => {

    if (!prompt || !startDate || !endDate || times.some(t => !t) || !selectedAccounts.length) {
      alert("Please fill all fields");
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      alert("End date must be after start date");
      return;
    }

    const userId = localStorage.getItem("userId");

    const selectedAccs = accounts.filter(acc =>
      selectedAccounts.includes(acc._id)
    );

    const platform = selectedAccs[0]?.platform;

    // 🔥 SEND providerIds NOT _id
    const pageIds = selectedAccs.map(acc => acc.providerId);

    console.log("🚀 Sending Automation Payload:", {
      userId,
      platform,
      pageIds,
      times
    });

    setLoading(true);
    try {
      await axios.post("https://automatedpostingbackend-h9dc.onrender.com/automation/auto-publish", {
        userId,
        prompt,
        startDate,
        endDate,
        times,
        platform,
        pageIds
      });

      alert("Automation created successfully 🎉");
      setPrompt("");
      setStartDate("");
      setEndDate("");
      setTimes([""]);
      setSelectedAccounts([]);
    } catch (err) {
      console.log("❌ API ERROR:", err.response?.data);
      alert("Failed to create automation");
    } finally {
      setLoading(false);
    }
  };


  const renderPlanMessage = () => {
    if (!decodedToken) return null;

    // ENTERPRISE → no message
    if (decodedToken.plan === "ENTERPRISE") return null;

    // FREE
    if (decodedToken.plan === "FREE") {
      // ❌ subscription inactive → 0 access
      if (decodedToken.subscriptionStatus !== "ACTIVE") {
        return (
          <p style={styles.planMsg}>
            You don’t have access to select social accounts. Please
            <a href="pricing" style={styles.upgradeLink}>
              upgrade
            </a>
             to continue.
          </p>
        );
      }

      // ✅ free trial active → no message
      if (isFreeTrialActive(decodedToken)) {
        return null;
      }
    }

    // PRO
    if (decodedToken.plan === "PRO") {
      return (
        <p style={styles.planMsg}>
          You have access to select only <b>3 pages</b>. Please
          <a href="/pricing" style={styles.upgradeLink}>
            upgrade
          </a>
          to access all pages
        </p>
      );
    }

    return null;
  };

  return (
    <>
      <Navbar />
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
        <div style={styles.page}>
          {/* LEFT SIDE */}
          <div style={styles.left}>
            <h2 style={styles.heading}>AI Automation Posting</h2>

            <label>Post Caption / Prompt</label>
            <textarea
              placeholder="Enter your content idea..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              style={styles.textarea}
            />

            <div style={styles.row}>
              <div style={{ flex: 1 }}>
                <label>Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  min={formatDate(today)}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setEndDate("");
                  }}
                  style={styles.input}
                />
              </div>

              <div style={{ flex: 1 }}>
                <label>End Date</label>
                <input
                  type="date"
                  value={endDate}
                  min={startDate}
                  max={getMaxEndDate()}
                  disabled={!startDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={styles.input}
                />
              </div>
            </div>

            <label>Post Times (max 3)</label>
            {times.map((t, index) => (
              <div key={index} style={styles.timeRow}>
                <input
                  type="time"
                  value={t}
                  onChange={(e) => handleTimeChange(index, e.target.value)}
                  style={styles.input}
                />
                {times.length > 1 && (
                  <button onClick={() => removeTime(index)} style={styles.removeBtn}>
                    ✕
                  </button>
                )}
              </div>
            ))}

            {times.length < 3 && (
              <button onClick={addTime} style={styles.addBtn}>
                + Add Time
              </button>
            )}

            <button
              onClick={submitAutomation}
              disabled={loading}
              style={styles.submitBtn}
            >
              {loading ? "Creating..." : "Create Automation"}
            </button>
          </div>

          {/* RIGHT SIDE */}
          <div style={styles.right}>
            <h3 style={styles.heading}>Social Accounts</h3>
            {renderPlanMessage()}
            {accounts.length === 0 && <p style={styles.empty}>No accounts connected</p>}

            <div style={styles.accountList}>
              {accounts.map((acc) => (
                <label key={acc._id} style={styles.accountItem}>
                  <input
                    type="checkbox"
                    checked={selectedAccounts.includes(acc._id)}
                    disabled={
                      !selectedAccounts.includes(acc._id) &&
                      selectedAccounts.length >= maxSelectable
                    }
                    onChange={() => toggleAccount(acc._id)}
                  />

                  <span>
                    {acc.platform} —{" "}
                    {acc.meta?.name || acc.meta?.username || acc.meta?.boardName}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <Footer />
      </main>
    </>
  );
};

const styles = {
  page: {
    display: "flex",
    gap: 24,
    maxWidth: 1200,
    margin: "40px auto",
  },

  upgradeLink: {
    marginLeft: 6,
    marginRight: 6,
    color: "#7c3aed",
    fontWeight: 600,
    textDecoration: "none"
  },

  left: {
    flex: 7,
    background: "#fff",
    padding: 24,
    borderRadius: 12,
    boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
  },

  right: {
    flex: 3,
    background: "#fff",
    padding: 20,
    borderRadius: 12,
    boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
    maxHeight: "85vh",
    overflowY: "auto",
  },

  heading: {
    marginBottom: 16,
    fontSize: 22,
    fontWeight: 600,
  },

  textarea: {
    width: "100%",
    height: 120,
    padding: 12,
    marginBottom: 16,
    borderRadius: 8,
    border: "1px solid #ccc",
  },

  input: {
    width: "100%",
    padding: 10,
    borderRadius: 8,
    border: "1px solid #ccc",
  },

  row: {
    display: "flex",
    gap: 16,
    marginBottom: 16,
  },

  timeRow: {
    display: "flex",
    gap: 10,
    marginBottom: 10,
    alignItems: "center",
  },

  removeBtn: {
    padding: "6px 10px",
    borderRadius: 6,
    border: "none",
    background: "#ffe6e6",
    cursor: "pointer",
  },

  addBtn: {
    marginTop: 8,
    marginBottom: 16,
    background: "#f0f4ff",
    border: "none",
    padding: "8px 12px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 500,
    background: "#7c3aed",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "8px 14px",
    fontSize: 13,
    cursor: "pointer"
  },

  empty: {
    padding: "18px",
    textAlign: "center",
    fontSize: 14,
    color: "#6b7280",
    background: "linear-gradient(135deg, #7c3aed0d, #ec48990d)",
    border: "1px dashed #c7d2fe",
    borderRadius: 12,
    marginTop: 10,
    fontWeight: 500
  },

  submitBtn: {
    marginTop: 6,
    width: "100%",
    padding: 12,
    borderRadius: 12,
    border: "none",
    fontSize: 16,
    fontWeight: 700,
    cursor: "pointer",
    background: "linear-gradient(90deg, #7c3aed, #ec4899)",
    color: "#fff"
  },

  accountList: {
    display: "flex",
    flexDirection: "column",
    gap: 10, 
    marginTop: 12,
  },

  accountItem: {
    display: "flex",
    gap: 10,
    alignItems: "center",
    padding: 10,
    border: "1px solid #eee",
    borderRadius: 8,
    cursor: "pointer",
  },

  note: {
    fontSize: 13,
    color: "#666",
    marginBottom: 10,
  },
};

export default AutomationForm;