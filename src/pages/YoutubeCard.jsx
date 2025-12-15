import React from "react";

const YouTubeCard = ({ connect }) => {
    return (
        <div>
            {/* Helper text */}
            <p style={styles.helperText}>
                Connect your YouTube channel to upload videos, manage content,
                and schedule posts directly from your dashboard 
            </p>

            <button onClick={connect} style={styles.connectBtn}>
                Connect YouTube
            </button>
        </div>
    );
};

const styles = {
    helperText: {
        fontSize: 14,
        color: "#6b7280",
        marginBottom: 16,
        lineHeight: 1.5,
    },

    connectBtn: {
        padding: 12,
        borderRadius: 10,
        backgroundColor: "#FF0000",
        color: "#fff",
        border: "none",
        fontWeight: 600,
        cursor: "pointer",
        width: "100%",
    },
};

export default YouTubeCard;
