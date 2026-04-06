import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { AdminLayout } from "./AdminLayout";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import './AdminDashboard.css';

const COLORS = {
  buyers:   "#8b6a6a",
  sellers:  "#6b4e4e",
  pending:  "#c4956a",
  approved: "#7aad8a",
  rejected: "#c47a7a",
};

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    buyers: 0,
    sellers: 0,
    pending: 0,
    totalOrders: 0, // New state for dynamic orders
  });

  const [approvalStats, setApprovalStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      // 1. Fetch Users
      const { data: users, error: userError } = await supabase
        .from("users")
        .select("role, seller_status");

      // 2. Fetch Seller Requests
      const { data: requests, error: requestError } = await supabase
        .from("seller_requests")
        .select("status");

      // 3. Fetch Total Orders Dynamically
      const { count: orderCount, error: orderError } = await supabase
        .from("orders")
        .select('*', { count: 'exact', head: true });

      if (userError || requestError || orderError) {
        console.error(userError || requestError || orderError);
        setLoading(false);
        return;
      }

      const pending  = requests.filter(r => r.status === "pending").length;
      const approved = requests.filter(r => r.status === "approved").length;
      const rejected = requests.filter(r => r.status === "rejected").length;

      setStats({
        totalUsers: users.length,
        buyers:     users.filter(u => u.role === "buyer").length,
        sellers:    users.filter(u => u.role === "seller" && u.seller_status === "approved").length,
        pending,
        totalOrders: orderCount || 0, // Set the dynamic count
      });

      setApprovalStats({ pending, approved, rejected });
      setLoading(false);
    };

    fetchAll();
  }, []);

  const userBarData = [
    { name: "Buyers",  value: stats.buyers  },
    { name: "Sellers", value: stats.sellers },
  ];

  const approvalPieData = [
    { name: "Pending",  value: approvalStats.pending,  color: COLORS.pending  },
    { name: "Approved", value: approvalStats.approved, color: COLORS.approved },
    { name: "Rejected", value: approvalStats.rejected, color: COLORS.rejected },
  ].filter(d => d.value > 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip">
          <p className="tooltip-label">{payload[0].name}</p>
          <p className="tooltip-value">{payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <AdminLayout pageTitle="Dashboard">
      <h1>Overview</h1>

      <div className="stats-grid">
        <div className="stats-card">
          <h3>Total Users</h3>
          <p>{stats.totalUsers}</p>
        </div>
        <div className="stats-card">
          <h3>Total Buyers</h3>
          <p>{stats.buyers}</p>
        </div>
        <div className="stats-card">
          <h3>Total Sellers</h3>
          <p>{stats.sellers}</p>
        </div>
        <div className="stats-card">
          <h3>Pending Approvals</h3>
          <p className={stats.pending > 0 ? "stat-warn" : ""}>{stats.pending}</p>
        </div>
        <div className="stats-card">
          <h3>Total Orders</h3>
          {/* Now displaying dynamic data */}
          <p>{stats.totalOrders}</p> 
        </div>
      </div>

      {!loading && (
        <div className="charts-row">
          <div className="chart-card">
            <p className="chart-title">User breakdown</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={userBarData}
                margin={{ top: 8, right: 16, left: -10, bottom: 0 }}
                barSize={48}
              >
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: "#9e8080" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 12, fill: "#9e8080" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(107,78,78,0.06)" }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {userBarData.map((entry, i) => (
                    <Cell
                      key={`cell-${i}`}
                      fill={i === 0 ? COLORS.buyers : COLORS.sellers}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <p className="chart-title">Seller request status</p>
            {approvalPieData.length === 0 ? (
              <div className="chart-empty">No requests yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={approvalPieData}
                    cx="50%"
                    cy="45%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {approvalPieData.map((entry, i) => (
                      <Cell key={`cell-${i}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => (
                      <span style={{ fontSize: 12, color: "#9e8080" }}>{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminDashboard;