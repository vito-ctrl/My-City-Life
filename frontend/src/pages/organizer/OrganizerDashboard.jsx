import React from 'react';
import { 
  LayoutDashboard, 
  PlusCircle, 
  Building2, 
  Calendar, 
  BarChart3, 
  Settings,
  MapPin,
  Users
} from 'lucide-react'; // Assuming you use lucide-react for icons

const OrganizerDashboard = () => {
  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white font-['Inter'] flex">
      
      {/* Sidebar */}
      <aside className="w-64 bg-[#1f1f1f] border-r border-white/10 hidden md:flex flex-col">
        <div className="p-8">
          <h1 className="text-xl font-bold bg-gradient-to-r from-[#14b8a6] to-[#f97316] bg-clip-text text-transparent">
            EVENTO
          </h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          <a href="#" className="flex items-center gap-3 p-3 rounded-lg bg-white/5 text-[#14b8a6] border border-white/10">
            <LayoutDashboard size={20} />
            <span className="font-medium text-sm">Dashboard</span>
          </a>
          <a href="#" className="flex items-center gap-3 p-3 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition-all">
            <Calendar size={20} />
            <span className="font-medium text-sm">My Activities</span>
          </a>
          <a href="#" className="flex items-center gap-3 p-3 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition-all">
            <Building2 size={20} />
            <span className="font-medium text-sm">Business Profile</span>
          </a>
        </nav>

        <div className="p-4 border-t border-white/10">
          <button className="flex items-center gap-3 p-3 text-gray-400 hover:text-white w-full">
            <Settings size={20} />
            <span className="text-sm">Settings</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-extrabold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Welcome back, Organizer
            </h2>
            <p className="text-gray-400 text-sm mt-1">Here is what's happening with your activities today.</p>
          </div>
          
          <div className="flex gap-4">
            <button className="px-5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm font-medium hover:border-[#14b8a6] transition-all">
              🏢 Complete Profile
            </button>
            <button className="px-5 py-2.5 rounded-xl bg-gradient-to-br from-[#14b8a6] to-[#0d9488] text-sm font-semibold flex items-center gap-2 hover:scale-105 transition-all shadow-lg shadow-teal-500/20">
              <PlusCircle size={18} />
              Create Activity
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[
            { label: 'Total Views', value: '1,284', icon: <BarChart3 className="text-[#14b8a6]" /> },
            { label: 'Bookings', value: '42', icon: <Users className="text-[#f97316]" /> },
            { label: 'Active Activities', value: '3', icon: <Calendar className="text-teal-400" /> },
          ].map((stat, i) => (
            <div key={i} className="p-6 bg-gradient-to-br from-[#2a2a2a] to-[#1f1f1f] rounded-2xl border border-white/10">
              <div className="flex justify-between items-center mb-4">
                <div className="p-2 bg-white/5 rounded-lg">{stat.icon}</div>
                <span className="text-xs text-green-400 font-bold">+12%</span>
              </div>
              <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold">{stat.label}</p>
              <p className="text-2xl font-bold mt-1">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Recent Activities Section */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">Recent Activities</h3>
            <button className="text-sm text-[#14b8a6] hover:underline">View all</button>
          </div>

          <div className="space-y-4">
            {/* Example Activity Row */}
            {[1, 2].map((item) => (
              <div key={item} className="group flex items-center gap-6 p-4 bg-white/3 border border-white/5 rounded-2xl hover:border-[#14b8a6]/50 transition-all cursor-pointer">
                <div className="w-20 h-20 rounded-xl overflow-hidden">
                  <img 
                    src={`https://via.placeholder.com/150`} 
                    alt="activity" 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-lg">Late Night Jazz Session</h4>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                    <span className="flex items-center gap-1"><MapPin size={14} className="text-[#f97316]"/> Casablanca</span>
                    <span>•</span>
                    <span className="text-[#14b8a6] font-semibold">250 MAD</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 bg-green-500/10 text-green-400 text-xs rounded-full border border-green-500/20">
                    Active
                  </span>
                  <p className="text-xs text-gray-500 mt-2">Added 2 days ago</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default OrganizerDashboard;