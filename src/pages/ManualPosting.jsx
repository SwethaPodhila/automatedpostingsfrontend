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

    const PLATFORM_APIS = {
        facebook: "http://localhost:5000/social/publish/facebook",
        instagram: "http://localhost:5000/social/publish/instagram",
        twitter: "http://localhost:5000/api/twitter/post",
        linkedin: "http://localhost:5000/api/linkedin/post",
    };

    const submitAutomation = async () => {
        if (!prompt || selectedAccounts.length === 0) {
            alert("Please fill all required fields");
            return;
        }

        try {
            setLoading(true);

            const groupedAccounts = groupAccountsByPlatform();

            const requests = Object.entries(groupedAccounts).map(
                async ([platform, accountIds]) => {

                    const formData = new FormData();
                    formData.append("prompt", prompt);
                    formData.append("startDate", startDate);
                    formData.append("endDate", endDate);
                    formData.append("time", time);
                    formData.append("accounts", JSON.stringify(accountIds));

                    if (mediaFile) {
                        formData.append("media", mediaFile);
                    }

                    const apiUrl = PLATFORM_APIS[platform];
                    if (!apiUrl) return;

                    return axios.post(apiUrl, formData, {
                        headers: { "Content-Type": "multipart/form-data" }
                    });
                }
            );

            await Promise.all(requests);

            alert("Posts scheduled for selected platforms ✅");

        } catch (error) {
            console.error(error);
            alert("Failed to create automation ❌");
        } finally {
            setLoading(false);
        }
    };


    const groupAccountsByPlatform = () => {
        return selectedAccounts.reduce((acc, accountId) => {
            const account = accounts.find((a) => a._id === accountId);
            if (!account) return acc;

            if (!acc[account.platform]) {
                acc[account.platform] = [];
            }
            acc[account.platform].push(account._id);

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

export default ManualPosting;
