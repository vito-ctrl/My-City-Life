import React, { useEffect, useState } from 'react';
import { 
  FiActivity, FiBriefcase, FiTrendingUp, FiPlus, FiSettings, 
  FiCalendar, FiMessageCircle, FiHeart, FiDollarSign 
} from 'react-icons/fi';

const Dashboard = () => {
  const [genData, setGenData] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchGeneralData = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/api/statistics/general', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        setGenData(data);
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGeneralData();
  }, [token]);

  if (loading) return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">Loading...</div>;

  const isOrganizer = genData?.user?.role === 'Organizer';

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 md:p-12">
      {/* Header Section */}
      <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter italic">
            WELCOME BACK, <span className="text-orange-500 uppercase">{genData?.user?.name}</span>
          </h1>
          <p className="text-white/40 mt-2 font-medium">Here is what's happening with your {isOrganizer ? 'Business' : 'Activities'}.</p>
        </div>
        
        {/* CRUD Quick Actions */}
        <div className="flex gap-4">
          <button className="flex items-center gap-2 bg-white/5 border border-white/10 px-6 py-3 rounded-2xl hover:bg-white/10 transition-all">
            <FiPlus className="text-orange-500" />
            <span className="text-sm font-bold uppercase tracking-wider">New {isOrganizer ? 'Business' : 'Activity'}</span>
          </button>
          <button className="flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-2xl hover:shadow-[0_0_20px_rgba(249,115,22,0.4)] transition-all">
            <FiSettings />
            <span className="text-sm font-bold uppercase tracking-wider">Manage</span>
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard 
          icon={<FiActivity />} 
          label="Total Activities" 
          value={genData?.activities?.total} 
          subValue={`${genData?.activities?.likes} Likes`} 
        />
        <StatCard 
          icon={<FiCalendar />} 
          label="Confirmed Bookings" 
          value={genData?.bookings?.confirmed} 
          subValue={`${genData?.bookings?.pending} Pending`} 
          color="text-green-500"
        />
        <StatCard 
          icon={<FiDollarSign />} 
          label="Total Revenue" 
          value={`${genData?.revenue?.total_paid_mad} MAD`} 
          subValue="Paid via Stripe"
          color="text-orange-500"
        />
        <StatCard 
          icon={<FiHeart />} 
          label="Engagement" 
          value={genData?.activities?.comments + genData?.businesses?.comments} 
          subValue="Total Comments" 
        />
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Management Panel */}
        <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-[32px] p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold italic">Active Listings</h3>
            <button className="text-orange-500 text-xs font-black uppercase tracking-widest">View All</button>
          </div>
          
          <div className="space-y-4">
            {/* Placeholder for mapping through activities/businesses */}
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/20 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl" />
                  <div>
                    <h4 className="font-bold">Sample Entry {i}</h4>
                    <p className="text-xs text-white/40">Last updated 2 days ago</p>
                  </div>
                </div>
                <div className="flex gap-2">
                   <button className="p-2 hover:text-orange-500 transition-colors"><FiSettings size={18}/></button>
                   <button className="p-2 hover:text-red-500 transition-colors"><FiPlus className="rotate-45" size={18}/></button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar: Role-specific Info */}
        <div className="space-y-8">
          <div className="bg-gradient-to-br from-orange-600 to-red-600 rounded-[32px] p-8 text-white">
            <h3 className="text-xl font-black uppercase mb-4">Pro Tip</h3>
            <p className="text-sm opacity-90 leading-relaxed">
              {isOrganizer 
                ? "Organizers with verified business profiles see 40% more engagement on their listings." 
                : "Promote your activities on social media to increase your confirmed bookings!"}
            </p>
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-[32px] p-8">
            <h3 className="text-xl font-bold mb-6">Recent Engagement</h3>
            <div className="space-y-6">
               <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/10" />
                  <div>
                    <p className="text-sm font-medium">New comment on <span className="text-orange-500">Walking Tour</span></p>
                    <p className="text-xs text-white/40">5 minutes ago</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, subValue, color = "text-white" }) => (
  <div className="bg-white/5 border border-white/10 p-8 rounded-[32px] hover:border-white/20 transition-all group">
    <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${color}`}>
      {icon}
    </div>
    <p className="text-[11px] font-bold tracking-[2px] text-white/40 uppercase mb-2">{label}</p>
    <h2 className="text-3xl font-black mb-1">{value}</h2>
    <p className="text-xs text-white/20 font-medium">{subValue}</p>
  </div>
);

export default Dashboard;