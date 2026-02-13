import { useEffect, useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from "axios";
import { Container, Row, Col, Table, Spinner, Card } from "react-bootstrap";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function Analytics() {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [pageAnalytics, setPageAnalytics] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch connected accounts
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) return;

        const res = await axios.get(
          `https://automatedpostingbackend-h9dc.onrender.com/automation/accounts/${userId}`,
          { headers: { "Cache-Control": "no-cache" } }
        );

        const accs = res.data?.data || [];
        setAccounts(accs);

        if (accs.length > 0) setSelectedAccount(accs[0].providerId);
      } catch (err) {
        console.error("Failed to fetch accounts", err);
        setAccounts([]);
      }
    };
    fetchAccounts();
  }, []);

  // Fetch analytics for selected account
  useEffect(() => {
    if (!selectedAccount) return;

    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `https://automatedpostingbackend-h9dc.onrender.com/analytics/page/${selectedAccount}`,
          { headers: { "Cache-Control": "no-cache" } }
        );

        if (res.data.success) {
          setPageAnalytics(res.data.pageAnalytics || {});
          setPosts(res.data.posts || []);
        }
      } catch (err) {
        console.error("Failed to fetch analytics", err);
        setPageAnalytics({});
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [selectedAccount]);

  if (loading) return <Spinner animation="border" />;

  if (accounts.length === 0) return <p>No connected accounts found.</p>;

  // Chart data for page-level metrics
  const pageChartData = {
    labels: ["Page Post Engagements", "Page Views Total"],
    datasets: [
      {
        label: "Page Metrics",
        data: [
          pageAnalytics?.page_post_engagements || 0,
          pageAnalytics?.page_views_total || 0,
        ],
        backgroundColor: ["#4e73df", "#1cc88a"],
      },
    ],
  };

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Analytics Dashboard</h2>

      {/* Dropdown for connected accounts */}
      <Row className="mb-4">
        <Col md={4}>
          <label htmlFor="accounts">Select Account:</label>
          <select
            id="accounts"
            className="form-select"
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
          >
            {accounts.map((acc) => (
              <option key={acc.providerId} value={acc.providerId}>
                {acc.meta?.name || acc.meta?.username || acc.meta?.handle || acc.providerId}
              </option>
            ))}
          </select>
        </Col>
      </Row>

      {/* Page-Level Analytics Chart */}
      <Row className="mb-5">
        <Col md={6}>
          <Card>
            <Card.Body>
              <Card.Title>Page-Level Analytics</Card.Title>
              <Bar data={pageChartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Post-Level Analytics Table */}
      <Row>
        <Col>
          <h4>Posts Analytics</h4>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>#</th>
                <th>Caption</th>
                <th>Media</th>
                <th>Likes</th>
                <th>Comments</th>
                <th>Shares</th>
                <th>Saves</th>
                <th>Reach</th>
                <th>Impressions</th>
                <th>Views</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post, index) => (
                <tr key={post._id}>
                  <td>{index + 1}</td>
                  <td>{post.caption || "—"}</td>
                  <td>
                    {post.mediaUrl && (
                      <img src={post.mediaUrl} alt="media" style={{ maxWidth: "100px" }} />
                    )}
                  </td>
                  <td>{post.analytics.likes}</td>
                  <td>{post.analytics.comments}</td>
                  <td>{post.analytics.shares}</td>
                  <td>{post.analytics.saves}</td>
                  <td>{post.analytics.reach}</td>
                  <td>{post.analytics.impressions}</td>
                  <td>{post.analytics.views}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
      </Row>
    </Container>
  );
}

export default Analytics;
