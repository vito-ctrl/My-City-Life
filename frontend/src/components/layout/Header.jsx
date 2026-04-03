import React from 'react';
import { MapPin, User, LogIn } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Logo Section */}
        <div 
          className="flex items-center gap-2 cursor-pointer group" 
          onClick={() => navigate('/')}
        >
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-all">
            <MapPin size={18} className="text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            MyCity<span className="text-white/50">Life</span>
          </span>
        </div>

        {/* Navigation / Actions */}
        <div className="flex items-center gap-4">
          <Link 
            to="/login" 
            className="text-[0.8125rem] font-medium text-white/60 hover:text-white transition-colors"
          >
            Sign In
          </Link>
          
          <button
            onClick={() => navigate('/register')}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-[0.8125rem] font-semibold text-white transition-all"
          >
            <User size={14} />
            <span>Join Now</span>
          </button>
        </div>

      </div>
    </header>
  );
};

export default Header;