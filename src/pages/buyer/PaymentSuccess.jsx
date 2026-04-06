
// import { useEffect, useState } from "react";
// import { useSearchParams, useNavigate } from "react-router-dom";
// import { supabase } from "../../supabaseClient";

// function PaymentSuccess() {
//   const [searchParams] = useSearchParams();
//   const navigate = useNavigate();
//   const cashfreeOrderId = searchParams.get("order_id");

//   const [order, setOrder] = useState(null);
//   const [items, setItems] = useState([]);
//   const [status, setStatus] = useState("loading");

//   useEffect(() => {
//     if (cashfreeOrderId) handleSuccess();
//   }, [cashfreeOrderId]);

//   async function handleSuccess() {
//     try {
//       console.log("🔍 Cashfree Order ID:", cashfreeOrderId);

//       //  1. FIND ORDER
//       const { data: existingOrder, error: findError } = await supabase
//         .from("orders")
//         .select("*")
//         .eq("cashfree_order_id", cashfreeOrderId)
//         .single();

//       console.log("📦 Found Order:", existingOrder);

//       if (findError || !existingOrder) {
//         console.error("❌ Order not found:", findError);
//         setStatus("error");
//         return;
//       }

//       //  2. FETCH ORDER ITEMS — no join, plain fetch
//       const { data: rawItems, error: itemsError } = await supabase
//         .from("order_items")
//         .select("*")
//         .eq("order_id", existingOrder.id);

//       console.log("🧾 Raw items fetched:", rawItems);

//       if (itemsError) {
//         console.error("❌ Items fetch error:", itemsError);
//         setStatus("error");
//         return;
//       }

//       //  3. FETCH PRODUCTS separately for display
//       let enrichedItems = [];
//       if (rawItems && rawItems.length > 0) {
//         const productIds = rawItems.map((i) => i.product_id);

//         const { data: productsData } = await supabase
//           .from("products")
//           .select("id, name, category, image_urls")
//           .in("id", productIds);

//         const productsMap = {};
//         (productsData || []).forEach((p) => { productsMap[p.id] = p; });

//         enrichedItems = rawItems.map((item) => ({
//           ...item,
//           products: productsMap[item.product_id] || null,
//         }));
//       }

//       console.log(" Enriched items:", enrichedItems);

//       //  ONLY run side effects if order not already paid
//       if (existingOrder.status !== "paid") {

//         // Mark order as paid
//       //  Mark order as paid via RPC (bypasses RLS)
//       const { error: updateError } = await supabase.rpc("mark_order_paid", {
//         order_id: existingOrder.id,
//       });

//       if (updateError) {
//         console.error("❌ Order update error:", updateError);
//       } else {
//         console.log("✅ Order marked as PAID");
// }

//         // ✅ Decrement stock — using rawItems (has product_id + quantity)
//         // rawItems is guaranteed to exist here, enrichedItems may have display data
//         for (const item of rawItems) {
//           console.log(`📦 Decrementing stock for product ${item.product_id} by ${item.quantity}`);

//           const { error: rpcError } = await supabase.rpc("decrement_stock", {
//             product_id: item.product_id,
//             qty: item.quantity,
//           });

//           if (rpcError) {
//             console.error(`❌ Stock decrement failed for ${item.product_id}:`, rpcError);
//           } else {
//             console.log(`✅ Stock reduced for ${item.product_id} by ${item.quantity}`);
//           }
//         }

//         //. Clear cart
//         const { data: { user } } = await supabase.auth.getUser();
//         if (user) {
//           const { error: cartError } = await supabase
//             .from("cart")
//             .delete()
//             .eq("user_id", user.id);

//           if (cartError) console.error("❌ Cart clear error:", cartError);
//           else console.log("🛒 Cart cleared");
//         }

