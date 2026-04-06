// // import { useEffect, useState } from "react";
// // import { supabase } from "../../supabaseClient";
// // import { AdminLayout } from "./AdminLayout";
// // import './AdminDashboard.css';

// // /*
// //   ORDERS PAGE — Add your logic here when your orders table is ready.

// //   Expected Supabase table structure (adjust to match yours):
// //     orders (
// //       id, buyer_id, seller_id, item_id, status, total_price, created_at
// //     )

// //   To populate this page:
// //   1. Replace the mock data below with a real supabase.from("orders").select(...)
// //   2. Join with users/items tables as needed
// //   3. Add filter/sort controls if needed
// // */

// // // ── Placeholder until real orders table exists ──
// // const MOCK_ORDERS = [
// //   // Uncomment and adapt once your orders table is live:
// //   // { id: "1", buyer: "Alice", item: "Notebook", status: "delivered", price: 120, date: "2024-03-01" },
// // ];

// // const STATUS_STYLES = {
// //   pending:   { bg: "#fff5e6", color: "#b97a10", label: "Pending"   },
// //   delivered: { bg: "#edf7f1", color: "#2e7d52", label: "Delivered" },
// //   cancelled: { bg: "#fdf0f0", color: "#b03030", label: "Cancelled" },
// // };

// // function AdminOrders() {
// //   const [orders, setOrders] = useState(MOCK_ORDERS);
// //   const [loading, setLoading] = useState(false);

// //   useEffect(() => {
// //     /*
// //       REPLACE THIS with your real fetch once orders table is set up.
// //       Example:
// //         const { data, error } = await supabase
// //           .from("orders")
// //           .select("id, status, total_price, created_at, users(name), items(name)")
// //           .order("created_at", { ascending: false });
// //         if (!error) setOrders(data);
// //     */
// //     setLoading(false);
// //   }, []);

// //   return (
// //     <AdminLayout pageTitle="Orders">
// //       <h1>Orders</h1>

// //       {loading && <p className="muted-text">Loading orders...</p>}

// //       {!loading && orders.length === 0 && (
// //         <div className="empty-state-card">
// //           <p className="empty-state-title">No orders yet</p>
// //           <p className="empty-state-sub">
// //             Orders will appear here once your orders table is connected.
// //           </p>
// //         </div>
// //       )}

// //       {orders.length > 0 && (
// //         <div className="orders-table-wrap">
// //           <table className="orders-table">
// //             <thead>
// //               <tr>
// //                 <th>Order ID</th>
// //                 <th>Buyer</th>
// //                 <th>Item</th>
// //                 <th>Status</th>
// //                 <th>Price</th>
// //                 <th>Date</th>
// //               </tr>
// //             </thead>
// //             <tbody>
// //               {orders.map(order => {
// //                 const style = STATUS_STYLES[order.status] ?? STATUS_STYLES.pending;
// //                 return (
// //                   <tr key={order.id}>
// //                     <td className="order-id">#{order.id}</td>
// //                     <td>{order.buyer}</td>
// //                     <td>{order.item}</td>
// //                     <td>
// //                       <span
// //                         className="order-status-badge"
// //                         style={{ background: style.bg, color: style.color }}
// //                       >
// //                         {style.label}
// //                       </span>
// //                     </td>
// //                     <td>₹{order.price}</td>
// //                     <td className="order-date">{order.date}</td>
// //                   </tr>
// //                 );
// //               })}
// //             </tbody>
// //           </table>
// //         </div>
// //       )}
// //     </AdminLayout>
// //   );
// // }

// // export default AdminOrders;

// import { useEffect, useState } from "react";
// import { supabase } from "../../supabaseClient";
// import { AdminLayout } from "./AdminLayout";
// import './AdminDashboard.css';

// const STATUS_STYLES = {
//   pending:   { bg: "#fff7e6", color: "#d48806", label: "Pending" },
//   shipped:   { bg: "#e6f7ff", color: "#1890ff", label: "Shipped" },
//   delivered: { bg: "#f6ffed", color: "#52c41a", label: "Delivered" },
//   cancelled: { bg: "#fff1f0", color: "#f5222d", label: "Cancelled" },
// };

