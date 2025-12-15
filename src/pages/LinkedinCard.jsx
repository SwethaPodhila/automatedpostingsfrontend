import React from "react";

const LinkedInCard = ({ connect }) => {
    return (
        <div>
            {/* Helper text */}
            <p style={styles.helperText}>
                Connect your LinkedIn account to publish professional posts,
                share updates and grow your network effortlessly 💼
            </p>

            <button onClick={connect} style={styles.connectBtn}>
                Connect LinkedIn
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
        backgroundColor: "#0077B5",
        color: "#fff",
        border: "none",
        fontWeight: 600,
        cursor: "pointer",
        width: "100%",
    },
};

export default LinkedInCard;
