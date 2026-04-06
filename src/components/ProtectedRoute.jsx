// src/components/ProtectedRoute.jsx
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

function ProtectedRoute({ children, allowedRoles }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setUserData(null);
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("users")
        .select("role, seller_status")
        .eq("id", session.user.id)
        .single();

      setUserData(data);
      setLoading(false);
    }

    fetchUser();
  }, []);

  if (loading) return <p>Loading...</p>;

  // Not logged in at all
  if (!userData) return <Navigate to="/login" />;

  // Logged in but wrong role
  if (!allowedRoles.includes(userData.role)) {
    // Send them to their correct place
    if (userData.role === "admin") return <Navigate to="/admin" />;
    if (userData.role === "seller") return <Navigate to="/seller/dashboard" />;
    return <Navigate to="/marketplace" />;
  }

  return children;
}

export default ProtectedRoute;