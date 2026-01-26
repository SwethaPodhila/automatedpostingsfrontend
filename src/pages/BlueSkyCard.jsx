import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const BACKEND_URL = "http://localhost:5000";

const BlueSkyCard = ({ account, disconnect }) => {
    const navigate = useNavigate();

    const [open, setOpen] = useState(false);
    const [handle, setHandle] = useState("");
    const [appPassword, setAppPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const connectBlueSky = async () => {
        try {
            setLoading(true);

            const userId = localStorage.getItem("userId"); // 👈 userId fetch
            if (!userId) {
                alert("User not logged in");
                return;
            }

            await axios.post(
                `${BACKEND_URL}/bluesky/connect`,
                { handle, appPassword, userId } // 👈 userId pass
            );

            alert("Bluesky connected successfully 🌤️");
            setOpen(false);
            window.location.reload();
        } catch (err) {
            alert(err.response?.data?.message || "Connection failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            {account ? (
                <>
                    {/* Profile row */}
                    <div style={styles.profileRow}>
                        <img
                            src={
                                account.meta?.avatar ||
                                "https://seeklogo.com/images/B/bluesky-logo-5C2C1E2D5C-seeklogo.com.png"
                            }
                            alt="Bluesky"
                            style={styles.avatar}
                        />
                        <div>
                            <p style={styles.name}>
                                {account.meta?.handle || "Bluesky"}
                            </p>
                            <p style={styles.username}>
                                @{account.meta?.handle}
                            </p>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div style={styles.actions}>
                        <button
                            style={styles.manageBtn}
                            onClick={() => navigate("/bluesky-dashboard")}
                        >
                            Manage
                        </button>

                        <button
                            style={styles.disconnectBtn}
                            onClick={() => disconnect("bluesky")}
                        >
                            Disconnect
                        </button>
                    </div>
                </>
            ) : (
                <>
                    <p style={styles.helperText}>
                        Connect your Bluesky account to publish posts automatically 🌤️
                    </p>

                    <button
                        onClick={() => setOpen(true)}
                        style={styles.connectBtn}
                    >
                        Connect Bluesky
                    </button>
                </>
            )}

            {/* 🔥 Modal */}
            {open && (
                <div style={styles.overlay}>
                    <div style={styles.modal}>
                        <h3>Connect Bluesky</h3>

                        <input
                            placeholder="Handle (name.bsky.social)"
                            value={handle}
                            onChange={(e) => setHandle(e.target.value)}
                            style={styles.input}
                        />

                        <input
                            type="password"
                            placeholder="App Password"
                            value={appPassword}
                            onChange={(e) => setAppPassword(e.target.value)}
                            style={styles.input}
                        />

                        <div style={{ display: "flex", gap: 10 }}>
                            <button
                                onClick={connectBlueSky}
                                disabled={loading}
                                style={styles.manageBtn}
                            >
                                {loading ? "Connecting..." : "Connect"}
                            </button>

                            <button
                                onClick={() => setOpen(false)}
                                style={styles.disconnectBtn}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const styles = {
    profileRow: {
        display: "flex",
        alignItems: "center",
        marginBottom: 10,
    },
    heading: {
      marginBottom: 1,
    },
    avatar: {
        width: 50,
        height: 50,
        marginRight: 10,
        borderRadius: 50,
    },
    name: {
        fontWeight: "bold",
        marginBottom: 4,
    },
    username: {
        color: "#6b7280",
        fontSize: 12,
    },
    actions: {
        display: "flex",
        gap: 10,
        marginTop: 8,
    },
    manageBtn: {
        flex: 1,
        padding: 10,
        borderRadius: 8,
        border: "none",
        background: "#0284c7",
        color: "#fff",
        fontWeight: 600,
        cursor: "pointer",
    },
    disconnectBtn: {
        flex: 1,
        padding: 10,
        borderRadius: 8,
        border: "none",
        background: "#ef4444",
        color: "#fff",
        fontWeight: 600,
        cursor: "pointer",
    },
    helperText: {
        marginBottom: 8,
        color: "#6b7280",
    },
    connectBtn: {
        background: "#0284c7",
        color: "#fff",
        padding: 10,
        width: "100%",
        border: "none",
        borderRadius: 6,
        cursor: "pointer",
        fontWeight: 600,
    },
    overlay: {
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
    },
    modal: {
        background: "#fff",
        padding: 20,
        borderRadius: 8,
        width: 350,
    },
    input: {
        width: "100%",
        padding: 8,
        marginBottom: 10,
    },
};

export default BlueSkyCard;