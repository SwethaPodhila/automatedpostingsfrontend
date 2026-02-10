// src/pages/Analytics.jsx
import React, { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { ArrowUp, ArrowDown, Search } from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Analytics.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function Analytics() {
  const [metrics, setMetrics] = useState([]);
  const [posts, setPosts] = useState([]);
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    // Dummy metrics
    setMetrics([
      { id: 1, name: 'Page Views', value: 1200, trend: 5, icon: '👁️' },
      { id: 2, name: 'Followers', value: 300, trend: -2, icon: '👥' },
      { id: 3, name: 'Engagement', value: 450, trend: 12, icon: '📈' },
      { id: 4, name: 'Likes', value: 800, trend: 3, icon: '❤️' },
    ]);

    // Dummy posts
    setPosts([
      { id: 1, content: 'Post one content example', date: '2026-02-01', reach: 500, engagement: 120, clicks: 50, comments: 10, shares: 5 },
      { id: 2, content: 'Post two content example', date: '2026-02-03', reach: 800, engagement: 220, clicks: 70, comments: 15, shares: 10 },
      { id: 3, content: 'Post three example', date: '2026-02-05', reach: 400, engagement: 90, clicks: 20, comments: 5, shares: 2 },
      { id: 4, content: 'Post four example', date: '2026-02-08', reach: 1000, engagement: 300, clicks: 80, comments: 25, shares: 12 },
    ]);
  }, []);

  const handleMetricClick = (name) => setSelectedMetric(selectedMetric === name ? null : name);

  const handleSort = (field) => {
    if (sortField === field) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const filteredAndSortedPosts = posts
    .filter((post) => post.content.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      if (sortField === 'date') return sortOrder === 'asc' ? new Date(aValue) - new Date(bValue) : new Date(bValue) - new Date(aValue);
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });

  const pageViewsChartData = {
    labels: posts.map((p) => p.date),
    datasets: [
      {
        label: 'Page Views',
        data: posts.map((p) => p.reach),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const engagementChartData = {
    labels: posts.map((p) => (p.content.length > 20 ? p.content.slice(0, 20) + '...' : p.content)),
    datasets: [
      {
        label: 'Engagement',
        data: posts.map((p) => p.engagement),
        backgroundColor: '#3b82f6',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { display: false }, title: { display: false } },
    scales: { y: { beginAtZero: true } },
  };

  return (
    <div className="container py-4">
      <h1 className="text-center mb-4">📊 Analytics Dashboard</h1>

      {/* Metric Cards */}
      <div className="row mb-4">
        {metrics.map((m) => (
          <div key={m.id} className="col-md-3 mb-3">
            <div
              className={`card p-3 metric-card shadow-sm ${
                selectedMetric === m.name ? 'border-primary active-card' : ''
              }`}
              onClick={() => handleMetricClick(m.name)}
            >
              <div className="d-flex justify-content-between align-items-center">
                <div className="metric-icon">{m.icon}</div>
                <div>
                  <h6 className="mb-1">{m.name}</h6>
                  <h4 className="mb-1">{m.value}</h4>
                 
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="row mb-4">
        <div className="col-md-6 mb-3">
          <div className="card p-3 shadow-sm">
            <h5>📈 Page Views Over Time</h5>
            <div style={{ height: '300px' }}>
              <Line data={pageViewsChartData} options={chartOptions} />
            </div>
          </div>
        </div>
        <div className="col-md-6 mb-3">
          <div className="card p-3 shadow-sm">
            <h5>🔥 Top Posts by Engagement</h5>
            <div style={{ height: '300px' }}>
              <Bar data={engagementChartData} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>

      {/* Posts Table */}
      <div className="card p-3 shadow-sm">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5>Recent Posts</h5>
          <div className="input-group w-25">
            <span className="input-group-text">
              <Search size={16} />
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover">
            <thead className="table-light">
              <tr>
                <th>Post</th>
                <th onClick={() => handleSort('date')} className="cursor-pointer">
                  Date
                </th>
                <th onClick={() => handleSort('reach')} className="cursor-pointer">
                  Reach
                </th>
                <th onClick={() => handleSort('engagement')} className="cursor-pointer">
                  Engagement
                </th>
                <th onClick={() => handleSort('clicks')} className="cursor-pointer">
                  Clicks
                </th>
                <th onClick={() => handleSort('comments')} className="cursor-pointer">
                  Comments
                </th>
                <th onClick={() => handleSort('shares')} className="cursor-pointer">
                  Shares
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedPosts.map((p) => (
                <tr key={p.id}>
                  <td>{p.content}</td>
                  <td>{p.date}</td>
                  <td>{p.reach}</td>
                  <td>{p.engagement}</td>
                  <td>{p.clicks}</td>
                  <td>{p.comments}</td>
                  <td>{p.shares}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAndSortedPosts.length === 0 && <p className="text-center py-3">No posts found</p>}
      </div>
    </div>
  );
}

export default Analytics;
