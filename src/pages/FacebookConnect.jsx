import React from "react";

export default function FacebookConnect() {
  const BACKEND_URL = "https://automatedpostingbackend.onrender.com"; // change if needed

  const connectFacebook = () => {
    // Redirect user to backend → Facebook Login
    window.location.href = `${BACKEND_URL}/social/facebook`;
  };

  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h2>Connect Your Facebook Account</h2>

      <button
        onClick={connectFacebook}
        style={{
          padding: "12px 25px",
          backgroundColor: "#1877F2",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontSize: "16px",
          marginTop: "20px",
        }}
      >
        Connect with Facebook
      </button>
    </div>
  );
}
