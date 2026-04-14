import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FiMapPin, FiMail, FiCalendar, FiUser, 
  FiHeart, FiEdit2, FiArrowLeft, FiBriefcase, FiCoffee, FiBarChart2, FiActivity 
} from 'react-icons/fi';

import { GeneralStatistics } from '../services/statistic/general';
import { ActivitieStatistics } from '../services/statistic/activities';

const Profile = () => {
  // const { id } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [stats, setStats] = useState({ general: null, activities: null });
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchProfileAndStats = async () => {
      try {
        // 1. Fetch Profile
        const res = await fetch(`http://127.0.0.1:8000/api/profile`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setUserData(data.user);

        const genStats = await GeneralStatistics();
        
        const actStats = await ActivitieStatistics(data.user.id);

        setStats({
          general: genStats,
          activities: actStats
        });

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndStats();
  }, [token]);

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="text-orange-500 font-black animate-pulse tracking-[4px] uppercase text-xs">Syncing Profile...</div>
    </div>
  );

  if (!userData) return <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center uppercase font-black">Profile Not Found</div>;

  const isOrganizer = userData.role?.toLowerCase() === 'organizer';
  const profileImage = userData.image 
    ? `http://127.0.0.1:8000/storage/${userData.image}` 
    : `https://ui-avatars.com/api/?name=${userData.name}&background=f97316&color=fff`;

  const interests = userData.profile?.interests ? JSON.parse(userData.profile.interests) : [];
  const businesses = userData.businesses || [];

  console.log("stats : ", stats);
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-orange-500/30 pb-20">
      
      {/* Banner */}
      <div className="h-64 bg-gradient-to-b from-orange-600/20 via-[#121212] to-[#0a0a0a] border-b border-white/5 relative">
        <button onClick={() => navigate(-1)} className="absolute top-8 left-8 z-10 flex items-center gap-2 bg-black/40 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl hover:bg-orange-500 transition-all group">
          <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest">Back</span>
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-8">
        {/* Header Section */}
        <div className="relative -mt-32 flex flex-col md:flex-row items-end gap-10 mb-16">
          <div className="relative group">
            <img src={profileImage} alt={userData.name} className="w-52 h-52 object-cover rounded-[40px] border-8 border-[#0a0a0a] shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]" />
            <div className="absolute inset-0 rounded-[40px] shadow-[inset_0_0_40px_rgba(0,0,0,0.5)]"></div>
          </div>
          
          <div className="flex-1 pb-4">
            <div className="flex items-center gap-3 mb-4">
              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-[2px] uppercase italic ${isOrganizer ? 'bg-blue-600 shadow-lg shadow-blue-900/20' : 'bg-orange-600 shadow-lg shadow-orange-900/20'}`}>
                {userData.role}
              </span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter uppercase leading-[0.8] mb-6">
              {userData.name.split(' ')[0]}<br/>
              <span className="text-orange-500">{userData.name.split(' ')[1] || ''}</span>
            </h1>
            <div className="flex flex-wrap gap-6 text-white/50 bg-white/5 w-fit p-4 rounded-2xl border border-white/5 backdrop-blur-sm">
              <span className="flex items-center gap-2 text-[11px] font-bold uppercase"><FiMapPin className="text-orange-500"/> {userData.city}</span>
              <span className="flex items-center gap-2 text-[11px] font-bold uppercase"><FiUser className="text-orange-500"/> {userData.age} Yrs</span>
              <span className="flex items-center gap-2 text-[11px] font-bold uppercase"><FiMail className="text-orange-500"/> {userData.email}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Sidebar */}
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-white/5 border border-white/10 p-6 rounded-[32px] text-center">
                  <p className="text-[10px] font-black text-orange-500 uppercase mb-1">Activities</p>
                  <p className="text-3xl font-black italic">{stats.activities?.count || 0}</p>
               </div>
               <div className="bg-white/5 border border-white/10 p-6 rounded-[32px] text-center">
                  <p className="text-[10px] font-black text-blue-500 uppercase mb-1">Points</p>
                  <p className="text-3xl font-black italic">{stats.general?.points || 0}</p>
               </div>
            </div>

            <div className="bg-white/[0.03] border border-white/5 rounded-[40px] p-8">
              <h3 className="text-[10px] font-black text-white/40 tracking-[3px] uppercase mb-8 italic flex items-center gap-2">
                <FiBarChart2 /> Account Meta
              </h3>
              <div className="space-y-4">
                <div className="p-5 bg-black/40 rounded-3xl border border-white/5">
                    <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Member Since</p>
                    <p className="font-bold text-sm uppercase">{new Date(userData.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                </div>
                <div className="p-5 bg-black/40 rounded-3xl border border-white/5">
                    <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Account Status</p>
                    <p className="font-bold text-sm uppercase text-green-500 flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      Verified
                    </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            
            {!isOrganizer && (
              <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex items-center gap-4 mb-8">
                  <h3 className="text-[11px] font-black text-orange-500 tracking-[4px] uppercase flex items-center gap-2">
                    <FiHeart /> Personal Interests
                  </h3>
                  <div className="h-px flex-1 bg-gradient-to-r from-orange-500/50 to-transparent"></div>
                </div>
                <div className="flex flex-wrap gap-3">
                  {interests.map((interest, idx) => (
                    <div key={idx} className="px-6 py-4 bg-[#121212] border border-white/5 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:border-orange-500/50 hover:bg-orange-500/5 transition-all cursor-default">
                      {interest}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {isOrganizer && (
              <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex items-center gap-4 mb-8">
                  <h3 className="text-[11px] font-black text-blue-500 tracking-[4px] uppercase flex items-center gap-2">
                    <FiBriefcase /> Managed Businesses
                  </h3>
                  <div className="h-px flex-1 bg-gradient-to-r from-blue-500/50 to-transparent"></div>
                </div>
                <div className="grid gap-4">
                  {businesses.map((biz) => (
                    <div key={biz.id} className="group flex items-center gap-6 p-5 bg-white/5 border border-white/10 rounded-[32px] hover:bg-white/[0.08] transition-all">
                      <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all">
                        <FiCoffee size={20} />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-black italic uppercase tracking-tighter">{biz.name}</h4>
                        <p className="text-white/40 text-[10px] font-bold uppercase flex items-center gap-1">
                          <FiMapPin size={10} className="text-blue-500"/> {biz.location}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Statistics Visualization Placeholder */}
            <section className="bg-gradient-to-br from-orange-500/10 to-transparent p-8 rounded-[40px] border border-orange-500/10">
               <h3 className="text-[11px] font-black text-orange-500 tracking-[4px] uppercase mb-6 flex items-center gap-2">
                 <FiActivity /> Activity Insights
               </h3>
               <div className="h-32 flex items-end gap-2">
                  {[40, 70, 45, 90, 65, 80, 30].map((h, i) => (
                    <div key={i} style={{height: `${h}%`}} className="flex-1 bg-orange-500/20 rounded-t-lg border-t border-orange-500/30 hover:bg-orange-500/50 transition-all"></div>
                  ))}
               </div>
               <p className="text-[10px] text-white/30 uppercase mt-4 font-bold text-center tracking-widest">Weekly Engagement Activity</p>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;