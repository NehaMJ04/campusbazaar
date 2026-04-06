

// import { Link, useNavigate } from 'react-router-dom';
// import { useState, useEffect } from 'react';
// import { supabase } from '../supabaseClient';
// import './Navbar.css';

// function Navbar() {
//   const [searchQuery, setSearchQuery] = useState("");
//   const [user, setUser] = useState(null);
//   const navigate = useNavigate();

//   useEffect(() => {
//     // Get current session on load
//     supabase.auth.getSession().then(({ data: { session } }) => {
//       setUser(session?.user ?? null);
//     });

//     // Listen for login/logout changes
//     const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
//       setUser(session?.user ?? null);
//     });

//     return () => subscription.unsubscribe();
//   }, []);

//   function handleSearch(e) {
//     if (e.key === "Enter" && searchQuery.trim()) {
//       navigate(`/buyer/products?search=${encodeURIComponent(searchQuery.trim())}`);
//     }
//   }

//   return (
//     <nav>
//       <div className="nav-left">
//         <h2>CampusBazaar</h2>
//       </div>

//       <div className="search-container">
//         <span className="search-icon">🔍</span>
//         <input
//           type="text"
//           placeholder="Search products, shops, or categories..."
//           value={searchQuery}
//           onChange={(e) => setSearchQuery(e.target.value)}
//           onKeyDown={handleSearch}
//         />
//       </div>

//       <div className='nav-actions'>
//         <Link to="/buyer/cart">🛒 Cart</Link>
//         <Link to="/buyer/become-seller">
//           <button>Become a Seller</button>
//         </Link>

//         {user ? (
//           <div
//             className="nav-avatar"
//             onClick={() => navigate("/buyer")}
//             title={user.email}
//           >
//             {user.email?.[0]?.toUpperCase()}
//           </div>
//         ) : (
//           <>
//             <Link to="/login">Login</Link>
//             <Link to="/signup">Sign Up</Link>
//           </>
//         )}
//       </div>
//     </nav>
//   );
// }

// export default Navbar;

import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import './Navbar.css';

function Navbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchUserWithRole(session) {
      if (!session?.user) { setUser(null); setRole(null); return; }
      setUser(session.user);
      const { data } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single();
      setRole(data?.role ?? null);
    }

    supabase.auth.getSession().then(({ data: { session } }) => fetchUserWithRole(session));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      fetchUserWithRole(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function getDashboardPath() {
    if (role === 'admin') return '/admin';
    if (role === 'seller') return '/seller';
    return '/buyer';
  }

  function handleSearch(e) {
    if (e.key === "Enter" && searchQuery.trim()) {
      navigate(`/buyer/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  }

  async function handleLogout() {
    setDropdownOpen(false);
    await supabase.auth.signOut();
    navigate('/login');
  }

  return (
    <nav>
      <div className="nav-left">
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <h2>CampusBazaar</h2>
        </Link>
      </div>

      <div className="search-container">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder="Search products, shops, or categories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleSearch}
        />
      </div>

      <div className="nav-actions">
        {/* Cart — hide for admin */}
        {role !== 'admin' && (
          <Link to="/buyer/cart">🛒 Cart</Link>
        )}

        {/* Become a Seller — only for buyers */}
        {role === 'buyer' && (
          <Link to="/buyer/become-seller">
            <button>Become a Seller</button>
          </Link>
        )}

        {user ? (
          <div className="nav-avatar-wrapper" ref={dropdownRef}>
            <div
              className="nav-avatar"
              onClick={() => setDropdownOpen(prev => !prev)}
              title={user.email}
            >
              {user.email?.[0]?.toUpperCase()}
            </div>

            {dropdownOpen && (
              <div className="nav-dropdown">
                {/* Header */}
                <div className="nav-dropdown-header">
                  <span className="nav-dropdown-email">{user.email}</span>
                  <span className={`role-badge role-${role}`}>{role}</span>
                </div>

                <hr className="nav-dropdown-divider" />

                {/* Seller Dashboard */}
                {role === 'seller' && (
                  <button
                    className="nav-dropdown-item"
                    onClick={() => { setDropdownOpen(false); navigate('/seller/dashboard'); }}
                  >
                    <span className="nav-dropdown-icon"></span>
                    Seller Dashboard
                  </button>
                )}

                {/* Buyer Dashboard */}
                {role === 'buyer' && (
                  <button
                    className="nav-dropdown-item"
                    onClick={() => { setDropdownOpen(false); navigate('/buyer'); }}
                  >
                    <span className="nav-dropdown-icon"></span>
                    Dashboard
                  </button>
                )}

                {/* Admin Dashboard */}
                {role === 'admin' && (
                  <button
                    className="nav-dropdown-item"
                    onClick={() => { setDropdownOpen(false); navigate('/admin'); }}
                  >
                    <span className="nav-dropdown-icon"></span>
                    Admin Dashboard
                  </button>
                )}

                {/* My Purchases — seller + buyer */}
                {(role === 'seller' || role === 'buyer') && (
                  <button
                    className="nav-dropdown-item"
                    onClick={() => { setDropdownOpen(false); navigate('/buyer/orders'); }}
                  >
                    <span className="nav-dropdown-icon"></span>
                    My Purchases
                  </button>
                )}

                <hr className="nav-dropdown-divider" />

                <button className="nav-dropdown-item nav-dropdown-logout" onClick={handleLogout}>
                  <span className="nav-dropdown-icon"></span>
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/signup">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;