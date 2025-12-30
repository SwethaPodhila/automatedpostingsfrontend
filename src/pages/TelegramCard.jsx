import React from "react";
import { useNavigate } from "react-router-dom";

const TelegramCard = ({ account, connect, disconnect }) => {
    const navigate = useNavigate();

    return (
        <div>
            {account ? (
                <>
                    {/* Profile row */}
                    <div style={styles.profileRow}>
                        <img
                            src={
                                account.meta?.photo ||
                                "https://cdn-icons-png.flaticon.com/512/2111/2111646.png"
                            }
                            alt="Telegram"
                            style={styles.avatar}
                        />
                        <div>
                            <p style={styles.name}>
                                {account.meta?.username || account.chatName || "Telegram"}
                            </p>

                        </div>
                    </div>

                    {/* Action buttons */}
                    <div style={styles.actions}>
                        <button
                            style={styles.manageBtn}
                            onClick={() => navigate("/telegram-dashboard")}
                        >
                            Manage
                        </button>

                        <button
                            style={styles.disconnectBtn}
                            onClick={() => disconnect("telegram")}
                        >
                            Disconnect
                        </button>
                    </div>
                </>
            ) : (
                <>
                    <p style={styles.helperText}>
                        Connect your Telegram channel or group to publish posts instantly 🚀
                    </p>

                    <button onClick={connect} style={styles.connectBtn}>
                        Connect Telegram
                    </button>
                </>
            )}
        </div>
    );
};

const styles = {
    profileRow: { display: "flex", alignItems: "center", marginBottom: 10 },
    avatar: { width: 40, height: 40, marginRight: 10, borderRadius: 6 },
    name: { fontWeight: "bold" },
    username: { color: "#6b7280", fontSize: 12 },
    actions: { display: "flex", gap: 10, marginTop: 8 },
    manageBtn: {
        flex: 1,
        padding: 10,
        borderRadius: 8,
        border: "none",
        background: "#229ED9",
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
    helperText: { marginBottom: 8, color: "#6b7280" },
    connectBtn: { background: "#229ED9", color: "#fff", padding: 10, width: "100%", border: "none", borderRadius: 6 },
};

export default TelegramCard;