//         //   Send email (non-blocking — won't crash if fails)
//         try {
//           const { data: { user: emailUser } } = await supabase.auth.getUser();
//           if (emailUser?.email) {
//             await fetch("http://localhost:5000/send-invoice-email", {
//               method: "POST",
//               headers: { "Content-Type": "application/json" },
//               body: JSON.stringify({
//                 email: emailUser.email,
//                 order: { ...existingOrder, status: "paid" },
//                 items: enrichedItems,
//               }),
//             });
//             console.log("📧 Email sent");
//           }
//         } catch (emailErr) {
//           console.error("📧 Email failed (non-critical):", emailErr);
//         }
//       } else {
//         console.log("ℹ️ Order already paid — skipping side effects");
//       }

//       setOrder({ ...existingOrder, status: "paid" });
//       setItems(enrichedItems);
//       setStatus("success");

//     } catch (err) {
//       console.error("❌ Unhandled error:", err);
//       setStatus("error");
//     }
//   }

//   if (status === "loading") {
//     return (
//       <div style={s.center}>
//         <div style={s.spinner} />
//         <p style={{ color: "#666" }}>Confirming your payment...</p>
//       </div>
//     );
//   }

//   if (status === "error") {
//     return (
//       <div style={s.center}>
//         <div style={s.errorCard}>
//           <div style={{ fontSize: 56, marginBottom: 16 }}>⚠️</div>
//           <h2>Couldn't load order</h2>
//           <p style={{ color: "#666", marginBottom: 24 }}>
//             Payment went through. Please check your orders page.
//           </p>
//           <button style={s.primaryBtn} onClick={() => navigate("/buyer/orders")}>
//             View My Orders
//           </button>
//         </div>
//       </div>
//     );
//   }

//   const invoiceDate = new Date(order.created_at).toLocaleDateString("en-IN", {
//     day: "2-digit", month: "long", year: "numeric",
//   });

//   const subtotal = items.reduce(
//     (sum, item) => sum + item.price_at_purchase * item.quantity, 0
//   ) || order.total_amount;

//   return (
//     <>
//       <style>{`
//         @keyframes spin { to { transform: rotate(360deg); } }
//         @media print {
//           * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
//           body * { visibility: hidden; }
//           #invoice-printable, #invoice-printable * { visibility: visible; }
//           #invoice-printable {
//             position: fixed; inset: 0;
//             padding: 32px 48px;
//             background: white;
//             font-family: 'Segoe UI', sans-serif;
//           }
//           .no-print { display: none !important; }
//         }
//       `}</style>

//       <div style={s.page}>

//         <div className="no-print" style={s.banner}>
//           <div style={s.checkCircle}>✓</div>
//           <h1 style={s.bannerTitle}>Payment Successful!</h1>
//           <p style={s.bannerSub}>Your order has been placed and will be delivered soon 🎉</p>
//         </div>

//         <div id="invoice-printable" style={s.invoice}>

//           <div style={s.invoiceHeader}>
//             <div>
//               <h2 style={s.brandName}>CampusBazaar</h2>
//               <p style={s.brandTagline}>Student Marketplace</p>
//             </div>
//             <div style={{ textAlign: "right" }}>
//               <p style={s.invoiceLabel}>INVOICE</p>
//               <p style={s.invoiceId}>#{cashfreeOrderId}</p>
//               <p style={s.invoiceDate}>{invoiceDate}</p>
//             </div>
//           </div>

//           <div style={s.divider} />

//           <div style={s.billRow}>
//             <div style={s.billBlock}>
//               <p style={s.sectionLabel}>BILL TO</p>
//               <p style={s.billName}>{order.buyer_name}</p>
//               <p style={s.billDetail}>📞 {order.buyer_phone}</p>
//               <p style={s.billDetail}>📍 {order.delivery_address}</p>
//             </div>
//             <div style={s.billBlock}>
//               <p style={s.sectionLabel}>PAYMENT</p>
//               <p style={s.billName}>Cashfree</p>
//               <p style={s.billDetail}>
//                 Status: <span style={s.paidBadge}>✓ PAID</span>
//               </p>
//               <p style={s.billDetail}>Method: UPI / Card</p>
//             </div>
//           </div>

