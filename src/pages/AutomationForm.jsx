import { useState, useEffect } from "react";
import axios from "axios";

const AutomationForm = () => {
  const [prompt, setPrompt] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [times, setTimes] = useState([""]); // 🔹 array of times
  const [accounts, setAccounts] = useState([]);
  const [selectedAccounts, setSelectedAccounts] = useState([]);
  const [loading, setLoading] = useState(false);

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
          `https://automatedpostingbackend.onrender.com/automation/accounts/${userId}`,
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
    setSelectedAccounts((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
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
      await axios.post("https://automatedpostingbackend.onrender.com/automation/auto-publish", {
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


  return (
    <div style={styles.container}>
      <h2>AI Automation Posting</h2>

      <textarea
        placeholder="Enter your content idea..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        style={styles.textarea}
      />

      <label>Start Date</label>
      <input
        type="date"
        value={startDate}
        min={formatDate(today)}
        onChange={(e) => { setStartDate(e.target.value); setEndDate(""); }}
        style={styles.input}
      />

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

      <label>Times</label>
      {times.map((t, index) => (
        <div key={index} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: 8 }}>
          <input
            type="time"
            value={t}
            onChange={(e) => handleTimeChange(index, e.target.value)}
            style={{ flex: 1, padding: 8 }}
          />
          {times.length > 1 && (
            <button onClick={() => removeTime(index)} style={{ cursor: "pointer" }}>❌</button>
          )}
        </div>
      ))}
      {times.length < 3 && (
        <button onClick={addTime} style={{ marginBottom: 12, cursor: "pointer" }}>➕ Add Time</button>
      )}

      <h4>Select Social Accounts</h4>
      {accounts.length === 0 && <p>No accounts connected</p>}
      {accounts.map((acc) => (
        <div key={acc._id} style={styles.checkboxRow}>
          <input
            type="checkbox"
            checked={selectedAccounts.includes(acc._id)}
            onChange={() => toggleAccount(acc._id)}
          />
          <span>{acc.platform} — {acc.meta?.name || acc.meta?.username}</span>
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

const styles = {
  container: { maxWidth: 520, margin: "40px auto", padding: 20, border: "1px solid #ddd", borderRadius: 8, background: "#fff" },
  textarea: { width: "100%", height: 100, marginBottom: 12, padding: 8 },
  input: { width: "100%", marginBottom: 12, padding: 8 },
  checkboxRow: { display: "flex", alignItems: "center", gap: 8, marginBottom: 6 },
  button: { marginTop: 15, padding: 12, width: "100%", cursor: "pointer", fontWeight: "bold" },
};

export default AutomationForm;
