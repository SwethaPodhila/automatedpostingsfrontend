import { Container } from "react-bootstrap";

function LinkedinAnalytics() {
  return (
    <div style={styles.wrapper}>
      <Container fluid className="d-flex justify-content-center align-items-center">
        <div style={styles.card}>
          
          <div style={styles.icon}>🚧</div>

          <h1 style={styles.title}>LinkedIn Analytics</h1>

          <p style={styles.subtitle}>
            This feature is currently under development.
          </p>

          <p style={styles.description}>
            We’re building advanced analytics tools to help you track 
            impressions, clicks, reactions, shares, and more — all in one place.
          </p>

          <div style={styles.badge}>
            🚀 Launching Soon
          </div>

        </div>
      </Container>
    </div>
  );
}

export default LinkedinAnalytics;

const styles = {
  wrapper: {
    minHeight: "100vh",
    width: "100%",
    background: "linear-gradient(135deg, #eef2ff, #f8fafc)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px 20px",
  },
  card: {
    background: "#ffffff",
    width: "100%",
    maxWidth: "900px",
    padding: "40px 30px",
    borderRadius: "20px",
    textAlign: "center",
    boxShadow: "0 15px 40px rgba(0,0,0,0.08)",
  },
  icon: {
    fontSize: "70px",
    marginBottom: "20px",
  },
  title: {
    fontSize: "36px",
    fontWeight: "700",
    marginBottom: "15px",
    color: "#0A66C2",
  },
  subtitle: {
    fontSize: "18px",
    color: "#555",
    marginBottom: "15px",
  },
  description: {
    fontSize: "16px",
    color: "#777",
    maxWidth: "600px",
    margin: "0 auto 30px",
    lineHeight: "1.6",
  },
  badge: {
    display: "inline-block",
    padding: "10px 25px",
    background: "#0A66C2",
    color: "white",
    borderRadius: "50px",
    fontWeight: "600",
    fontSize: "14px",
    letterSpacing: "1px",
  },
};