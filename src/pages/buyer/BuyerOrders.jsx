import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import "./Checkout.css";

function BuyerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (
            id,
            quantity,
            price_at_purchase,
            products (name, image_urls)
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error("Orders fetch error:", err);
    } finally {
      setLoading(false);
    }
  }

  // ✅ Status config — color + label for every possible status
  function getStatusStyle(status) {
    switch (status) {
      case "paid":
        return { color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0", label: "Paid" };
      case "confirmed":
        return { color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe", label: "Confirmed" };
      case "completed":
        return { color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0", label: "Completed" };
      case "cancelled":
        return { color: "#dc2626", bg: "#fef2f2", border: "#fecaca", label: "Cancelled" };
      case "pending":
      default:
        return { color: "#d97706", bg: "#fffbeb", border: "#fde68a", label: "Pending" };
    }
  }

  if (loading) return <div className="checkout-page">Loading orders...</div>;

  return (
    <div className="checkout-page">
      <h2>My Orders</h2>

      {orders.length === 0 ? (
        <div className="checkout-section">
          <p>No orders yet 🛒</p>
        </div>
      ) : (
        <div className="checkout-layout">
          <div className="checkout-left">
            {orders.map((order) => {
              const s = getStatusStyle(order.status);
              return (
                <div className="checkout-section" key={order.id}>

                  {/* HEADER */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <p style={{ fontSize: 13, color: "#777", marginBottom: 4 }}>
                        <strong style={{ color: "#333" }}>Order ID:</strong>{" "}
                        {order.cashfree_order_id || order.id}
                      </p>

                      {/* ✅ Status badge */}
                      <span style={{
                        display: "inline-block",
                        backgroundColor: s.bg,
                        color: s.color,
                        border: `1px solid ${s.border}`,
                        borderRadius: 20,
                        padding: "3px 12px",
                        fontSize: 12,
                        fontWeight: 700,
                        textTransform: "capitalize",
                      }}>
                        {s.label}
                      </span>

                      {/* ✅ Warning for stuck pending orders */}
                      {order.status === "pending" && (
                        <p style={{ fontSize: 11, color: "#d97706", marginTop: 6 }}>
                          ⏳ Payment confirmation in progress...
                        </p>
                      )}
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <p style={{ fontWeight: 700, fontSize: 16, color: "#333" }}>
                        ₹{order.total_amount}
                      </p>
                      <p style={{ fontSize: 12, color: "#777", marginTop: 2 }}>
                        {new Date(order.created_at).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric"
                        })}
                      </p>
                    </div>
                  </div>

                  <hr style={{ margin: "12px 0" }} />

                  {/* ITEMS */}
                  {order.order_items && order.order_items.length > 0 ? (
                    order.order_items.map((item) => (
                      <div className="summary-item" key={item.id}>
                        <img
                          src={
                            Array.isArray(item.products?.image_urls)
                              ? item.products.image_urls[0]
                              : item.products?.image_urls
                          }
                          className="summary-img"
                          alt={item.products?.name || "Product"}
                          onError={(e) => { e.target.style.display = "none"; }}
                        />
                        <div className="summary-info">
                          <p className="summary-name">{item.products?.name || "Unknown Product"}</p>
                          <p className="summary-qty">Qty: {item.quantity}</p>
                        </div>
                        <p className="summary-price">
                          ₹{item.price_at_purchase * item.quantity}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p style={{ color: "#999", fontSize: 13 }}>No items found for this order.</p>
                  )}

                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default BuyerOrders;

// import { useEffect, useState } from "react";
// import { supabase } from "../../supabaseClient";
// import "./Checkout.css";

// function BuyerOrders() {
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [userId, setUserId] = useState(null);

//   useEffect(() => {
//     fetchOrders();
//   }, []);

//   async function fetchOrders() {
//     try {
//       const { data: { user } } = await supabase.auth.getUser();
//       if (!user) { setLoading(false); return; }

//       setUserId(user.id);

//       const { data, error } = await supabase
//         .from("orders")
//         .select(`
//           *,
//           order_items (
//             id,
//             quantity,
//             price_at_purchase,
//             products (name, image_urls)
//           )
//         `)
//         .eq("user_id", user.id)
//         .order("created_at", { ascending: false });

//       if (error) throw error;

//       console.log("📦 Orders fetched:", data); // debug
//       setOrders(data || []);
//     } catch (err) {
//       console.error("Orders fetch error:", err);
//     } finally {
//       setLoading(false);
//     }
//   }

//   if (loading) return <div className="checkout-page">Loading orders...</div>;

//   return (
//     <div className="checkout-page">
//       <h2>My Orders</h2>

//       {orders.length === 0 ? (
//         <div className="checkout-section">
//           <p>No orders yet 🛒</p>
//           {/* Debug helper — remove after testing */}
//           <p style={{ fontSize: 12, color: "#999" }}>
//             If you just placed an order, make sure you're logged in as the same user.
//           </p>
//         </div>
//       ) : (
//         <div className="checkout-layout">
//           <div className="checkout-left">
//             {orders.map((order) => (
//               <div className="checkout-section" key={order.id}>

//                 {/* HEADER */}
//                 <div style={{ display: "flex", justifyContent: "space-between" }}>
//                   <div>
//                     <p><strong>Order ID:</strong> {order.cashfree_order_id || order.id}</p>
//                     <p>
//                       <strong>Status:</strong>{" "}
//                       <span style={{
//                         color: order.status === "paid" ? "green"
//                           : order.status === "pending" ? "#f59e0b" : "#c084fc",
//                         fontWeight: 600, textTransform: "capitalize"
//                       }}>
//                         {order.status}
//                       </span>
//                     </p>
//                   </div>
//                   <div style={{ textAlign: "right" }}>
//                     {/*  use total_amount (not total_price) */}
//                     <p><strong>₹{order.total_amount}</strong></p>
//                     <p style={{ fontSize: "12px", color: "#777" }}>
//                       {new Date(order.created_at).toLocaleDateString("en-IN")}
//                     </p>
//                   </div>
//                 </div>

//                 <hr style={{ margin: "12px 0" }} />

//                 {/* ITEMS */}
//                 {order.order_items && order.order_items.length > 0 ? (
//                   order.order_items.map((item) => (
//                     <div className="summary-item" key={item.id}>
//                       <img
//                         //  handle array or string
//                         src={
//                           Array.isArray(item.products?.image_urls)
//                             ? item.products.image_urls[0]
//                             : item.products?.image_urls
//                         }
//                         className="summary-img"
//                         alt={item.products?.name || "Product"}
//                         onError={(e) => { e.target.style.display = "none"; }}
//                       />
//                       <div className="summary-info">
//                         <p className="summary-name">{item.products?.name || "Unknown Product"}</p>
//                         <p className="summary-qty">Qty: {item.quantity}</p>
//                       </div>
//                       <p className="summary-price">
//                         ₹{item.price_at_purchase * item.quantity}
//                       </p>
//                     </div>
//                   ))
//                 ) : (
//                   <p style={{ color: "#999", fontSize: 13 }}>No items found for this order.</p>
//                 )}

//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default BuyerOrders;