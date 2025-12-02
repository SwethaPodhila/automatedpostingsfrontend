import React from "react";

export default function Footer() {
  return (
    <div style={styles.footer}>
      <p style={styles.text}>
        © {new Date().getFullYear()} Social Media Manager | All Rights Reserved
      </p>
    </div>
  );
}

const styles = {
  footer: {
    height: "50px",
    background: "#fff",
    borderTop: "1px solid #ddd",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginTop: "20px",
  },
  text: {
    margin: 0,
    color: "#555",
    fontSize: "14px",
  },
};
