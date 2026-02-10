import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const AnalyticsDashboard = () => {
  // Sample data
  const metricsData = [
    { name: "Page Views", value: 1200, trend: "+5%", icon: "👁️" },
    { name: "Followers", value: 850, trend: "+2%", icon: "👥" },
    { name: "Reach", value: 5000, trend: "-1%", icon: "📈" },
    { name: "Engagement", value: 650, trend: "+8%", icon: "💬" },
  ];

  const postsData = [
    { id: 1, content: "New product launch!", date: "2026-02-08", reach: 1200, engagement: 300, clicks: 200, comments: 50, shares: 20 },
    { id: 2, content: "Behind the scenes video", date: "2026-02-07", reach: 950, engagement: 180, clicks: 120, comments: 20, shares: 10 },
    { id: 3, content: "Weekly tips post", date: "2026-02-06", reach: 700, engagement: 150, clicks: 90, comments: 10, shares: 5 },
  ];

  const chartData = {
    labels: ["Feb 4", "Feb 5", "Feb 6", "Feb 7", "Feb 8"],
    datasets: [
      {
        label: "Page Views",
        data: [800, 950, 700, 1100, 1200],
        borderColor: "#0d6efd",
        backgroundColor: "rgba(13, 110, 253, 0.2)",
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: true, position: "top" },
      title: { display: true, text: "Page Views Over Time" },
    },
  };

  return (
    <div className="container my-4">
      <h2 className="mb-4 text-center">Facebook Page Analytics</h2>

      {/* Metrics Cards */}
      <div className="row mb-4">
        {metricsData.map((metric) => (
          <div key={metric.name} className="col-md-3 col-sm-6 mb-3">
            <div className="card shadow-sm h-100 metric-card">
              <div className="card-body text-center">
                <div className="metric-icon mb-2">{metric.icon}</div>
                <h5 className="card-title">{metric.name}</h5>
                <h3 className="metric-value">{metric.value}</h3>
                <p className={`trend ${metric.trend.startsWith("+") ? "text-success" : "text-danger"}`}>
                  {metric.trend}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="card mb-4 shadow-sm">
        <div className="card-body">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Posts Table */}
      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white">Recent Posts</div>
        <div className="card-body table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Post</th>
                <th>Date</th>
                <th>Reach</th>
                <th>Engagement</th>
                <th>Clicks</th>
                <th>Comments</th>
                <th>Shares</th>
              </tr>
            </thead>
            <tbody>
              {postsData.map((post) => (
                <tr key={post.id}>
                  <td>{post.content}</td>
                  <td>{post.date}</td>
                  <td>{post.reach}</td>
                  <td>{post.engagement}</td>
                  <td>{post.clicks}</td>
                  <td>{post.comments}</td>
                  <td>{post.shares}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Custom CSS */}
      <style>{`
        .metric-card {
          border-radius: 12px;
          transition: transform 0.2s;
        }
        .metric-card:hover {
          transform: translateY(-5px);
        }
        .metric-icon {
          font-size: 2rem;
        }
        .metric-value {
          font-weight: bold;
        }
        .trend {
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
};

export default AnalyticsDashboard;
