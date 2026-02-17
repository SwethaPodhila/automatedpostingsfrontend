import { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import {
    Container,
    Row,
    Col,
    Card,
    Spinner,
    Table,
    Alert,
} from "react-bootstrap";

import { Bar, Doughnut, Line } from "react-chartjs-2";

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";

import ChartDataLabels from "chartjs-plugin-datalabels";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ChartDataLabels
);

function FbInstaDashboard() {
    const [accounts, setAccounts] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState("");
    const [pageAnalytics, setPageAnalytics] = useState(null);
    const [posts, setPosts] = useState([]);
    const [weeklyAnalytics, setWeeklyAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    // ================= FETCH ACCOUNTS =================
    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                const userId = localStorage.getItem("userId");

                const res = await axios.get(
                    `https://automatedpostingbackend-h9dc.onrender.com/automation/accounts/${userId}`
                );

                const filtered = res.data.data.filter(
                    (acc) =>
                        acc.platform === "facebook" ||
                        acc.platform === "instagram"
                );

                setAccounts(filtered);

                if (filtered.length > 0) {
                    setSelectedAccount(filtered[0].providerId);
                }
            } catch (err) {
                console.error(err);
            }
        };

        fetchAccounts();
    }, []);

    // ================= FETCH ANALYTICS =================
    useEffect(() => {
        if (!selectedAccount) return;
        const fetchAnalytics = async () => {
            setLoading(true);
            try {
                const res = await axios.get(
                    `https://automatedpostingbackend-h9dc.onrender.com/analytics/page/${selectedAccount}`
                );

                setPageAnalytics(res.data.pageAnalytics);
                setPosts(res.data.posts);
                setWeeklyAnalytics(res.data.weeklyAnalytics);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [selectedAccount]);

    if (loading)
        return (
            <div className="text-center mt-5">
                <Spinner animation="border" />
            </div>
        );

    if (accounts.length === 0)
        return (
            <Container className="mt-5">
                <Alert variant="warning">
                    No Facebook or Instagram account connected.
                </Alert>
            </Container>
        );

    // ================= TOTAL CALCULATIONS =================
    const totalLikes = posts.reduce(
        (sum, p) => sum + (p.analytics?.likes || 0),
        0
    );

    const totalComments = posts.reduce(
        (sum, p) => sum + (p.analytics?.comments || 0),
        0
    );

    const totalShares = posts.reduce(
        (sum, p) => sum + (p.analytics?.shares || 0),
        0
    );

    // ================= CALCULATE LAST 7 DAYS WEEKLY TOTAL VIEWS =================

    // Get last 7 days range
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 6);

    // Initialize week structure
    const weeklyData = {
        mon: 0,
        tue: 0,
        wed: 0,
        thu: 0,
        fri: 0,
        sat: 0,
        sun: 0,
    };

    posts.forEach((post) => {
        if (!post.publishedAt) return;

        const postDate = new Date(post.publishedAt);

        // Only consider last 7 days
        if (postDate < sevenDaysAgo || postDate > today) return;

        const day = postDate.getDay(); // 0 = Sun, 1 = Mon...

        const views = post.analytics?.page_views_total || 0;

        if (day === 1) weeklyData.mon += views;
        if (day === 2) weeklyData.tue += views;
        if (day === 3) weeklyData.wed += views;
        if (day === 4) weeklyData.thu += views;
        if (day === 5) weeklyData.fri += views;
        if (day === 6) weeklyData.sat += views;
        if (day === 0) weeklyData.sun += views;
    });


    // ================= WEEKLY TOTAL VIEWS GRAPH =================

    const weeklyPageData = {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [
            {
                label: "Weekly Total Views",
                data: [
                    weeklyData.mon,
                    weeklyData.tue,
                    weeklyData.wed,
                    weeklyData.thu,
                    weeklyData.fri,
                    weeklyData.sat,
                    weeklyData.sun,
                ],
                backgroundColor: "#4e73df",
                borderRadius: 8,
            },
        ],
    };


    // ================= PIE CHART =================
    const safeLikes = totalLikes || 0;
    const safeComments = totalComments || 0;
    const safeShares = totalShares || 0;

    const totalInteractions = safeLikes + safeComments + safeShares;

    const pieData = {
        labels: ["Likes", "Comments", "Shares"],
        datasets: [
            {
                data: [totalLikes, totalComments, totalShares],
                backgroundColor: ["#f6c23e", "#e74a3b", "#36b9cc"],
            },
        ],
    };

    const pieOptions = {
        plugins: {
            datalabels: {
                color: "#fff",
                font: { weight: "bold", size: 14 },
                formatter: (value, context) => {
                    const label =
                        context.chart.data.labels[context.dataIndex];
                    return `${label}: ${value}`;
                },
            },
            legend: {
                position: "bottom",
            },
        },
    };

    // ================= CALCULATE WEEKLY ENGAGEMENT FROM POSTS =================

    const weeklyEngagement = {
        mon: { likes: 0, comments: 0, shares: 0 },
        tue: { likes: 0, comments: 0, shares: 0 },
        wed: { likes: 0, comments: 0, shares: 0 },
        thu: { likes: 0, comments: 0, shares: 0 },
        fri: { likes: 0, comments: 0, shares: 0 },
        sat: { likes: 0, comments: 0, shares: 0 },
        sun: { likes: 0, comments: 0, shares: 0 },
    };

    posts.forEach((post) => {
        if (!post.publishedAt) return;

        const day = new Date(post.publishedAt).getDay();

        const likes = post.analytics?.likes || 0;
        const comments = post.analytics?.comments || 0;
        const shares = post.analytics?.shares || 0;

        if (day === 1) {
            weeklyEngagement.mon.likes += likes;
            weeklyEngagement.mon.comments += comments;
            weeklyEngagement.mon.shares += shares;
        }
        if (day === 2) {
            weeklyEngagement.tue.likes += likes;
            weeklyEngagement.tue.comments += comments;
            weeklyEngagement.tue.shares += shares;
        }
        if (day === 3) {
            weeklyEngagement.wed.likes += likes;
            weeklyEngagement.wed.comments += comments;
            weeklyEngagement.wed.shares += shares;
        }
        if (day === 4) {
            weeklyEngagement.thu.likes += likes;
            weeklyEngagement.thu.comments += comments;
            weeklyEngagement.thu.shares += shares;
        }
        if (day === 5) {
            weeklyEngagement.fri.likes += likes;
            weeklyEngagement.fri.comments += comments;
            weeklyEngagement.fri.shares += shares;
        }
        if (day === 6) {
            weeklyEngagement.sat.likes += likes;
            weeklyEngagement.sat.comments += comments;
            weeklyEngagement.sat.shares += shares;
        }
        if (day === 0) {
            weeklyEngagement.sun.likes += likes;
            weeklyEngagement.sun.comments += comments;
            weeklyEngagement.sun.shares += shares;
        }
    });

    // ================= WEEKLY ENGAGEMENT GRAPH =================

    const weeklyEngagementData = {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [
            {
                label: "Likes",
                data: [
                    weeklyEngagement.mon.likes,
                    weeklyEngagement.tue.likes,
                    weeklyEngagement.wed.likes,
                    weeklyEngagement.thu.likes,
                    weeklyEngagement.fri.likes,
                    weeklyEngagement.sat.likes,
                    weeklyEngagement.sun.likes,
                ],
                borderColor: "#f6c23e",
                backgroundColor: "#f6c23e",
                tension: 0.4,
            },
            {
                label: "Comments",
                data: [
                    weeklyEngagement.mon.comments,
                    weeklyEngagement.tue.comments,
                    weeklyEngagement.wed.comments,
                    weeklyEngagement.thu.comments,
                    weeklyEngagement.fri.comments,
                    weeklyEngagement.sat.comments,
                    weeklyEngagement.sun.comments,
                ],
                borderColor: "#e74a3b",
                backgroundColor: "#e74a3b",
                tension: 0.4,
            },
            {
                label: "Shares",
                data: [
                    weeklyEngagement.mon.shares,
                    weeklyEngagement.tue.shares,
                    weeklyEngagement.wed.shares,
                    weeklyEngagement.thu.shares,
                    weeklyEngagement.fri.shares,
                    weeklyEngagement.sat.shares,
                    weeklyEngagement.sun.shares,
                ],
                borderColor: "#36b9cc",
                backgroundColor: "#36b9cc",
                tension: 0.4,
            },
        ],
    };


    return (
        <Container fluid className="p-4 bg-light min-vh-100">

            {/* HEADER */}
            <div className="d-flex justify-content-between mb-4">
                <h2>Facebook & Instagram Dashboard</h2>

                <select
                    className="form-select w-auto"
                    value={selectedAccount}
                    onChange={(e) => setSelectedAccount(e.target.value)}
                >
                    {accounts.map((acc) => (
                        <option key={acc.providerId} value={acc.providerId}>
                            {acc.meta?.name || acc.meta?.username}
                        </option>
                    ))}
                </select>
            </div>

            {/* KPI CARDS */}
            <Row className="mb-4">
                <Col md={4}>
                    <Card className="p-3 text-white bg-primary">
                        <h6>Followers</h6>
                        <h3>{pageAnalytics?.followers_count || 0}</h3>
                    </Card>
                </Col>

                <Col md={4}>
                    <Card className="p-3 text-white bg-success">
                        <h6>Views</h6>
                        <h3>{pageAnalytics?.page_views_total || 0}</h3>
                    </Card>
                </Col>

                <Col md={4}>
                    <Card className="p-3 text-white bg-dark">
                        <h6>Total Posts</h6>
                        <h3>{posts.length}</h3>
                    </Card>
                </Col>
            </Row>

            {/* WEEKLY PAGE GRAPH */}
            <Row className="mb-3 justify-content-center">
                <Col md={12}>   {/* Reduced width from 12 to 8 */}
                    <Card className="p-3 shadow-sm">
                        <h6 className="text-center mb-3">
                            Weekly Page Performance (Mon - Sun)
                        </h6>

                        <div style={{ height: "360px" }}>  {/* Control height here */}
                            <Bar
                                data={weeklyPageData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                }}
                            />
                        </div>
                    </Card>
                </Col>
            </Row>

            <Row className="mb-4">
                {/* PIE CHART */}
                <Col md={4}>
                    <Card className="p-3 shadow-sm h-100">
                        <h6 className="text-center mb-3">Total Post Interactions</h6>

                        <div style={{ height: "280px" }}>
                            {totalInteractions === 0 ? (
                                <div className="d-flex justify-content-center align-items-center h-100 text-muted">
                                    <p>No interaction data available yet 🚫</p>
                                </div>
                            ) : (
                                <Doughnut
                                    data={pieData}
                                    options={{
                                        ...pieOptions,
                                        maintainAspectRatio: false,
                                    }}
                                />
                            )}
                        </div>
                    </Card>
                </Col>

                {/* WEEKLY ENGAGEMENT GRAPH */}
                <Col md={8}>
                    <Card className="p-3 shadow-sm h-100">
                        <h6 className="text-center mb-3">
                            Weekly Post Engagement (Mon - Sun)
                        </h6>
                        <div style={{ height: "320px" }}>
                            <Line
                                data={weeklyEngagementData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                }}
                            />
                        </div>
                    </Card>
                </Col>

            </Row>


            {/* POSTS TABLE */}
            {/* POSTS TABLE */}
            <Row>
                <Col md={12}>
                    <Card className="p-4 shadow-sm">
                        <h5>All Posts Analytics</h5>

                        <Table hover responsive bordered>
                            <thead className="table-light">
                                <tr>
                                    <th>#</th>
                                    <th>Caption</th>
                                    <th>Likes</th>
                                    <th>Comments</th>
                                    <th>Shares</th>
                                    <th>Reach</th>
                                    <th>Impressions</th>
                                    <th>Views</th>
                                </tr>
                            </thead>

                            <tbody>
                                {posts.length > 0 ? (
                                    posts.map((post, index) => (
                                        <tr key={post._id}>
                                            <td>{index + 1}</td>
                                            <td>{post.caption || "—"}</td>
                                            <td>{post.analytics?.likes || 0}</td>
                                            <td>{post.analytics?.comments || 0}</td>
                                            <td>{post.analytics?.shares || 0}</td>
                                            <td>{post.analytics?.reach || 0}</td>
                                            <td>{post.analytics?.impressions || 0}</td>
                                            <td>{post.analytics?.views || 0}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="text-center">
                                            No posts available
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </Card>
                </Col>
            </Row>

        </Container>
    );
}

export default FbInstaDashboard;
