import { useEffect, useState } from "react";
import axios from "axios";

const AutomationForm = () => {
    const [prompt, setPrompt] = useState("");
    const [startTime, setStartTime] = useState("");
    const [frequency, setFrequency] = useState("weekly");
    const [accounts, setAccounts] = useState([]);
    const [selectedAccounts, setSelectedAccounts] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                const userId = localStorage.getItem("userId"); // get stored userId
                const res = await axios.get(`http://localhost:5000/automation/accounts?userId=${userId}`, {
                    headers: {
                        'Cache-Control': 'no-cache'
                    }
                });
                setAccounts(res.data.data || []);
            } catch (err) {
                console.error("Failed to fetch accounts", err);
                setAccounts([]);
            }
        };
        fetchAccounts();
    }, []);


    const toggleAccount = (id) => {
        setSelectedAccounts((prev) =>
            prev.includes(id)
                ? prev.filter((a) => a !== id)
                : [...prev, id]
        );
    };

    const submitAutomation = async () => {
        if (!prompt || !startTime || !selectedAccounts.length) {
            alert("Please fill all fields");
            return;
        }
         const userId = localStorage.getItem("userId");

        setLoading(true);
        try {
            await axios.post("http://localhost:5000/automation/trigger", {
                prompt,
                startTime,
                frequency,
                selectedAccounts,
                userId
            });

            alert("Automation created successfully 🎉");
            setPrompt("");
            setSelectedAccounts([]);
        } catch (err) {
            alert("Failed to create automation");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <h2>AI Automation Posting</h2>

            {/* CONTENT */}
            <textarea
                placeholder="Enter your content idea..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                style={styles.textarea}
            />

            {/* START TIME */}
            <label>Start Time</label>
            <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                style={styles.input}
            />

            {/* FREQUENCY */}
            <label>Frequency</label>
            <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                style={styles.input}
            >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
            </select>

            {/* ACCOUNTS */}
            <h4>Select Social Accounts</h4>
            {Array.isArray(accounts) && accounts.map((acc) => (
                <div key={acc._id}>
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

            <button onClick={submitAutomation} disabled={loading} style={styles.button}>
                {loading ? "Creating..." : "Create Automation"}
            </button>
        </div>
    );
};

const styles = {
    container: {
        maxWidth: 500,
        margin: "40px auto",
        padding: 20,
        border: "1px solid #ddd",
        borderRadius: 8
    },
    textarea: {
        width: "100%",
        height: 100,
        marginBottom: 10
    },
    input: {
        width: "100%",
        marginBottom: 10,
        padding: 6
    },
    button: {
        marginTop: 15,
        padding: 10,
        width: "100%",
        cursor: "pointer"
    }
};


export default AutomationForm;