//           <div style={s.divider} />

//           <table style={s.table}>
//             <thead>
//               <tr style={{ backgroundColor: "#f9fafb" }}>
//                 <th style={{ ...s.th, textAlign: "left", width: 32 }}>#</th>
//                 <th style={{ ...s.th, textAlign: "left" }}>Item</th>
//                 <th style={s.th}>Qty</th>
//                 <th style={s.th}>Unit Price</th>
//                 <th style={{ ...s.th, textAlign: "right" }}>Total</th>
//               </tr>
//             </thead>
//             <tbody>
//               {items.length === 0 ? (
//                 <tr>
//                   <td colSpan={5} style={{ ...s.td, textAlign: "center", color: "#aaa", fontStyle: "italic" }}>
//                     No items found
//                   </td>
//                 </tr>
//               ) : (
//                 items.map((item, i) => (
//                   <tr key={item.id} style={{ backgroundColor: i % 2 === 0 ? "#fff" : "#fafafa" }}>
//                     <td style={{ ...s.td, color: "#aaa" }}>{i + 1}</td>
//                     <td style={s.td}>
//                       <span style={{ fontWeight: 500 }}>{item.products?.name || "—"}</span>
//                       {item.products?.category && (
//                         <span style={{ fontSize: 11, color: "#aaa", marginLeft: 6 }}>
//                           {item.products.category}
//                         </span>
//                       )}
//                     </td>
//                     <td style={{ ...s.td, textAlign: "center" }}>{item.quantity}</td>
//                     <td style={{ ...s.td, textAlign: "center" }}>₹{item.price_at_purchase}</td>
//                     <td style={{ ...s.td, textAlign: "right", fontWeight: 600 }}>
//                       ₹{item.price_at_purchase * item.quantity}
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>

//           <div style={s.totalsBox}>
//             <div style={s.totalRow}>
//               <span style={{ color: "#999" }}>Subtotal</span>
//               <span>₹{subtotal}</span>
//             </div>
//             <div style={s.totalRow}>
//               <span style={{ color: "#999" }}>Delivery</span>
//               <span style={{ color: "#16a34a", fontWeight: 600 }}>FREE</span>
//             </div>
//             <div style={s.divider} />
//             <div style={{ display: "flex", justifyContent: "space-between", fontSize: 17, fontWeight: 700, color: "#1a1a1a", marginTop: 12 }}>
//               <span>Total Paid</span>
//               <span style={{ color: "#6b3fa0" }}>₹{order.total_amount}</span>
//             </div>
//           </div>

//           <div style={{ textAlign: "center", marginTop: 32, color: "#bbb", fontSize: 13 }}>
//             <p>Thank you for shopping with CampusBazaar! 🛍️</p>
//             <p style={{ fontSize: 11, marginTop: 4 }}>Computer-generated invoice. No signature required.</p>
//           </div>
//         </div>

//         <div className="no-print" style={s.actions}>
//           <button style={s.printBtn} onClick={() => window.print()}>🖨️ Save as PDF / Print</button>
//           <button style={s.primaryBtn} onClick={() => navigate("/buyer/orders")}>📦 My Orders</button>
//           <button style={s.secondaryBtn} onClick={() => navigate("/")}>🛍️ Continue Shopping</button>
//         </div>

//       </div>
//     </>
//   );
// }

// const s = {
//   page: { minHeight: "100vh", backgroundColor: "#f3f4f6", display: "flex", flexDirection: "column", alignItems: "center", padding: "32px 16px 64px", fontFamily: "'Segoe UI', sans-serif" },
//   center: { minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI', sans-serif" },
//   spinner: { width: 48, height: 48, border: "4px solid #e5e7eb", borderTop: "4px solid #6b3fa0", borderRadius: "50%", animation: "spin 0.8s linear infinite", marginBottom: 16 },
//   banner: { textAlign: "center", marginBottom: 32 },
//   checkCircle: { width: 72, height: 72, borderRadius: "50%", backgroundColor: "#22c55e", color: "#fff", fontSize: 36, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" },
//   bannerTitle: { fontSize: 28, fontWeight: 700, color: "#1a1a1a", margin: 0 },
//   bannerSub: { color: "#555", marginTop: 8 },
//   invoice: { backgroundColor: "#fff", borderRadius: 16, padding: "40px", width: "100%", maxWidth: 700, boxShadow: "0 4px 24px rgba(0,0,0,0.08)" },
//   invoiceHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
//   brandName: { fontSize: 22, fontWeight: 800, color: "#6b3fa0", margin: 0 },
//   brandTagline: { fontSize: 12, color: "#aaa", marginTop: 4 },
//   invoiceLabel: { fontSize: 11, fontWeight: 700, color: "#aaa", letterSpacing: 2, margin: 0 },
//   invoiceId: { fontSize: 13, fontWeight: 600, color: "#333", margin: "4px 0 0" },
//   invoiceDate: { fontSize: 12, color: "#aaa", margin: "2px 0 0" },
//   divider: { borderTop: "1px solid #f0f0f0", margin: "20px 0" },
//   billRow: { display: "flex", gap: 32 },
//   billBlock: { flex: 1 },
//   sectionLabel: { fontSize: 10, fontWeight: 700, color: "#aaa", letterSpacing: 2, margin: "0 0 8px" },
//   billName: { fontSize: 15, fontWeight: 600, color: "#1a1a1a", margin: "0 0 4px" },
//   billDetail: { fontSize: 13, color: "#666", margin: "3px 0" },
//   paidBadge: { backgroundColor: "#dcfce7", color: "#16a34a", padding: "2px 8px", borderRadius: 99, fontSize: 12, fontWeight: 600 },
//   table: { width: "100%", borderCollapse: "collapse" },
//   th: { padding: "10px 12px", fontSize: 11, fontWeight: 700, color: "#999", letterSpacing: 1, textAlign: "center" },
//   td: { padding: "12px", fontSize: 14, color: "#333", borderBottom: "1px solid #f5f5f5" },
//   totalsBox: { marginTop: 20, backgroundColor: "#f9fafb", borderRadius: 10, padding: "16px 20px" },
//   totalRow: { display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 8 },
//   actions: { display: "flex", gap: 12, marginTop: 24, flexWrap: "wrap", justifyContent: "center" },
//   printBtn: { backgroundColor: "#1e293b", color: "#fff", border: "none", borderRadius: 10, padding: "13px 22px", fontSize: 14, fontWeight: 600, cursor: "pointer" },
//   primaryBtn: { backgroundColor: "#6b3fa0", color: "#fff", border: "none", borderRadius: 10, padding: "13px 22px", fontSize: 14, fontWeight: 600, cursor: "pointer" },
//   secondaryBtn: { backgroundColor: "#fff", color: "#333", border: "1.5px solid #e5e7eb", borderRadius: 10, padding: "13px 22px", fontSize: 14, fontWeight: 600, cursor: "pointer" },
//   errorCard: { backgroundColor: "#fff", borderRadius: 16, padding: "48px 40px", textAlign: "center", boxShadow: "0 4px 24px rgba(0,0,0,0.1)", maxWidth: 400 },
// };

// export default PaymentSuccess;



import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";

