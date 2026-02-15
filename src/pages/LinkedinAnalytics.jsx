import { useEffect, useState } from "react";
import axios from "axios";
import { Container, Card, Alert, Spinner } from "react-bootstrap";

function LinkedinAnalytics() {
  const [account, setAccount] = useState(null);
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const userId = localStorage.getItem("userId");
      const res = await axios.get(`YOUR_BACKEND/automation/accounts/${userId}`);
      const linkedin = res.data.data.find(acc => acc.platform === "linkedin");
      if (!linkedin) {
        setLoading(false);
        return;
      }

      setAccount(linkedin);
      const analyticsRes = await axios.get(`YOUR_BACKEND/analytics/page/${linkedin.providerId}`);
      setAnalytics(analyticsRes.data.pageAnalytics || {});
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <Spinner className="m-5" />;
  if (!account) return <Alert className="m-5">Please connect LinkedIn account.</Alert>;

  return (
    <Container className="p-4">
      <h3 className="text-dark mb-4">LinkedIn Analytics</h3>

      <Card className="shadow p-4">
        <h5>Impressions: {analytics?.impressions || 0}</h5>
        <h5>Clicks: {analytics?.clicks || 0}</h5>
        <h5>Reactions: {analytics?.reactions || 0}</h5>
        <h5>Shares: {analytics?.shares || 0}</h5>
      </Card>
    </Container>
  );
}

export default LinkedinAnalytics;
