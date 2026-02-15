import { useEffect, useState } from "react";
import axios from "axios";
import {
  Container,
  Row,
  Col,
  Card,
  Spinner,
  Alert,
  Table
} from "react-bootstrap";
import {
  Bar,
  Doughnut,
  Line
} from "react-chartjs-2";
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function BlueskyAnalytics() {
  const [account, setAccount] = useState(null);
  const [pageAnalytics, setPageAnalytics] = useState({});
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = localStorage.getItem("userId");

        const accRes = await axios.get(
          `https://automatedpostingbackend-h9dc.onrender.com/automation/accounts/${userId}`
        );

        const bluesky = accRes.data.data.find(
          (acc) => acc.platform === "bluesky"
        );

        if (!bluesky) {
          setLoading(false);
          return;
        }

        setAccount(bluesky);

        // ✅ PAGE LEVEL ANALYTICS
        const pageRes = await axios.get(
          `https://automatedpostingbackend-h9dc.onrender.com/analytics/page/${bluesky.providerId}`
        );

        setPageAnalytics(pageRes.data.pageAnalytics || {});

        // ✅ POST LEVEL ANALYTICS
        const postRes = await axios.get(
          `https://automatedpostingbackend-h9dc.onrender.com/analytics/posts/${bluesky.providerId}`
        );

        setPosts(postRes.data.posts || []);

      } catch (err) {
        console.error(err);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) return <Spinner className="m-5" />;

  if (!account)
    return <Alert className="m-5">Please connect Bluesky account.</Alert>;

  /* ===========================
     📊 CHART DATA
  ============================ */

  const interactionData = {
    labels: ["Likes", "Replies", "Reposts"],
    datasets: [
      {
        data: [
          pageAnalytics.likes || 0,
          pageAnalytics.comments || 0,
          pageAnalytics.shares || 0,
        ],
        backgroundColor: ["#3b82f6", "#ef4444", "#10b981"],
      },
    ],
  };

  const weeklyData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Likes",
        data: [2, 4, 1, 3, 0, 0, 0], // dummy - later dynamic cheyyachu
        borderColor: "#3b82f6",
        tension: 0.4,
      },
      {
        label: "Replies",
        data: [1, 2, 0, 2, 0, 0, 0],
        borderColor: "#ef4444",
        tension: 0.4,
      },
      {
        label: "Reposts",
        data: [1, 1, 0, 1, 0, 0, 0],
        borderColor: "#10b981",
        tension: 0.4,
      },
    ],
  };

  return (
    <Container fluid className="p-4">
      <h2 className="mb-4 text-primary">Bluesky Dashboard</h2>

      {/* ================= PAGE LEVEL CARDS ================= */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="shadow text-center p-3 bg-primary text-white">
            <h6>Followers</h6>
            <h3>{pageAnalytics.follower_count || 0}</h3>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="shadow text-center p-3 bg-success text-white">
            <h6>Following</h6>
            <h3>{pageAnalytics.following_count || 0}</h3>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="shadow text-center p-3 bg-dark text-white">
            <h6>Total Posts</h6>
            <h3>{pageAnalytics.posts_count || 0}</h3>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="shadow text-center p-3 bg-warning text-white">
            <h6>Total Likes</h6>
            <h3>{pageAnalytics.likes || 0}</h3>
          </Card>
        </Col>
      </Row>

      {/* ================= CHART SECTION ================= */}
      <Row className="mb-4">
        <Col md={6}>
          <Card className="shadow p-3">
            <h5>Total Interactions</h5>
            <Doughnut data={interactionData} />
          </Card>
        </Col>

        <Col md={6}>
          <Card className="shadow p-3">
            <h5>Weekly Engagement</h5>
            <Line data={weeklyData} />
          </Card>
        </Col>
      </Row>

      {/* ================= POST TABLE ================= */}
      <Card className="shadow p-3">
        <h5 className="mb-3">All Posts Analytics</h5>

        <Table bordered hover responsive>
          <thead>
            <tr>
              <th>#</th>
              <th>Post ID</th>
              <th>Likes</th>
              <th>Replies</th>
              <th>Reposts</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post, index) => (
              <tr key={post._id}>
                <td>{index + 1}</td>
                <td>{post.postId}</td>
                <td>{post.likes}</td>
                <td>{post.comments}</td>
                <td>{post.shares}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </Container>
  );
}

export default BlueskyAnalytics;
