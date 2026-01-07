import { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

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
                    `https://automatedpostingbackend-h9dc.onrender.com/automation/accounts/${userId}`,
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
        const maxLimit = getMaxSelectableAccounts(decodedToken);

        setSelectedAccounts((prev) => {
            if (prev.includes(id)) {
                return prev.filter((a) => a !== id);
            }

            if (prev.length >= maxLimit) {
                alert(
                    maxLimit === Infinity
                        ? "Upgrade required"
                        : `Your plan allows only ${maxLimit} accounts`
                );
                return prev;
            }

            return [...prev, id];
        });
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
                        "https://automatedpostingbackend-h9dc.onrender.com/automation/publish",
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
                    You have access to select only <b>3 pages</b>.Please 
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
        <div style={styles.container}>
            <div style={styles.page}>
                <div style={styles.card}>
                    <h1 style={styles.title}>Manual Posting</h1>

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
                    {renderPlanMessage()}
                    {accounts.length === 0 && <p>No accounts connected</p>}
                    {accounts.map((acc) => (
                        <div key={acc._id} style={styles.checkboxRow}>
                            <input
                                type="checkbox"
                                checked={selectedAccounts.includes(acc._id)}
                                disabled={
                                    selectedAccounts.length >= getMaxSelectableAccounts(decodedToken) &&
                                    !selectedAccounts.includes(acc._id)
                                }
                                onChange={() => toggleAccount(acc._id)}
                            />

                            <span>
                                {acc.platform} — {acc.meta?.name || acc.meta?.username || acc.meta?.boardName}
                            </span>
                        </div>
                    ))}

                    <button
                        onClick={submitAutomation}
                        disabled={loading}
                        style={styles.button}
                    >
                        {loading ? "Creating..." : "Create Manual Post"}
                    </button>
                </div>
            </div>
        </div>
    );
};

/* =======================
   STYLES
======================== */
const styles = {
    page: {
        minHeight: "100vh",
        background: "linear-gradient(135deg, #7c3aed, #ec4899)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "30px"
    },

    card: {
        width: "100%",
        maxWidth: 900,
        background: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(10px)",
        borderRadius: 20,
        padding: "30px 28px",
        boxShadow: "0 30px 60px rgba(0,0,0,0.25)"
    },

    title: {
        textAlign: "center",
        fontSize: 24,
        fontWeight: 800,
        marginBottom: 25,
        color: "#111827"
    },

    label: {
        fontSize: 14,
        fontWeight: 600,
        marginBottom: 6,
        display: "block",
        color: "#374151"
    },

    textarea: {
        width: "100%",
        minHeight: 120,
        padding: 14,
        borderRadius: 12,
        border: "1px solid #d1d5db",
        fontSize: 14,
        outline: "none",
        marginBottom: 18
    },

    input: {
        width: "100%",
        padding: 12,
        borderRadius: 12,
        border: "1px solid #d1d5db",
        fontSize: 14,
        outline: "none",
        marginBottom: 16
    },

    fileInfo: {
        fontSize: 13,
        color: "#6b7280",
        marginBottom: 16
    },

    timeRow: {
        display: "flex",
        gap: 10,
        marginBottom: 10
    },

    removeBtn: {
        background: "#ef4444",
        border: "none",
        borderRadius: 10,
        color: "#fff",
        padding: "0 14px",
        cursor: "pointer",
        fontSize: 16
    },

    addBtn: {
        background: "#10b981",
        border: "none",
        borderRadius: 10,
        color: "#fff",
        padding: "8px 14px",
        cursor: "pointer",
        fontSize: 13,
        marginBottom: 18
    },

    section: {
        fontSize: 15,
        fontWeight: 700,
        margin: "20px 0 12px",
        color: "#111827"
    },

    account: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 14px",
        borderRadius: 12,
        border: "1px solid #e5e7eb",
        marginBottom: 10,
        background: "#f9fafb"
    },

    button: {
        width: "100%",
        padding: 15,
        borderRadius: 14,
        border: "none",
        background: "linear-gradient(135deg,#7c3aed,#ec4899)",
        color: "#fff",
        fontSize: 16,
        fontWeight: 700,
        cursor: "pointer",
        boxShadow: "0 15px 30px rgba(124,58,237,0.45)",
        marginTop: 20
    },

    disabled: {
        opacity: 0.6,
        cursor: "not-allowed"
    },
    upgradeLink: {
        marginLeft: 6,
        marginRight: 6,
        color: "#6366f1",
        fontWeight: 600,
        textDecoration: "none"
    }
};

export default ManualPosting;
