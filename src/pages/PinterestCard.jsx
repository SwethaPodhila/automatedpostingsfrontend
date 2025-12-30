import React from "react";
import { useNavigate } from "react-router-dom";

const PinterestCard = ({ account, connect, disconnect }) => {
    const navigate = useNavigate();

    return (
        <div>
            {account ? (
                <>
                    {/* Profile row */}
                    <div style={styles.profileRow}>
                        <img
                            src={
                                account.meta?.picture ||
                                "https://upload.wikimedia.org/wikipedia/commons/0/08/Pinterest-logo.png"
                            }
                            alt="Pinterest Profile"
                            style={styles.avatar}
                        />

                        <div>
                            <p style={styles.name}>
                                {account.meta?.name || account.meta?.username || "Pinterest"}
                            </p>
                            <p style={styles.username}>
                                @{account.meta?.username}
                            </p>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div style={styles.actions}>
                        <button
                            style={styles.manageBtn}
                            onClick={() => navigate("/pinterest-dashboard")}
                        >
                            Manage
                        </button>

                        <button
                            onClick={() => disconnect("pinterest")}
                            style={styles.disconnectBtn}
                        >
                            Disconnect
                        </button>
                    </div>
                </>
            ) : (
                <>
                    {/* Helper text */}
                    <p style={styles.helperText}>
                        Connect your Pinterest account to schedule pins and auto-publish directly.
                    </p>

                    <button onClick={connect} style={styles.connectBtn}>
                        Connect Pinterest
                    </button>
                </>
            )}
        </div>
    );
};

const styles = {
    profileRow: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        marginBottom: 16,
    },

    avatar: {
        width: 48,
        height: 48,
        borderRadius: "50%",
    },

    name: {
        fontWeight: 600,
        marginBottom: 2,
    },

    username: {
        fontSize: 13,
        color: "#6b7280",
    },

    actions: {
        display: "flex",
        gap: 10,
    },

    manageBtn: {
        flex: 1,
        padding: 10,
        borderRadius: 8,
        border: "none",
        background: "#E60023", // Pinterest red
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
        fontSize: 14,
        color: "#6b7280",
        marginBottom: 16,
        lineHeight: 1.5,
    },

    connectBtn: {
        padding: 12,
        borderRadius: 10,
        border: "none",
        background: "#E60023",
        color: "#fff",
        fontWeight: 600,
        cursor: "pointer",
        width: "100%",
    },
};

export default PinterestCard;