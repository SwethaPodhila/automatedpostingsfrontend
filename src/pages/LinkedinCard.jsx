import React from "react";

const LinkedInCard = ({ connect, linkedinAccount, disconnectLinkedIn }) => {
    const manageLinkedIn = () => {
        window.location.href = "/linkedin-manager";
    };

    return (
        <div>
            {linkedinAccount ? (
                <>
                    <div style={styles.linkedinAccountInfo}>
                        <div style={styles.linkedinAccountRow}>
                            <img
                                src={linkedinAccount.profileImage || "https://cdn-icons-png.flaticon.com/512/174/174857.png"}
                                alt="Profile"
                                style={styles.linkedinProfileImage}
                                onError={(e) => {
                                    e.target.src = "https://cdn-icons-png.flaticon.com/512/174/174857.png";
                                }}
                            />
                            <div style={styles.linkedinAccountDetails}>
                                <p style={styles.linkedinAccountName}>{linkedinAccount.name}</p>
                                {linkedinAccount.headline && (
                                    <p style={styles.linkedinHeadline}>{linkedinAccount.headline}</p>
                                )}
                            </div>
                        </div>
                    </div>
                    <div style={styles.linkedinButtonGroup}>
                        <button
                            onClick={manageLinkedIn}
                            style={{
                                ...styles.linkedinBtn,
                                backgroundColor: "#0077B5",
                                flex: 1
                            }}
                        >
                            Manage
                        </button>
                        <button
                            onClick={disconnectLinkedIn}
                            style={{
                                ...styles.linkedinBtn,
                                backgroundColor: "#ff4d4f",
                                marginLeft: "10px",
                                flex: 1
                            }}
                        >
                            Disconnect
                        </button>
                    </div>
                </>
            ) : (
                <>
                    {/* Helper Text (before connect) */}
                    <p style={styles.helperText}>
                        Connect your LinkedIn account to publish professional posts,
                        share updates and grow your network effortlessly 💼
                    </p>

                    <button onClick={connect} style={styles.connectBtn}>
                        Connect LinkedIn
                    </button>
                </>
            )}
        </div>
    );
};

const styles = {
    linkedinAccountInfo: {
        marginBottom: "15px",
        textAlign: "left",
    },
    linkedinAccountRow: {
        display: "flex",
        alignItems: "center",
        marginBottom: "8px",
    },
    linkedinProfileImage: {
        width: "40px",
        height: "40px",
        borderRadius: "50%",
        objectFit: "cover",
        border: "2px solid #0077B5",
        marginRight: "10px",
    },
    linkedinAccountDetails: {
        flex: 1,
    },
    linkedinAccountName: {
        fontSize: "14px",
        fontWeight: "bold",
        margin: "0",
        color: "#14171a",
        lineHeight: "1.2",
    },
    linkedinHeadline: {
        fontSize: "12px",
        color: "#666",
        margin: "2px 0",
        lineHeight: "1.2",
        fontStyle: "italic",
    },
    linkedinButtonGroup: {
        display: "flex",
        gap: "10px",
        marginTop: "10px",
    },
    linkedinBtn: {
        padding: "8px 15px",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        fontSize: "14px",
        fontWeight: "500",
        color: "white",
    },
    helperText: {
        fontSize: "14px",
        color: "#6b7280",
        marginBottom: "16px",
        lineHeight: "1.5",
    },
    connectBtn: {
        padding: "12px",
        borderRadius: "10px",
        backgroundColor: "#0077B5",
        color: "#fff",
        border: "none",
        fontWeight: "600",
        cursor: "pointer",
        width: "100%",
        fontSize: "14px",
        transition: "background-color 0.2s ease",
    },
};

export default LinkedInCard;