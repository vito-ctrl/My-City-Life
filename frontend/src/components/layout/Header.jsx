import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { FiUser, FiLogOut, FiCompass, FiX, FiHeart, FiCalendar, FiList, FiGrid } from 'react-icons/fi';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const token = localStorage.getItem('token');
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false); 
        return;
      }else{
        try {
          const res = await fetch('http://127.0.0.1:8000/api/profile', {
            headers: { 'Authorization': `Bearer ${token}`}
          });
          const data = await res.json();
          setUser(data.user);
        } catch (err) {
          console.error("Auth check failed", err);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchUser();
  }, [token]);

  if (loading) return <div className="h-[72px] bg-[#0a0a0a]" />;

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsSidebarOpen(false);
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  // Primary Navigation (Stays in the Header)
  const NavLinks = () => {
    if (!user) {
      return (
        <Link to="/" className="text-[11px] font-black tracking-widest uppercase hover:text-orange-500 transition-colors text-white/60">
          Explore
        </Link>
      );
    }

    if (user.role === 'Organizer') {
      return (
        <>
          <Link
            to="/organizer/dashboard"
            className={`flex items-center gap-2 text-[11px] font-black uppercase tracking-widest transition-colors ${
              isActive('/organizer/dashboard') ? 'text-orange-500' : 'text-white/60 hover:text-white'
            }`}
          >
            <FiGrid /> Dashboard
          </Link>
          <Link
            to="/organizer/bookings"
            className={`flex items-center gap-2 text-[11px] font-black uppercase tracking-widest transition-colors ${
              isActive('/organizer/bookings') ? 'text-orange-500' : 'text-white/60 hover:text-white'
            }`}
          >
            <FiCalendar /> Bookings
          </Link>
          <Link
            to="/activity/manage"
            className={`flex items-center gap-2 text-[11px] font-black uppercase tracking-widest transition-colors ${
              isActive('/activity/manage') ? 'text-orange-500' : 'text-white/60 hover:text-white'
            }`}
          >
            <FiList /> My Activities
          </Link>
        </>
      );
    }

    return (
      <>
        <Link to='/' className={`flex items-center gap-2 text-[11px] font-black uppercase tracking-widest transition-colors ${isActive('/') ? 'text-orange-500' : 'text-white/60 hover:text-white'}`}>
          <FiCompass /> Explore
        </Link>
        <Link
          to="/activity/manage"
          className={`flex items-center gap-2 text-[11px] font-black uppercase tracking-widest transition-colors ${
            isActive('/activity/manage') ? 'text-orange-500' : 'text-white/60 hover:text-white'
          }`}
        >
          <FiList /> My Activities
        </Link>
      </>
    );
  };

  return (
    <>
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

          {/* Main Navigation - Visible in Header */}
          <div className="hidden md:flex items-center gap-10">
            <NavLinks />
          </div>

          {/* User Trigger - Opens Sidebar */}
          <div className="flex items-center gap-4">
            {user ? (
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="flex items-center gap-3 pl-6 border-l border-white/10 group transition-all"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-[10px] font-black text-white uppercase tracking-tighter leading-none group-hover:text-orange-500 transition-colors">{user.name}</p>
                  <p className="text-[9px] font-bold text-orange-500/60 uppercase tracking-widest">{user.role}</p>
                </div>
                <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center group-hover:border-orange-500/50 group-hover:bg-orange-500/5 transition-all">
                  {user.image === 'http://127.0.0.1:8000/storage' ? (
                    <FiUser className="text-white" size={18} />
                  ): (
                    <img src={user.image} alt="user image" className="rounded h-10 w-10" size={10}/>
                  )}
                </div>
              </button>
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

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Slide-out Sidebar (Profile & Logout only) */}
      <div className={`fixed top-0 right-0 z-[120] h-full w-80 bg-[#0f0f0f] border-l border-white/10 shadow-2xl transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-8 flex flex-col h-full">
          
          <div className="flex justify-between items-center mb-12">
            <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Account Menu</span>
            <button 
              onClick={() => setIsSidebarOpen(false)} 
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-all"
            >
              <FiX size={20} />
            </button>
          </div>

          {/* Identity Card */}
          <div 
            className="relative overflow-hidden rounded-3xl p-6 mb-8 border border-white/10 bg-gradient-to-br from-white/[0.07] to-transparent bg-cover bg-center"
            style={{ backgroundImage: user?.image === 'http://127.0.0.1:8000/storage' ? <FiUser className="absolute -right-4 -bottom-4 text-white/5" size={100} /> : `url(${user?.image})`}}
          >
            {/* Dark Overlay - only visible if there is an image to ensure text readability */}
            {user?.image && <div className="absolute inset-0 bg-black/40 z-0" />}

            <div className="relative z-10">
              <p className="text-white font-black text-xl uppercase italic tracking-tighter leading-none">
                {user?.name}
              </p>
              <p className="text-orange-500 font-bold text-[10px] uppercase tracking-[0.2em] mt-2 inline-block px-2 py-1 bg-orange-500/10 backdrop-blur-md rounded-md">
                {user?.role}
              </p>
            </div>
          </div>

          {/* Action Links */}
          <div className="flex flex-col gap-3">
            <Link 
              to='/profile' 
              onClick={() => setIsSidebarOpen(false)}
              className={`flex items-center justify-between p-4 rounded-2xl transition-all group ${isActive('/profile') ? 'bg-orange-500 text-white' : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'}`}
            >
              <div className="flex items-center gap-4">
                <FiUser size={20} className={isActive('/profile') ? 'text-white' : 'text-orange-500'} />
                <span className="font-bold text-xs uppercase tracking-widest">My Profile</span>
              </div>
            </Link>

            <Link 
              to="/Favorites" 
              onClick={() => setIsSidebarOpen(false)}
              className={`flex items-center justify-between p-4 rounded-2xl transition-all group ${isActive('/Favorites') ? 'bg-orange-500 text-white' : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'}`}
            >
              <div className="flex items-center gap-4">
                <FiHeart size={20} className={isActive('/Favorites') ? 'text-white' : 'text-orange-500'} />
                <span className="font-bold text-xs uppercase tracking-widest">Favorites</span>
              </div>
            </Link>
            
            <button 
              onClick={handleLogout}
              className="flex items-center gap-4 p-4 rounded-2xl text-red-400 hover:bg-red-500/10 transition-all font-bold text-xs uppercase tracking-widest mt-4"
            >
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                <FiLogOut size={20} />
              </div>
              Sign Out
            </button>
          </div>

          <div className="mt-auto text-center">
            <p className="text-[9px] text-white/20 uppercase font-black tracking-[0.4em]">
              MyCityLife Platform
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;