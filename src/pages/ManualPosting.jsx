import { useEffect, useState } from "react";
import axios from "axios";

const ManualPosting = () => {
    const [prompt, setPrompt] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [time, setTime] = useState("");
    const [accounts, setAccounts] = useState([]);
    const [selectedAccounts, setSelectedAccounts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [mediaFile, setMediaFile] = useState(null);

    const [times, setTimes] = useState([""]); // default 1 time input

    const addTime = () => {
        if (times.length >= 3) {
            alert("Maximum 3 times per day allowed");
            return;
        }
        setTimes([...times, ""]);
    };

    const removeTime = (index) => {
        setTimes(times.filter((_, i) => i !== index));
    };


    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Optional validation
        if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
            alert("Please upload only image or video");
            return;
        }

        setMediaFile(file);
    };

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
                const userId = localStorage.getItem("userId");

                if (!userId) {
                    console.warn("User ID not found in localStorage");
                    setAccounts([]);
                    return;
                }

                console.log("Fetching accounts for userId:", userId);

                const res = await axios.get(
                    `http://localhost:5000/automation/accounts/${userId}`,
                    { headers: { "Cache-Control": "no-cache" } }
                );

                setAccounts(res.data?.data || []);
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
       UI
    ======================== */

    const submitAutomation = async () => {
        if (!prompt || selectedAccounts.length === 0) {
            alert("Please fill all required fields");
            return;
        }

        try {
            setLoading(true);

            const groupedAccounts = groupAccountsByPlatform();
            const userId = localStorage.getItem("userId");

            const requests = Object.entries(groupedAccounts).map(
                async ([platform, pageIds]) => {

                    const formData = new FormData();

                    formData.append("platform", platform);
                    formData.append("userId", userId);
                    formData.append("message", prompt);
                    formData.append("pageIds", JSON.stringify(pageIds)); // 🔥 SEND ARRAY

                    const validTimes = times.filter(t => t); // empty array allowed

                    formData.append("times", JSON.stringify(validTimes)); // [] ok
                    formData.append("startDate", startDate || "");
                    formData.append("endDate", endDate || "");

                    if (mediaFile) {
                        formData.append("media", mediaFile);
                    }

                    return axios.post(
                        "http://localhost:5000/automation/publish",
                        formData,
                        {
                            headers: { "Content-Type": "multipart/form-data" }
                        }
                    );
                }
            );

            await Promise.all(requests);
            alert("Posts scheduled for all selected pages ✅");

        } catch (error) {
            console.error("Automation error:", error);
            alert("Failed to create automation ❌");
        } finally {
            setLoading(false);
        }
    };

    const groupAccountsByPlatform = () => {
        return selectedAccounts.reduce((acc, accountId) => {
            const account = accounts.find(a => a._id === accountId);
            if (!account) return acc;

            if (!acc[account.platform]) {
                acc[account.platform] = [];
            }

            // 🔥 THIS IS THE KEY FIX
            acc[account.platform].push(account.providerId);

            return acc;
        }, {});
    };


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

            {/* IMAGE / VIDEO (OPTIONAL) */}
            <label>Image / Video (optional)</label>
            <input
                type="file"
                accept="image/*,video/*"
                onChange={handleFileChange}
                style={styles.input}
            />

            {mediaFile && (
                <p style={{ fontSize: 13 }}>
                    Selected: {mediaFile.name}
                </p>
            )}

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

            <label>Post Times (max 3)</label>

            {times.map((t, index) => (
                <div key={index} style={{ display: "flex", gap: 10, marginBottom: 8 }}>
                    <input
                        type="time"
                        value={t}
                        onChange={(e) => {
                            const updated = [...times];
                            updated[index] = e.target.value;
                            setTimes(updated);
                        }}
                        style={{ ...styles.input, flex: 1 }}
                    />

                    {times.length > 1 && (
                        <button
                            type="button"
                            onClick={() => removeTime(index)}
                            style={{ background: "#ff4d4d", color: "#fff" }}
                        >
                            ✖
                        </button>
                    )}
                </div>
            ))}

            {times.length < 3 && (
                <button
                    type="button"
                    onClick={addTime}
                    style={{
                        background: "#4caf50",
                        color: "#fff",
                        padding: "6px 10px",
                        marginBottom: 10
                    }}
                >
                    ➕ Add Time
                </button>
            )}

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

export default ManualPosting;
