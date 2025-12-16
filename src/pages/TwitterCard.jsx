import React from "react";

const TwitterCard = ({ account, connect, disconnect }) => {
    return (
        <div>
            {account ? (
                <>
                    {/* Profile Info */}
                    <div style={styles.profileRow}>
                        <img
                            src={
                                account.profileImage ||
                                `https://unavatar.io/twitter/${account.username}`
                            }
                            alt="Profile"
                            style={styles.avatar}
                        />
                        <div>
                            <div style={styles.name}>
                                {account.name || account.username}
                            </div>
                            <div style={styles.username}>
                                @{account.username}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div style={styles.actions}>
                        <button
                            style={styles.manageBtn}
                            onClick={() =>
                                (window.location.href = "/twitter-manager")
                            }
                        >
                            Manage
                        </button>

                        <button
                            style={styles.disconnectBtn}
                            onClick={disconnect}
                        >
                            Disconnect
                        </button>
                    </div>
                </>
            ) : (
                <>
                    {/* Helper Text (before connect) */}
                    <p style={styles.helperText}>
                        Connect your Twitter account to schedule tweets, manage
                        replies and automate posting easily 
                    </p>

                    <button onClick={connect} style={styles.connectBtn}>
                        Connect Twitter
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
        marginBottom: 10,
    },

    avatar: {
        width: 48,
        height: 48,
        borderRadius: "50%",
    },

    name: {
        fontWeight: 600,
    },

    username: {
        fontSize: 13,
        color: "#6b7280",
    },

    actions: {
        display: "flex",
        gap: 10,
        marginTop: 10,
    },

    manageBtn: {
        flex: 1,
        padding: 10,
        borderRadius: 8,
        border: "none",
        background: "#1DA1F2",
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
        background: "#111827",
        color: "#fff",
        fontWeight: 600,
        cursor: "pointer",
        width: "100%",
    },
};

export default TwitterCard;