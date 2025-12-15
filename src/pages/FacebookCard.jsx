import React from "react";

const FacebookCard = ({ account, connect, disconnect, navigate }) => {
    return (
        <div>
            {account ? (
                <>
                    {/* Profile Info */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            padding: 10,
                            borderRadius: 10,
                            background: "#f4f4f4",
                        }}
                    >
                        <img
                            src={account.meta?.picture}
                            alt={account.meta?.name}
                            style={{ width: 50, height: 50, borderRadius: "50%" }}
                        />
                        <span style={{ color: "green", fontWeight: "bold" }}>
                            {account.meta?.name}
                        </span>
                    </div>

                    {/* Buttons */}
                    <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                        <button
                            onClick={() => navigate("/success")}
                            style={styles.manageBtn}
                        >
                            Manage
                        </button>

                        <button
                            onClick={() => disconnect("facebook")}
                            style={styles.disconnectBtn}
                        >
                            Disconnect
                        </button>
                    </div>
                </>
            ) : (
                <>
                    {/* ✅ Helper text (ONLY when not connected) */}
                    <p style={styles.helperText}>
                        Connect your Facebook Page to schedule posts, manage comments
                        and publish automatically 🚀
                    </p>

                    <button onClick={connect} style={styles.facebookBtn}>
                        Connect Facebook
                    </button>
                </>
            )
            }
        </div >
    );
};

const styles = {
    facebookBtn: {
        padding: 10,
        borderRadius: 8,
        backgroundColor: "#1877f2",
        color: "#fff",
        border: "none",
        width: "100%",
        cursor: "pointer",
    },

    manageBtn: {
        flex: 1,
        padding: 10,
        borderRadius: 8,
        backgroundColor: "#2563eb",
        color: "#fff",
        border: "none",
        cursor: "pointer",
        fontWeight: 600,
    },

    disconnectBtn: {
        flex: 1,
        padding: 10,
        borderRadius: 8,
        backgroundColor: "#ff4d4f",
        color: "#fff",
        border: "none",
        cursor: "pointer",
        fontWeight: 600,
    },
    helperText: {
        fontSize: 14,
        color: "#747982ff",
        marginBottom: 20,
        lineHeight: 1.5,
    },
};

export default FacebookCard;
