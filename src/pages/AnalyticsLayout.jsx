import { useEffect, useState } from "react";
import axios from "axios";
import { Container, Row, Col, Spinner, Alert } from "react-bootstrap";
import FbInstaAnalytics from "./FbInstaAnalytics";
import TelegramAnalytics from "./TelegramAnalytics";
import LinkedinAnalytics from "./LinkedinAnalytics";
import BlueskyAnalytics from "./BlueskyAnalytics";

function AnalyticsLayout() {
    const [accounts, setAccounts] = useState([]);
    const [selectedPlatform, setSelectedPlatform] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                const userId = localStorage.getItem("userId");
                const res = await axios.get(
                    `https://automatedpostingbackend-h9dc.onrender.com/automation/accounts/${userId}`
                );

                const accs = res.data.data || [];
                setAccounts(accs);

                // ✅ Default first connected platform
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

    if (loading)
        return (
            <div className="text-center mt-5">
                <Spinner animation="border" />
            </div>
        );

    // Get unique platforms
    const connectedPlatforms = [...new Set(accounts.map(a => a.platform))];

    return (
        <Container fluid className="p-4" style={{ background: "#f8f9fc", minHeight: "100vh" }}>
            <h2 className="mb-4 fw-bold text-primary">📊 AIWings Analytics</h2>

            {/* Dropdown */}
            <Row className="mb-4">
                <Col md={4}>
                    <select
                        className="form-select shadow-sm"
                        value={selectedPlatform}
                        onChange={(e) => setSelectedPlatform(e.target.value)}
                    >
                        {connectedPlatforms.map((platform, index) => (
                            <option key={index} value={platform}>
                                {platform.toUpperCase()}
                            </option>
                        ))}
                    </select>
                </Col>
            </Row>

            {/* If No Accounts Connected */}
            {accounts.length === 0 && (
                <Alert variant="warning">
                    ⚠ No accounts connected yet.
                    <br />
                    Please connect a social media account to view analytics.
                </Alert>
            )}

            {/* Conditional Rendering */}
            {selectedPlatform === "facebook" ||
                selectedPlatform === "instagram" ? (
                <FbInstaAnalytics />
            ) : null}

            {selectedPlatform === "telegram" && <TelegramAnalytics />}
            {selectedPlatform === "linkedin" && <LinkedinAnalytics />}
            {selectedPlatform === "bluesky" && <BlueskyAnalytics />}
        </Container>
    );
}

export default AnalyticsLayout;
