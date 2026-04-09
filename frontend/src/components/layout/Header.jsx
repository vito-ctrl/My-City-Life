import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { FiUser, FiLogOut, FiLayout, FiPlusSquare, FiCompass, FiHeart } from 'react-icons/fi';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    // Fetch user info to determine role
    // Alternatively, you can decode the JWT token if you have a library like jwt-decode
    const fetchUser = async () => {
      if (!token) return;
      try {
        const res = await fetch('http://127.0.0.1:8000/api/statistics/general', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setUser(data.user);
      } catch (err) {
        console.error("Auth check failed", err);
      }
    };
    fetchUser();
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  // Define navigation based on role
  const NavLinks = () => {
    if (!user) {
      return (
        <Link to="/activities" className="text-sm font-bold tracking-widest uppercase hover:text-orange-500 transition-colors">
          Explore
        </Link>
      );
    }

    if (user.role === 'organizer') {
      return (
        <>
          <Link to="/dashboard" className={`flex items-center gap-2 text-[11px] font-black uppercase tracking-widest ${isActive('/dashboard') ? 'text-orange-500' : 'text-white/60'}`}>
            <FiLayout /> Stats
          </Link>
          <Link to="/my-businesses" className={`flex items-center gap-2 text-[11px] font-black uppercase tracking-widest ${isActive('/my-businesses') ? 'text-orange-500' : 'text-white/60'}`}>
            <FiPlusSquare /> My Businesses
          </Link>
        </>
      );
    }

    // Default for 'user' role
    return (
      <>
        <Link to="/home" className={`flex items-center gap-2 text-[11px] font-black uppercase tracking-widest ${isActive('/home') ? 'text-orange-500' : 'text-white/60'}`}>
          <FiCompass /> Discover
        </Link>
        <Link to="/my-bookings" className={`flex items-center gap-2 text-[11px] font-black uppercase tracking-widest ${isActive('/my-bookings') ? 'text-orange-500' : 'text-white/60'}`}>
          <FiHeart /> Bookings
        </Link>
      </>
    );
  };

  return (
    <nav className="sticky top-0 z-[100] w-full px-6 py-4 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
            <svg width="18" height="18" viewBox="0 0 40 40" fill="none"><path d="M20 12L26 20L20 28L14 20L20 12Z" fill="white"/></svg>
          </div>
          <span className="text-lg font-black tracking-tighter text-white uppercase italic">
            MYCITY<span className="text-orange-500">LIFE</span>
          </span>
        </Link>

        {/* Dynamic Nav Links */}
        <div className="hidden md:flex items-center gap-10">
          <NavLinks />
        </div>

        {/* User Actions */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3 pl-6 border-l border-white/10">
              <div className="text-right hidden sm:block">
                <p className="text-[10px] font-black text-white uppercase tracking-tighter leading-none">{user.name}</p>
                <p className="text-[9px] font-bold text-orange-500 uppercase tracking-widest">{user.role}</p>
              </div>
              <button 
                onClick={handleLogout}
                className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center hover:bg-red-500/10 hover:text-red-500 transition-all"
                title="Logout"
              >
                <FiLogOut size={18} />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => navigate('/login')}
              className="bg-white text-black px-6 py-2 rounded-full text-[11px] font-black uppercase tracking-widest hover:bg-orange-500 hover:text-white transition-all"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Header;