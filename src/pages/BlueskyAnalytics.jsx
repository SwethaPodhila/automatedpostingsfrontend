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

        const analyticsRes = await axios.get(
          `https://automatedpostingbackend-h9dc.onrender.com/analytics/page/${bluesky.providerId}`
        );

        setPageAnalytics(analyticsRes.data.pageAnalytics || {});
        console.log("Posts analytics:", analyticsRes.data.posts);
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
    return <Alert className="m-5">Please connect Bluesky account.</Alert>;

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

  const totalReposts = posts.reduce(
    (sum, post) => sum + (post.analytics?.shares || 0),
    0
  );

  const interactionData = {
    labels: ["Likes", "Replies", "Reposts"],
    datasets: [
      {
        data: [totalLikes, totalReplies, totalReposts],
        backgroundColor: ["#3b82f6", "#ef4444", "#10b981"],
      },
    ],
  };

  const interactionOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          generateLabels: (chart) => {
            const data = chart.data;
            return data.labels.map((label, i) => ({
              text: `${label} - ${data.datasets[0].data[i]}`, // 👈 VALUE ADD CHESTHUNNAM
              fillStyle: data.datasets[0].backgroundColor[i],
              strokeStyle: data.datasets[0].backgroundColor[i],
              lineWidth: 1,
              hidden: false,
              index: i,
            }));
          },
        },
      },
    },
  };

  // Week days order
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Initialize arrays with 0
  const likesPerDay = new Array(7).fill(0);
  const repliesPerDay = new Array(7).fill(0);
  const repostsPerDay = new Array(7).fill(0);

  // Loop posts
  posts.forEach((post) => {
    const dateField = post.publishedAt || post.createdAt;

    if (!dateField) return;

    const dayIndex = new Date(dateField).getDay();

    likesPerDay[dayIndex] += post.analytics?.likes || 0;
    repliesPerDay[dayIndex] += post.analytics?.comments || 0;
    repostsPerDay[dayIndex] += post.analytics?.shares || 0;
  });

  const weeklyData = {
    labels: weekDays,
    datasets: [
      {
        label: "Likes",
        data: likesPerDay,
        borderColor: "#3b82f6",
        tension: 0.4,
      },
      {
        label: "Replies",
        data: repliesPerDay,
        borderColor: "#ef4444",
        tension: 0.4,
      },
      {
        label: "Reposts",
        data: repostsPerDay,
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
        <Col md={4}>
          <Card className="text-center p-3 bg-primary text-white">
            <h6>Followers</h6>
            <h3>{pageAnalytics.follower_count || 0}</h3>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="shadow text-center p-3 bg-success text-white">
            <h6>Following</h6>
            <h3>{pageAnalytics.following_count || 0}</h3>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="shadow text-center p-3 bg-dark text-white">
            <h6>Total Posts</h6>
            <h3>{posts.length}</h3>
          </Card>
        </Col>

      </Row>

      {/* ================= CHART SECTION ================= */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="p-3">
            <h5>Total Interactions</h5>
            <div style={{ height: "340px" }}>
              <Doughnut
                data={interactionData}
                options={interactionOptions}
              />
            </div>
          </Card>
        </Col>

        <Col md={8}>
          <Card className="p-3">
            <h5>Weekly Engagement</h5>
            <div style={{ height: "340px" }}>
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
              <th>Reposts</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post, index) => (
              <tr key={post._id}>
                <td>{index + 1}</td>
                <td>{post.caption}</td>
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

export default BlueskyAnalytics;