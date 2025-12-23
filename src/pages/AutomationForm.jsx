import { useEffect, useState } from "react";
import axios from "axios";

const AutomationForm = () => {
  const [prompt, setPrompt] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [time, setTime] = useState("");
  const [accounts, setAccounts] = useState([]);
  const [selectedAccounts, setSelectedAccounts] = useState([]);
  const [loading, setLoading] = useState(false);

  /* =======================
     DATE HELPERS
  ======================== */
  const today = new Date();

  //const today = new Date();
  today.setDate(today.getDate() + 0);

  const formatDate = (date) => date.toISOString().split("T")[0];

  const getMaxEndDate = () => {
    if (!startDate) return "";
    const max = new Date(startDate);
    max.setMonth(max.getMonth() + 1);
    return formatDate(max);
  };

  /* =======================
     FETCH ACCOUNTS
  ======================== */

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const userId = localStorage.getItem("userId")
        console.log("Fetching accounts for userId:", userId);
        const res = await axios.get(
          `http://localhost:5000/automation/accounts/${userId}`,
          { headers: { "Cache-Control": "no-cache" } }
        );
        setAccounts(res.data.data || []);
      } catch (err) {
        console.error("Failed to fetch accounts", err);
        setAccounts([]);
      }
    };
    fetchAccounts();
  }, []);

  /* =======================
     TOGGLE ACCOUNT
  ======================== */
  const toggleAccount = (id) => {
    setSelectedAccounts((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  /* =======================
     SUBMIT
  ======================== */

  const submitAutomation = async () => {
    if (!prompt || !startDate || !endDate || !time || !selectedAccounts.length) {
      alert("Please fill all fields");
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      alert("End date must be after start date");
      return;
    }

    const userId = localStorage.getItem("userId");

    setLoading(true);
    try {
      await axios.post("http://localhost:5000/automation/trigger", {
        userId,
        prompt,
        startDate,
        endDate,
        time,
        pageIds: selectedAccounts
      });

      alert("Automation created successfully 🎉");

      setPrompt("");
      setStartDate("");
      setEndDate("");
      setTime("");
      setSelectedAccounts([]);
    } catch (err) {
      alert("Failed to create automation");
    } finally {
      setLoading(false);
    }
  };

  /* =======================
     UI
  ======================== */
  return (
    <div style={styles.container}>
      <h2>AI Automation Posting</h2>

      {/* PROMPT */}
      <textarea
        placeholder="Enter your content idea..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        style={styles.textarea}
      />

      {/* START DATE */}
      <label>Start Date</label>
      <input
        type="date"
        value={startDate}
        min={formatDate(today)}
        onChange={(e) => {
          setStartDate(e.target.value);
          setEndDate(""); // 🔥 reset end date
        }}
        style={styles.input}
      />

      {/* END DATE */}
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

      {/* TIME */}
      <label>Time</label>
      <input
        type="time"
        value={time}
        onChange={(e) => setTime(e.target.value)}
        style={styles.input}
      />

      {/* ACCOUNTS */}
      <h4>Select Social Accounts</h4>
      {accounts.length === 0 && <p>No accounts connected</p>}
      {accounts.map((acc) => (
        <div key={acc._id} style={styles.checkboxRow}>
          <input
            type="checkbox"
            checked={selectedAccounts.includes(acc._id)}
            onChange={() => toggleAccount(acc._id)}
          />
          <span>
            {acc.platform} — {acc.meta?.name || acc.meta?.username}
          </span>
        </div>
      ))}

      <button
        onClick={submitAutomation}
        disabled={loading}
        style={styles.button}
      >
        {loading ? "Creating..." : "Create Automation"}
      </button>
    </div>
  );
};

/* =======================
   STYLES
======================== */
const styles = {
  container: {
    maxWidth: 520,
    margin: "40px auto",
    padding: 20,
    border: "1px solid #ddd",
    borderRadius: 8,
    background: "#fff"
  },
  textarea: {
    width: "100%",
    height: 100,
    marginBottom: 12,
    padding: 8
  },
  input: {
    width: "100%",
    marginBottom: 12,
    padding: 8
  },
  checkboxRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 6
  },
  button: {
    marginTop: 15,
    padding: 12,
    width: "100%",
    cursor: "pointer",
    fontWeight: "bold"
  }
};

export default AutomationForm;