// function AdminOrders() {
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [stats, setStats] = useState({ total: 0, revenue: 0 });

//   useEffect(() => {
//     fetchOrders();
//   }, []);

//   async function fetchOrders() {
//     setLoading(true);
//     const { data, error } = await supabase
//       .from("orders")
//       .select(`
//         id, 
//         total_amount, 
//         status, 
//         created_at,
//         buyer_name
//       `)
//       .order("created_at", { ascending: false });

//     if (error) {
//       console.error("Error fetching orders:", error);
//     } else {
//       // Ensure total_price is treated as a number for the calculation
//       const totalRev = data?.reduce((acc, curr) => {
//         const price = parseFloat(curr.total_amount) || 0; 
//         return acc + price;
//       }, 0);

//       setOrders(data || []);
//       setStats({ total: data?.length || 0, revenue: totalRev });
//     }
//     setLoading(false);
//   }

//   return (
//     <AdminLayout pageTitle="Global Transactions">
//       {/* Professional Stats Bar for Monitoring */}
//       <div className="admin-stats-grid">
//         <div className="stat-card">
//           <span className="stat-label">Total Transactions</span>
//           <span className="stat-value">{stats.total}</span>
//         </div>
//         <div className="stat-card">
//           <span className="stat-label">Total Revenue</span>
//           <span className="stat-value">₹{stats.revenue.toLocaleString()}</span>
//         </div>
//       </div>

//       <div className="content-card">
//         <div className="card-header">
//           <h2>Order History</h2>
//           <button className="refresh-btn" onClick={fetchOrders}>↻ Refresh</button>
//         </div>

//         {loading ? (
//           <div className="loading-placeholder">Processing transaction data...</div>
//         ) : orders.length === 0 ? (
//           <div className="empty-state-card">
//             <p className="empty-state-title">No orders found</p>
//             <p className="empty-state-sub">Transactions will appear here once campus sales begin.</p>
//           </div>
//         ) : (
//           <div className="orders-table-wrap">
//             <table className="admin-table">
//               <thead>
//                 <tr>
//                   <th>Order ID</th>
//                   <th>Buyer Name</th>
//                   <th>Date</th>
//                   <th>Amount</th>
//                   <th>Status</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {orders.map((order) => {
//                   const style = STATUS_STYLES[order.status] || STATUS_STYLES.pending;
//                   return (
//                     <tr key={order.id}>
//                       <td className="order-id-cell">#{order.id.slice(0, 8)}</td>
//                       <td>{order.buyer_name || "Guest User"}</td>
//                       <td>{new Date(order.created_at).toLocaleDateString()}</td>
//                       <td className="price-cell">₹{order.total_amount}</td>
//                       <td>
//                         <span 
//                           className="status-pill" 
//                           style={{ backgroundColor: style.bg, color: style.color }}
//                         >
//                           {style.label}
//                         </span>
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//     </AdminLayout>
//   );
// }

// export default AdminOrders;

import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../supabaseClient";
import { AdminLayout } from "./AdminLayout";
import './AdminOrders.css';

const STATUS_CONFIG = {
  pending:    { label: "Pending",    dot: "#f59e0b", bg: "rgba(245,158,11,0.12)",  color: "#d97706" },
  confirmed:  { label: "Confirmed",  dot: "#3b82f6", bg: "rgba(59,130,246,0.12)",  color: "#2563eb" },
  processing: { label: "Processing", dot: "#8b5cf6", bg: "rgba(139,92,246,0.12)",  color: "#7c3aed" },
  shipped:    { label: "Shipped",    dot: "#06b6d4", bg: "rgba(6,182,212,0.12)",   color: "#0891b2" },
  delivered:  { label: "Delivered",  dot: "#10b981", bg: "rgba(16,185,129,0.12)",  color: "#059669" },
  cancelled:  { label: "Cancelled",  dot: "#ef4444", bg: "rgba(239,68,68,0.12)",   color: "#dc2626" },
};

const PAYMENT_ICONS = {
  cashfree: "💳",
  upi:      "📱",
  cash:     "💵",
  card:     "🏦",
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status?.toLowerCase()] ?? STATUS_CONFIG.pending;
  return (
    <span className="status-badge" style={{ background: cfg.bg, color: cfg.color }}>
      <span className="status-dot" style={{ background: cfg.dot }} />
      {cfg.label}
    </span>
  );
}

