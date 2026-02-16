import { useEffect, useState } from "react";
import axios from "axios";
import { Container, Row, Col, Spinner, Alert } from "react-bootstrap";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";

import FbInstaAnalytics from "./FbInstaAnalytics";
import TelegramAnalytics from "./TelegramAnalytics";
import LinkedinAnalytics from "./LinkedinAnalytics";
import BlueskyAnalytics from "./BlueskyAnalytics";

function AnalyticsLayout() {
    const [accounts, setAccounts] = useState([]);
    const [selectedPlatform, setSelectedPlatform] = useState("");
    const [loading, setLoading] = useState(true);
    const [sidebarWidth, setSidebarWidth] = useState(50); // ✅ added

    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                const userId = localStorage.getItem("userId");
                const res = await axios.get(
                    `https://automatedpostingbackend-h9dc.onrender.com/automation/accounts/${userId}`
                );

                const accs = res.data.data || [];
                setAccounts(accs);

                if (accs.length > 0) {
                    setSelectedPlatform(accs[0].platform);
                }

            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchAccounts();
    }, []);

    if (loading) {
        return (
            <div className="text-center mt-5">
                <Spinner animation="border" />
            </div>
        );
    }

    const connectedPlatforms = [...new Set(accounts.map(a => a.platform))];

    return (
        <div style={styles.page}>
            <Navbar />

            <div style={styles.layout}>
                <Sidebar onWidthChange={setSidebarWidth} />

                <main
                    style={{
                        ...styles.content,
                        marginLeft: sidebarWidth,
                        marginTop: 60,
                        transition: "0.3s ease",
                    }}
                >
                    <Container fluid>
                        <h2 className="mb-4 fw-bold text-primary">
                            📊 AIWings Analytics
                        </h2>

                        <Row className="mb-4">
                            <Col md={4}>
                                <select
                                    className="form-select shadow-sm"
                                    value={selectedPlatform}
                                    onChange={(e) =>
                                        setSelectedPlatform(e.target.value)
                                    }
                                >
                                    {connectedPlatforms.map((platform, index) => (
                                        <option key={index} value={platform}>
                                            {platform.toUpperCase()}
                                        </option>
                                    ))}
                                </select>
                            </Col>
                        </Row>

                        {accounts.length === 0 && (
                            <Alert variant="warning">
                                ⚠ No accounts connected yet.
                            </Alert>
                        )}

                        {(selectedPlatform === "facebook" ||
                            selectedPlatform === "instagram") && (
                                <FbInstaAnalytics />
                            )}

                        {selectedPlatform === "telegram" && <TelegramAnalytics />}
                        {selectedPlatform === "linkedin" && <LinkedinAnalytics />}
                        {selectedPlatform === "bluesky" && <BlueskyAnalytics />}


                    </Container>
                </main>
            </div>
            <Footer />
        </div>
    );
}

const styles = {   // ✅ must use const
    page: {
        width: "100%",
        minHeight: "100vh",
        background: "#f5f7fb"
    },
    layout: {
        display: "flex"
    },
    content: {
        width: "100%",
        minHeight: "calc(100vh - 60px)",
        background: "#f8f9fc",
        padding: "18px 32px"
    }
};

export default AnalyticsLayout;
