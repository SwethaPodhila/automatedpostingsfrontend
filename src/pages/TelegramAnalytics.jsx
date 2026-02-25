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
  Doughnut,
  Line
} from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  ArcElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Colors,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  ArcElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

function TelegramAnalytics() {
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

        const telegram = accRes.data.data.find(
          (acc) => acc.platform === "telegram"
        );

        if (!telegram) {
          setLoading(false);
          return;
        }

        setAccount(telegram);

        // 🔥 Single API Call
        const analyticsRes = await axios.get(
          `https://automatedpostingbackend-h9dc.onrender.com/analytics/page/${telegram.providerId}`
        );

        setPageAnalytics(analyticsRes.data.pageAnalytics || {});
        setPosts(analyticsRes.data.posts || []);

      } catch (err) {
        console.error(err);
      } 

      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) return <Spinner className="m-5" />;
  if (!account)
    return <Alert className="m-5">Please connect Telegram account.</Alert>;

  /* ===========================
     📊 CHART DATA
  ============================ */

  const totalLikes = posts.reduce(
    (sum, post) => sum + (post.analytics?.likes || 0),
    0
  );

  const totalReplies = posts.reduce(
    (sum, post) => sum + (post.analytics?.comments || 0),
    0
  );

  const totalForwards = posts.reduce(
    (sum, post) => sum + (post.analytics?.shares || 0),
    0
  );
  const totalReactions = totalLikes + totalReplies + totalForwards;

  const interactionData = {
    labels: ["Likes", "Replies", "Forwards"],
    datasets: [
      {
        data: [totalLikes, totalReplies, totalForwards],
        backgroundColor: [
          "#7c3aed",  // Likes - Violet
          "#ec4899",  // Replies - Pink
          "#06b6d4",  // Forwards - Cyan
        ],
        borderWidth: 0,
      },
    ],
  };

  const likesPerDay = Array(7).fill(0);
  const repliesPerDay = Array(7).fill(0);
  const forwardsPerDay = Array(7).fill(0);

  posts.forEach((post) => {
    const dateField = post.publishedAt || post.createdAt;
    if (!dateField) return;

    const day = new Date(dateField).getDay(); // 0 = Sunday

    likesPerDay[day] += post.analytics?.likes || 0;
    repliesPerDay[day] += post.analytics?.comments || 0;
    forwardsPerDay[day] += post.analytics?.shares || 0;
  });

  const weeklyData = {
    labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    datasets: [
      {
        label: "Likes",
        data: likesPerDay,
        borderColor: "#7c3aed",
        color: "white",
        tension: 0.4,
      },
      {
        label: "Replies",
        data: repliesPerDay,
        borderColor: "#ec4899",
        color: "white",
        tension: 0.4,
      },
      {
        label: "Forwards",
        data: forwardsPerDay,
        borderColor: "#06b6d4",
        color: "white",
        tension: 0.4,
      },
    ],
  };

  return (
    <Container fluid className="p-4">
      <h2 className="mb-4">Telegram Dashboard</h2>

      {/* ================= PAGE LEVEL CARDS ================= */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="text-center p-3 bg-info text-white">
            <h6>Followers</h6>
            <h3>{pageAnalytics.follower_count || 0}</h3>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="text-center p-3 bg-dark text-white">
            <h6>Total Reactions</h6>
            <h3>{totalReactions || 0}</h3>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="text-center p-3 bg-success text-white">
            <h6>Total Posts</h6>
            <h3>{posts.length || 0}</h3>
          </Card>
        </Col>

      </Row>

      {/* ================= CHART SECTION ================= */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="p-3 h-100">
            <h5>Total Interactions</h5>
            <div style={{ height: "320px" }}>
              <div style={{ height: "350px" }}>
                <Doughnut
                  data={interactionData}
                  options={{ maintainAspectRatio: false }}
                />
              </div>
            </div>
          </Card>
        </Col>

        <Col md={8}>
          <Card className="p-3 h-100">
            <h5>Weekly Engagement</h5>
            <div style={{ height: "320px" }}>
              <Line
                data={weeklyData}
                options={{ maintainAspectRatio: false }}
              />
            </div>
          </Card>
        </Col>
      </Row>

      {/* ================= POST TABLE ================= */}
      <Card className="p-3">
        <h5 className="mb-3">All Posts Analytics</h5>

        <Table bordered hover responsive>
          <thead>
            <tr>
              <th>#</th>
              <th>Caption</th>
              <th>Likes</th>
              <th>Replies</th>
              <th>Forwards</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post, index) => (
              <tr key={post._id}>
                <td>{index + 1}</td>
                <td>{post.caption || "N/A"}</td>
                <td>{post.analytics?.likes || 0}</td>
                <td>{post.analytics?.comments || 0}</td>
                <td>{post.analytics?.shares || 0}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </Container>
  );
}

export default TelegramAnalytics;