function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const cashfreeOrderId = searchParams.get("order_id");

  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    if (cashfreeOrderId) handleSuccess();
  }, [cashfreeOrderId]);

  async function handleSuccess() {
    try {
      console.log("🔍 Cashfree Order ID:", cashfreeOrderId);

      const { data: existingOrder, error: findError } = await supabase
        .from("orders")
        .select("*")
        .eq("cashfree_order_id", cashfreeOrderId)
        .single();

      console.log("📦 Found Order:", existingOrder);

      if (findError || !existingOrder) {
        console.error("❌ Order not found:", findError);
        setStatus("error");
        return;
      }

      const { data: rawItems, error: itemsError } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", existingOrder.id);

      console.log("🧾 Raw items fetched:", rawItems);

      if (itemsError) {
        console.error("❌ Items fetch error:", itemsError);
        setStatus("error");
        return;
      }

      let enrichedItems = [];
      if (rawItems && rawItems.length > 0) {
        const productIds = rawItems.map((i) => i.product_id);

        const { data: productsData } = await supabase
          .from("products")
          .select("id, name, category, image_urls")
          .in("id", productIds);

        const productsMap = {};
        (productsData || []).forEach((p) => { productsMap[p.id] = p; });

        enrichedItems = rawItems.map((item) => ({
          ...item,
          products: productsMap[item.product_id] || null,
        }));
      }

      console.log("✅ Enriched items:", enrichedItems);

      if (existingOrder.status !== "paid") {

        // ✅ ONLY CHANGED LINE — uses RPC instead of direct update
        const { error: updateError } = await supabase.rpc("mark_order_paid", {
          order_id: existingOrder.id,
        });

        if (updateError) {
          console.error("❌ Order update error:", updateError);
        } else {
          console.log("✅ Order marked as PAID");
        }

        for (const item of rawItems) {
          console.log(`📦 Decrementing stock for product ${item.product_id} by ${item.quantity}`);

          const { error: rpcError } = await supabase.rpc("decrement_stock", {
            product_id: item.product_id,
            qty: item.quantity,
          });

          if (rpcError) {
            console.error(`❌ Stock decrement failed for ${item.product_id}:`, rpcError);
          } else {
            console.log(`✅ Stock reduced for ${item.product_id} by ${item.quantity}`);
          }
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { error: cartError } = await supabase
            .from("cart")
            .delete()
            .eq("user_id", user.id);

          if (cartError) console.error("❌ Cart clear error:", cartError);
          else console.log("🛒 Cart cleared");
        }

        try {
          const { data: { user: emailUser } } = await supabase.auth.getUser();
          if (emailUser?.email) {
            await fetch("http://localhost:5000/send-invoice-email", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: emailUser.email,
                order: { ...existingOrder, status: "paid" },
                items: enrichedItems,
              }),
            });
            console.log("📧 Email sent");
          }
        } catch (emailErr) {
          console.error("📧 Email failed (non-critical):", emailErr);
        }

      } else {
        console.log("ℹ️ Order already paid — skipping side effects");
      }

      setOrder({ ...existingOrder, status: "paid" });
      setItems(enrichedItems);
      setStatus("success");

    } catch (err) {
      console.error("❌ Unhandled error:", err);
      setStatus("error");
    }
  }

  if (status === "loading") {
    return (
      <div style={s.center}>
        <div style={s.spinner} />
        <p style={{ color: "#666" }}>Confirming your payment...</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div style={s.center}>
        <div style={s.errorCard}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>⚠️</div>
          <h2>Couldn't load order</h2>
          <p style={{ color: "#666", marginBottom: 24 }}>
            Payment went through. Please check your orders page.
          </p>
          <button style={s.primaryBtn} onClick={() => navigate("/buyer/orders")}>
            View My Orders
          </button>
        </div>
      </div>
    );
  }

  const invoiceDate = new Date(order.created_at).toLocaleDateString("en-IN", {
    day: "2-digit", month: "long", year: "numeric",
  });

  const subtotal = items.reduce(
    (sum, item) => sum + item.price_at_purchase * item.quantity, 0
  ) || order.total_amount;

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media print {
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          body * { visibility: hidden; }
          #invoice-printable, #invoice-printable * { visibility: visible; }
          #invoice-printable {
            position: fixed; inset: 0;
            padding: 32px 48px;
            background: white;
            font-family: 'Segoe UI', sans-serif;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      <div style={s.page}>

        <div className="no-print" style={s.banner}>
          <div style={s.checkCircle}>✓</div>
          <h1 style={s.bannerTitle}>Payment Successful!</h1>
          <p style={s.bannerSub}>Your order has been placed and will be delivered soon 🎉</p>
        </div>

        <div id="invoice-printable" style={s.invoice}>

          <div style={s.invoiceHeader}>
            <div>
              <h2 style={s.brandName}>CampusBazaar</h2>
              <p style={s.brandTagline}>Student Marketplace</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={s.invoiceLabel}>INVOICE</p>
              <p style={s.invoiceId}>#{cashfreeOrderId}</p>
              <p style={s.invoiceDate}>{invoiceDate}</p>
            </div>
          </div>

          <div style={s.divider} />

          <div style={s.billRow}>
            <div style={s.billBlock}>
              <p style={s.sectionLabel}>BILL TO</p>
              <p style={s.billName}>{order.buyer_name}</p>
              <p style={s.billDetail}>📞 {order.buyer_phone}</p>
              <p style={s.billDetail}>📍 {order.delivery_address}</p>
            </div>
            <div style={s.billBlock}>
              <p style={s.sectionLabel}>PAYMENT</p>
              <p style={s.billName}>Cashfree</p>
              <p style={s.billDetail}>
                Status: <span style={s.paidBadge}>✓ PAID</span>
              </p>
              <p style={s.billDetail}>Method: UPI / Card</p>
            </div>
          </div>

          <div style={s.divider} />

          <table style={s.table}>
            <thead>
              <tr style={{ backgroundColor: "#f9fafb" }}>
                <th style={{ ...s.th, textAlign: "left", width: 32 }}>#</th>
                <th style={{ ...s.th, textAlign: "left" }}>Item</th>
                <th style={s.th}>Qty</th>
                <th style={s.th}>Unit Price</th>
                <th style={{ ...s.th, textAlign: "right" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ ...s.td, textAlign: "center", color: "#aaa", fontStyle: "italic" }}>
                    No items found
                  </td>
                </tr>
              ) : (
                items.map((item, i) => (
                  <tr key={item.id} style={{ backgroundColor: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                    <td style={{ ...s.td, color: "#aaa" }}>{i + 1}</td>
                    <td style={s.td}>
                      <span style={{ fontWeight: 500 }}>{item.products?.name || "—"}</span>
                      {item.products?.category && (
                        <span style={{ fontSize: 11, color: "#aaa", marginLeft: 6 }}>
                          {item.products.category}
                        </span>
                      )}
                    </td>
                    <td style={{ ...s.td, textAlign: "center" }}>{item.quantity}</td>
                    <td style={{ ...s.td, textAlign: "center" }}>₹{item.price_at_purchase}</td>
                    <td style={{ ...s.td, textAlign: "right", fontWeight: 600 }}>
                      ₹{item.price_at_purchase * item.quantity}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div style={s.totalsBox}>
            <div style={s.totalRow}>
              <span style={{ color: "#999" }}>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>
            <div style={s.totalRow}>
              <span style={{ color: "#999" }}>Delivery</span>
              <span style={{ color: "#16a34a", fontWeight: 600 }}>FREE</span>
            </div>
            <div style={s.divider} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 17, fontWeight: 700, color: "#1a1a1a", marginTop: 12 }}>
              <span>Total Paid</span>
              <span style={{ color: "#6b3fa0" }}>₹{order.total_amount}</span>
            </div>
          </div>

          <div style={{ textAlign: "center", marginTop: 32, color: "#bbb", fontSize: 13 }}>
            <p>Thank you for shopping with CampusBazaar! 🛍️</p>
            <p style={{ fontSize: 11, marginTop: 4 }}>Computer-generated invoice. No signature required.</p>
          </div>
        </div>

        <div className="no-print" style={s.actions}>
          <button style={s.printBtn} onClick={() => window.print()}>🖨️ Save as PDF / Print</button>
          <button style={s.primaryBtn} onClick={() => navigate("/buyer/orders")}>📦 My Orders</button>
          <button style={s.secondaryBtn} onClick={() => navigate("/")}>🛍️ Continue Shopping</button>
        </div>

      </div>
    </>
  );
}

const s = {
  page: { minHeight: "100vh", backgroundColor: "#f3f4f6", display: "flex", flexDirection: "column", alignItems: "center", padding: "32px 16px 64px", fontFamily: "'Segoe UI', sans-serif" },
  center: { minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI', sans-serif" },
  spinner: { width: 48, height: 48, border: "4px solid #e5e7eb", borderTop: "4px solid #6b3fa0", borderRadius: "50%", animation: "spin 0.8s linear infinite", marginBottom: 16 },
  banner: { textAlign: "center", marginBottom: 32 },
  checkCircle: { width: 72, height: 72, borderRadius: "50%", backgroundColor: "#22c55e", color: "#fff", fontSize: 36, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" },
  bannerTitle: { fontSize: 28, fontWeight: 700, color: "#1a1a1a", margin: 0 },
  bannerSub: { color: "#555", marginTop: 8 },
  invoice: { backgroundColor: "#fff", borderRadius: 16, padding: "40px", width: "100%", maxWidth: 700, boxShadow: "0 4px 24px rgba(0,0,0,0.08)" },
  invoiceHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  brandName: { fontSize: 22, fontWeight: 800, color: "#6b3fa0", margin: 0 },
  brandTagline: { fontSize: 12, color: "#aaa", marginTop: 4 },
  invoiceLabel: { fontSize: 11, fontWeight: 700, color: "#aaa", letterSpacing: 2, margin: 0 },
  invoiceId: { fontSize: 13, fontWeight: 600, color: "#333", margin: "4px 0 0" },
  invoiceDate: { fontSize: 12, color: "#aaa", margin: "2px 0 0" },
  divider: { borderTop: "1px solid #f0f0f0", margin: "20px 0" },
  billRow: { display: "flex", gap: 32 },
  billBlock: { flex: 1 },
  sectionLabel: { fontSize: 10, fontWeight: 700, color: "#aaa", letterSpacing: 2, margin: "0 0 8px" },
  billName: { fontSize: 15, fontWeight: 600, color: "#1a1a1a", margin: "0 0 4px" },
  billDetail: { fontSize: 13, color: "#666", margin: "3px 0" },
  paidBadge: { backgroundColor: "#dcfce7", color: "#16a34a", padding: "2px 8px", borderRadius: 99, fontSize: 12, fontWeight: 600 },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { padding: "10px 12px", fontSize: 11, fontWeight: 700, color: "#999", letterSpacing: 1, textAlign: "center" },
  td: { padding: "12px", fontSize: 14, color: "#333", borderBottom: "1px solid #f5f5f5" },
  totalsBox: { marginTop: 20, backgroundColor: "#f9fafb", borderRadius: 10, padding: "16px 20px" },
  totalRow: { display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 8 },
  actions: { display: "flex", gap: 12, marginTop: 24, flexWrap: "wrap", justifyContent: "center" },
  printBtn: { backgroundColor: "#1e293b", color: "#fff", border: "none", borderRadius: 10, padding: "13px 22px", fontSize: 14, fontWeight: 600, cursor: "pointer" },
  primaryBtn: { backgroundColor: "#6b3fa0", color: "#fff", border: "none", borderRadius: 10, padding: "13px 22px", fontSize: 14, fontWeight: 600, cursor: "pointer" },
  secondaryBtn: { backgroundColor: "#fff", color: "#333", border: "1.5px solid #e5e7eb", borderRadius: 10, padding: "13px 22px", fontSize: 14, fontWeight: 600, cursor: "pointer" },
  errorCard: { backgroundColor: "#fff", borderRadius: 16, padding: "48px 40px", textAlign: "center", boxShadow: "0 4px 24px rgba(0,0,0,0.1)", maxWidth: 400 },
};

export default PaymentSuccess;