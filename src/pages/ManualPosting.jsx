import { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

// 🔹 Import your existing components
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";

const ManualPosting = () => {
    const [prompt, setPrompt] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
     const [accounts, setAccounts] = useState([]);
    const [selectedAccounts, setSelectedAccounts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [mediaFile, setMediaFile] = useState(null);
    const [times, setTimes] = useState([""]); // default 1 time input
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

                // console.log("Fetching accounts for userId:", userId);

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
                <div style={styles.manualcontainer}>
                    <div style={styles.page}>
                        <div style={styles.card}>
                            <h1 style={styles.title}>Manual Posting</h1>

                            {/* MAIN FLEX LAYOUT */}
                            <div style={styles.mainLayout}>

                                {/* LEFT SIDE – 60% */}
                                <div style={styles.left}>

                                    {/* PROMPT */}
                                    <div style={styles.section}>
                                        <label style={styles.label}>Post Caption</label>
                                        <textarea
                                            placeholder="Enter your caption here..."
                                            value={prompt}
                                            onChange={(e) => setPrompt(e.target.value)}
                                            style={styles.textarea}
                                        />
                                    </div>

                                    {/* IMAGE / VIDEO */}
                                    <div style={styles.uploadBox}>
                                        <input
                                            type="file"
                                            accept="image/*,video/*"
                                            onChange={handleFileChange}
                                            style={styles.hiddenFile}
                                            id="mediaUpload"
                                        />
                                        <label htmlFor="mediaUpload" style={styles.uploadLabel}>
                                            📤 Click to upload image / video
                                        </label>

                                        {mediaFile && (
                                            <p style={styles.fileName}>
                                                Selected: {mediaFile.name}
                                            </p>
                                        )}
                                    </div>

                                    {/* DATES */}
                                    <div style={styles.row}>
                                        <div style={{ flex: 1 }}>
                                            <label style={styles.label}>Start Date</label>
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
                                            <label style={styles.label}>End Date</label>
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

                                    {/* POST TIMES */}
                                    <div style={styles.section}>
                                        <label style={styles.label}>Post Times (max 3)</label>

                                        {times.map((t, index) => (
                                            <div key={index} style={styles.timeRow}>
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
                                                        style={styles.removeBtn}
                                                    >
                                                        ✕
                                                    </button>
                                                )}
                                            </div>
                                        ))}

                                        {times.length < 3 && (
                                            <button
                                                type="button"
                                                onClick={addTime}
                                                style={styles.addTimeBtn}
                                            >
                                                + Add Time
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* RIGHT SIDE – 40% */}
                                <div style={styles.right}>
                                    <h3 style={styles.sideTitle}>Social Accounts</h3>

                                    {renderPlanMessage()}

                                    {accounts.length === 0 && (
                                        <p style={styles.empty}>No accounts connected</p>
                                    )}

                                    {accounts.map((acc) => (
                                        <div key={acc._id} style={styles.accountRow}>
                                            <input
                                                type="checkbox"
                                                checked={selectedAccounts.includes(acc._id)}
                                                disabled={
                                                    selectedAccounts.length >=
                                                    getMaxSelectableAccounts(decodedToken) &&
                                                    !selectedAccounts.includes(acc._id)
                                                }
                                                onChange={() => toggleAccount(acc._id)}
                                            />
                                            <span>
                                                {acc.platform} —{" "}
                                                {acc.meta?.name ||
                                                    acc.meta?.username ||
                                                    acc.meta?.boardName}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* SUBMIT */}
                            <button
                                onClick={submitAutomation}
                                disabled={loading}
                                style={styles.submitBtn}
                            >
                                {loading ? "Creating..." : "Create Manual Post"}
                            </button>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
};

/* =======================
   STYLES
======================== */
const styles = {
    /* ===== PAGE ROOT ===== */
    manualcontainer: {
        minHeight: "100vh",
        background: "#f5f7fb",
        padding: "20px 24px"
    },

    page: {
        width: "100%"
    },

    /* ===== REMOVE CARD FEEL COMPLETELY ===== */
    card: {
        width: "100%",
        background: "transparent",
        padding: 0,
        borderRadius: 0
    },

    title: {
        fontSize: 26,
        fontWeight: 700,
        marginBottom: 24,
        color: "#7c3aed"
    },

    /* ===== MAIN LAYOUT ===== */
    mainLayout: {
        display: "flex",
        gap: 32,
        alignItems: "flex-start"
    },

    left: {
        paddingLeft: 6,
        flex: 0.8
    },
    right: {
        flex: 0.4,
        paddingLeft: 12,
        borderLeft: "1px solid #e5e7eb",
        maxHeight: "calc(100vh - 160px)",
        overflowY: "auto",
    },

    /* ===== FORM SECTIONS ===== */
    section: {
        marginBottom: 24
    },

    row: {
        display: "flex",
        gap: 25,
        marginBottom: 24
    },

    label: {
        fontSize: 10,
        fontWeight: 400,
        marginBottom: 2,
        display: "block",
        color: "#374151"
    },

    textarea: {
        width: "100%",
        minHeight: 130,
        padding: "14px 16px",
        borderRadius: 10,
        border: "1px solid #d1d5db",
        fontSize: 12,
        outline: "none",
        background: "#fff"
    },

    input: {
        width: "100%",
        padding: "12px 14px",
        borderRadius: 10,
        border: "1px solid #d1d5db",
        fontSize: 14,
        outline: "none",
        background: "#fff"
    },

    /* ===== IMAGE UPLOAD (MODERN) ===== */
    uploadBox: {
        border: "2px dashed #c7d2fe",
        borderRadius: 12,
        padding: 22,
        textAlign: "center",
        background: "#eef2ff",
        cursor: "pointer",
        marginBottom: 24
    },

    hiddenFile: {
        display: "none"
    },

    uploadLabel: {
        fontSize: 14,
        fontWeight: 600,
        color: "#4f46e5",
        cursor: "pointer"
    },

    fileName: {
        fontSize: 12,
        marginTop: 8,
        color: "#6b7280"
    },

    /* ===== POST TIMES ===== */
    timeRow: {
        display: "flex",
        gap: 12,
        marginBottom: 10
    },

    removeBtn: {
        background: "#ef4444",
        color: "#fff",
        border: "none",
        borderRadius: 8,
        padding: "0 14px",
        cursor: "pointer"
    },

    addTimeBtn: {
        background: "#7c3aed",
        color: "#fff",
        border: "none",
        borderRadius: 10,
        padding: "8px 14px",
        fontSize: 13,
        cursor: "pointer"
    },
    upgradeLink: {
        marginLeft: 6,
        marginRight: 6,
        color: "#7c3aed",
        fontWeight: 600,
        textDecoration: "none"
    },

    /* ===== RIGHT SIDE ===== */
    sideTitle: {
        fontSize: 18,
        fontWeight: 700,
        marginBottom: 10,
        color: "#111827"
    },

    accountRow: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 14px",
        marginBottom: 8,
        borderRadius: 10,
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        fontSize: 14,
        cursor: "pointer",
        transition: "all 0.2s ease"
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

    /* ===== SUBMIT ===== */
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
    }
};

export default ManualPosting;