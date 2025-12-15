import React from "react";
import { useNavigate } from "react-router-dom";


const InstagramCard = ({ account, connect, disconnect }) => {
    const navigate = useNavigate();
    return (
        <div>
            {account ? (
                <>
                    {/* Connected badge 
                    <span style={styles.connectedBadge}>Connected</span>
*/}
                    {/* Profile row */}
                    <div style={styles.profileRow}>
                        <img
                            src={
                                account.meta?.picture ||
                                "https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png"
                            }
                            alt="IG Profile"
                            style={styles.avatar}
                        />

                        <div>
                            <p style={styles.name}>
                                {account.meta?.name || account.meta?.username || "Instagram"}
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
                            onClick={() => navigate("/instagram-dashboard")}
                        >
                            Manage
                        </button>

                        <button
                            onClick={() => disconnect("instagram")}
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
                        Connect your Instagram business account to schedule posts and
                        auto-publish directly.
                    </p>

                    <button onClick={connect} style={styles.connectBtn}>
                        Connect Instagram
                    </button>
                </>
            )}
        </div>
    );
};

const styles = {
    connectedBadge: {
        background: "#e6f7ee",
        color: "#16a34a",
        fontSize: 12,
        fontWeight: 600,
        padding: "4px 10px",
        borderRadius: 20,
        width: "fit-content",
        marginBottom: 12,
    },

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
        background: "#8b5cf6",
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
        background: "#C13584",
        color: "#fff",
        fontWeight: 600,
        cursor: "pointer",
        width: "100%",
    },
};

export default InstagramCard;
