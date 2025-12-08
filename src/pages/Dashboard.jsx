import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";

export default function Dashboard() {
    const [sidebarWidth, setSidebarWidth] = useState(50);

    const token = localStorage.getItem("token"); // JWT after login

    return (
        <div style={styles.page}>
            <Navbar />
            <div style={styles.layout}>
                <Sidebar onWidthChange={(w) => setSidebarWidth(w)} />

                <main
                    style={{
                        ...styles.content,
                        marginLeft: sidebarWidth,
                        transition: "0.3s ease",
                        marginTop: "60px",
                    }}
                >
                    <h2>Connect Your Social Media Accounts</h2>

                    <div style={styles.cardsContainer}>
                        <div style={styles.card}>
                            <h3>Facebook</h3>
                            <button style={styles.btn}>
                                Connect Facebook
                            </button>
                        </div>

                        <div style={styles.card}>
                            <h3>Instagram</h3>
                            <button style={styles.btn}>
                                Connect Instagram
                            </button>
                        </div>

                        <div style={styles.card}>
                            <h3>Twitter (X)</h3>
                            <button style={styles.btn}>Connect Twitter</button>
                        </div>

                        <div style={styles.card}>
                            <h3>LinkedIn</h3>
                            <button style={styles.btn}>Connect LinkedIn</button>
                        </div>
                        <div style={styles.card}>
                            <h3>Youtube</h3>
                            <button
                                style={styles.btn}
                                onClick={() => {
                                    const token = localStorage.getItem("token");
                                    if (!token) return alert("Please login first!");

                                    const decoded = JSON.parse(atob(token.split(".")[1]));
                                    const userId = decoded.id;

                                    window.location.href =
                                        `http://localhost:5000/social/youtube/auth?user=${userId}`;
                                }}
                            >
                                Connect YouTube
                            </button>
                        </div>

                    </div>
                </main>
            </div>
            <Footer />
        </div>
    );
}

const styles = {
    page: { background: "#f5f6fa", minHeight: "100vh", display: "flex", flexDirection: "column" },
    layout: { display: "flex", flex: 1 },
    content: { flex: 1, padding: "30px 40px" },
    cardsContainer: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginTop: "20px" },
    card: { background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0px 3px 6px rgba(0,0,0,0.1)", textAlign: "center" },
    btn: { background: "#0d6efd", color: "white", padding: "10px 18px", border: "none", borderRadius: "5px", marginTop: "10px", cursor: "pointer" },
};