function StatCard({ label, value, sub, accent }) {
  return (
    <div className="stat-card" style={{ "--accent": accent }}>
      <p className="stat-label">{label}</p>
      <p className="stat-value">{value}</p>
      {sub && <p className="stat-sub">{sub}</p>}
    </div>
  );
}

function AdminOrders() {
  const [orders, setOrders]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [search, setSearch]           = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedId, setExpandedId]   = useState(null);
  const [page, setPage]               = useState(0);
  const PAGE_SIZE = 15;

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from("orders")
        .select(`
          id,
          buyer_id,
          status,
          total_amount,
          total_price,
          created_at,
          buyer_name,
          buyer_phone,
          delivery_address,
          payment_method,
          cashfree_order_id,
          order_items (
            id,
            quantity,
            price_at_purchase,
            products ( name, image_urls )
          )
        `)
        .order("created_at", { ascending: false });

      if (err) throw err;
      setOrders(data ?? []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // ── derived stats ──
  const totalRevenue  = orders.reduce((s, o) => s + (parseFloat(o.total_price ?? o.total_amount) || 0), 0);
  const pendingCount  = orders.filter(o => o.status?.toLowerCase() === "pending").length;
  const deliveredCount = orders.filter(o => o.status?.toLowerCase() === "delivered").length;

  // ── filtered & paginated ──
  const filtered = orders.filter(o => {
    const matchStatus = statusFilter === "all" || o.status?.toLowerCase() === statusFilter;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      o.buyer_name?.toLowerCase().includes(q) ||
      o.id?.toLowerCase().includes(q) ||
      o.cashfree_order_id?.toLowerCase().includes(q) ||
      o.delivery_address?.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageOrders = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const handleSearch = (e) => { setSearch(e.target.value); setPage(0); };
  const handleFilter = (s) => { setStatusFilter(s); setPage(0); };

  const fmtDate = (ts) => {
    if (!ts) return "—";
    const d = new Date(ts);
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
      + " · " + d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  };

  const fmtPrice = (v) => {
    const n = parseFloat(v);
    return isNaN(n) ? "—" : `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
  };

  return (
    <AdminLayout pageTitle="Orders">
      <div className="ao-page">

        {/* ── Header ── */}
        <div className="ao-header">
          <div>
            <h1 className="ao-title">Orders</h1>
            <p className="ao-subtitle">{orders.length} total transactions</p>
          </div>
          <button className="ao-refresh-btn" onClick={fetchOrders} disabled={loading}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
              <path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
              <path d="M3 21v-5h5"/>
            </svg>
            Refresh
          </button>
        </div>

        {/* ── Stats ── */}
        <div className="ao-stats">
          <StatCard label="Total Revenue"     value={fmtPrice(totalRevenue)}   sub={`${orders.length} orders`}     accent="#7c6353" />
          <StatCard label="Pending"           value={pendingCount}              sub="awaiting action"               accent="#d97706" />
          <StatCard label="Delivered"         value={deliveredCount}            sub="completed orders"              accent="#059669" />
          <StatCard label="Avg. Order Value"  value={orders.length ? fmtPrice(totalRevenue / orders.length) : "—"} sub="per transaction" accent="#2563eb" />
        </div>

        {/* ── Controls ── */}
        <div className="ao-controls">
          <div className="ao-search-wrap">
            <svg className="ao-search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              className="ao-search"
              placeholder="Search by name, order ID, address…"
              value={search}
              onChange={handleSearch}
            />
          </div>
          <div className="ao-filters">
            {["all", "pending", "confirmed", "processing", "shipped", "delivered", "cancelled"].map(s => (
              <button
                key={s}
                className={`ao-filter-btn ${statusFilter === s ? "active" : ""}`}
                onClick={() => handleFilter(s)}
              >
                {s === "all" ? "All" : STATUS_CONFIG[s]?.label ?? s}
              </button>
            ))}
          </div>
        </div>

        {/* ── States ── */}
        {error && (
          <div className="ao-error">
            <span>⚠️ Failed to load orders: {error}</span>
            <button onClick={fetchOrders}>Retry</button>
          </div>
        )}

        {loading && (
          <div className="ao-loading">
            {[...Array(6)].map((_, i) => <div key={i} className="ao-skeleton" style={{ animationDelay: `${i * 0.08}s` }} />)}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="ao-empty">
            <div className="ao-empty-icon">📦</div>
            <p className="ao-empty-title">{search || statusFilter !== "all" ? "No matching orders" : "No orders yet"}</p>
            <p className="ao-empty-sub">{search || statusFilter !== "all" ? "Try adjusting your filters." : "Orders will appear here once customers start purchasing."}</p>
          </div>
        )}

        {/* ── Table ── */}
        {!loading && !error && pageOrders.length > 0 && (
          <div className="ao-table-wrap">
            <table className="ao-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Buyer</th>
                  <th>Items</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {pageOrders.map(order => {
                  const isExpanded = expandedId === order.id;
                  const itemCount  = order.order_items?.length ?? 0;
                  const pmLower    = order.payment_method?.toLowerCase() ?? "";
                  const pmIcon     = PAYMENT_ICONS[pmLower] ?? "💳";
                  const amount     = order.total_price ?? order.total_amount;

                  return (
                    <>
                      <tr
                        key={order.id}
                        className={`ao-row ${isExpanded ? "expanded" : ""}`}
                        onClick={() => setExpandedId(isExpanded ? null : order.id)}
                      >
                        <td>
                          <span className="order-id">#{order.id?.slice(0, 8).toUpperCase()}</span>
                          {order.cashfree_order_id && (
                            <span className="order-ref">{order.cashfree_order_id.slice(0, 12)}…</span>
                          )}
                        </td>
                        <td>
                          <div className="buyer-cell">
                            <div className="buyer-avatar">{order.buyer_name?.[0]?.toUpperCase() ?? "?"}</div>
                            <div>
                              <p className="buyer-name">{order.buyer_name ?? "Unknown"}</p>
                              <p className="buyer-phone">{order.buyer_phone ?? "—"}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="item-count">{itemCount} item{itemCount !== 1 ? "s" : ""}</span>
                        </td>
                        <td>
                          <span className="payment-badge">{pmIcon} {order.payment_method ?? "—"}</span>
                        </td>
                        <td><StatusBadge status={order.status} /></td>
                        <td><span className="amount">{fmtPrice(amount)}</span></td>
                        <td><span className="order-date">{fmtDate(order.created_at)}</span></td>
                        <td>
                          <span className={`expand-chevron ${isExpanded ? "open" : ""}`}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="m6 9 6 6 6-6"/>
                            </svg>
                          </span>
                        </td>
                      </tr>

                      {/* ── Expanded detail row ── */}
                      {isExpanded && (
                        <tr key={`${order.id}-detail`} className="ao-detail-row">
                          <td colSpan={8}>
                            <div className="ao-detail">
                              <div className="detail-section">
                                <h4>Delivery Address</h4>
                                <p>{order.delivery_address || "Not provided"}</p>
                              </div>
                              {order.order_items?.length > 0 && (
                                <div className="detail-section">
                                  <h4>Items Ordered</h4>
                                  <div className="detail-items">
                                    {order.order_items.map(item => (
                                      <div key={item.id} className="detail-item">
                                        <span className="detail-item-name">{item.products?.name ?? "Product"}</span>
                                        <span className="detail-item-qty">× {item.quantity}</span>
                                        <span className="detail-item-price">{fmtPrice(item.price_at_purchase)}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              <div className="detail-section">
                                <h4>Order ID (Full)</h4>
                                <p className="monospace">{order.id}</p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>

            {/* ── Pagination ── */}
            {totalPages > 1 && (
              <div className="ao-pagination">
                <span className="ao-page-info">
                  Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length}
                </span>
                <div className="ao-page-btns">
                  <button disabled={page === 0} onClick={() => setPage(p => p - 1)}>← Prev</button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      className={i === page ? "active" : ""}
                      onClick={() => setPage(i)}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button disabled={page === totalPages - 1} onClick={() => setPage(p => p + 1)}>Next →</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default AdminOrders;