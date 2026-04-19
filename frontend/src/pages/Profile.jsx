import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FiMapPin, FiMail, FiUser, FiHeart, FiArrowLeft, 
  FiBriefcase, FiCoffee, FiTrendingUp, FiActivity, 
  FiDollarSign, FiMessageSquare, FiThumbsUp, FiCheckCircle, FiClock, FiXCircle
} from 'react-icons/fi';

import { GeneralStatistics } from '../services/statistic/general';
import { ActivitieStatistics } from '../services/statistic/activities';
import MatchNotification from './Match/MatchNotification';

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [stats, setStats] = useState({ general: null, activity: null });
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch Profile Info
        const res = await fetch(`http://127.0.0.1:8000/api/profile`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const profileData = await res.json();
        setUserData(profileData.user);

        // 2. Fetch General & Activity Statistics in parallel
        const [genStats, actStats] = await Promise.all([
          GeneralStatistics(),
          ActivitieStatistics(profileData.user.id)
        ]);

        setStats({
          general: genStats,
          activity: actStats
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  // console.log(userData);
  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="text-orange-500 font-black animate-pulse tracking-[4px] uppercase text-xs">Loading Intelligence...</div>
    </div>
  );

  if (!userData) return <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center uppercase font-black">Profile Not Found</div>;

  const isOrganizer = userData.role?.toLowerCase() === 'organizer';
  const profileImage = userData.image 
    ? `http://127.0.0.1:8000/storage/${userData.image}` 
    : `https://ui-avatars.com/api/?name=${userData.name}&background=f97316&color=fff`;

  const interests = userData.profile?.interests ? JSON.parse(userData.profile.interests) : [];
  const businesses = userData.businesses || [];

  // Destructure statistics for cleaner access
  const gen = stats.general || {};
  const act = stats.activity || {};

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-orange-500/30 pb-20">
      
      {/* Dynamic Background Banner */}
      <div className="h-72 bg-gradient-to-br from-orange-600/20 via-[#121212] to-[#0a0a0a] border-b border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-orange-500 via-transparent to-transparent"></div>
        <button onClick={() => navigate(-1)} className="absolute top-8 left-8 z-10 flex items-center gap-2 bg-black/40 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl hover:bg-orange-500 transition-all group">
          <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest">Return</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-8">
        
        {/* Profile Identity Card */}
        <div className="relative -mt-36 flex flex-col md:flex-row items-end gap-10 mb-16">
          <div className="relative">
            <img src={userData.image} alt={userData.name} className="w-56 h-56 object-cover rounded-[48px] border-8 border-[#0a0a0a] shadow-2xl" />
            <div className="absolute -bottom-2 -right-2 bg-orange-500 p-3 rounded-2xl shadow-xl">
               <FiActivity className="text-white" size={24} />
            </div>
          </div>
          
          <div className="flex-1 pb-6">
            <div className="flex items-center gap-3 mb-4">
              <span className={`px-4 py-1.5 rounded-lg text-[10px] font-black tracking-[2px] uppercase ${isOrganizer ? 'bg-blue-600' : 'bg-orange-600'}`}>
                {userData.role} Account
              </span>
            </div>
            <h1 className="text-7xl font-black italic tracking-tighter uppercase leading-[0.85] mb-6">
              {userData.name}
            </h1>
            <div className="flex flex-wrap gap-6 text-white/50">
              <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest"><FiMapPin className="text-orange-500"/> {userData.city}</span>
              <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest"><FiUser className="text-orange-500"/> {userData.age} Years</span>
              <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest"><FiMail className="text-orange-500"/> {userData.email}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: GLOBAL OVERVIEW */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* General Counts */}
            <div className="bg-white/[0.02] border border-white/5 rounded-[40px] p-8 backdrop-blur-sm">
              <h3 className="text-[10px] font-black text-white/30 tracking-[4px] uppercase mb-8 flex items-center gap-2 italic">
                <FiTrendingUp className="text-orange-500" /> Platform Impact
              </h3>
              
              <div className="grid grid-cols-1 gap-6">
                <div className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/5">
                  <div>
                    <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Total Activities</p>
                    <p className="text-3xl font-black">{gen.activities?.total || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500">
                    <FiActivity size={24} />
                  </div>
                </div>

                <div className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/5">
                  <div>
                    <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Lifetime Revenue</p>
                    <p className="text-3xl font-black">{gen.revenue?.total_paid_mad || '0.00'} <span className="text-xs text-white/40">MAD</span></p>
                  </div>
                  <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-500">
                    <FiDollarSign size={24} />
                  </div>
                </div>
              </div>
            </div>

            {/* Engagement Snapshot */}
            <div className="bg-gradient-to-br from-orange-500/10 to-transparent border border-orange-500/10 rounded-[40px] p-8">
               <h3 className="text-[10px] font-black text-orange-500 tracking-[4px] uppercase mb-6 italic">Social Engagement</h3>
               <div className="flex gap-8">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-white/40 mb-1">
                      <FiThumbsUp size={12} /> <span className="text-[10px] font-bold uppercase">Likes</span>
                    </div>
                    <p className="text-2xl font-black">{gen.activities?.likes || 0}</p>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-white/40 mb-1">
                      <FiMessageSquare size={12} /> <span className="text-[10px] font-bold uppercase">Comments</span>
                    </div>
                    <p className="text-2xl font-black">{gen.activities?.comments || 0}</p>
                  </div>
               </div>
            </div>
          </div>

          {/* RIGHT COLUMN: DETAILED STATS */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Booking Performance Grid */}
            <div className="bg-white/[0.02] border border-white/5 rounded-[40px] p-10">
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-[11px] font-black text-white tracking-[4px] uppercase flex items-center gap-2">
                  <FiClock className="text-blue-500" /> Booking Analysis
                </h3>
                <span className="text-[24px] font-black italic">{gen.bookings?.total || 0} <span className="text-[10px] not-italic text-white/30 tracking-[2px]">TOTAL</span></span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-green-500/5 border border-green-500/10 rounded-3xl group hover:bg-green-500/10 transition-all">
                  <FiCheckCircle className="text-green-500 mb-4" size={20} />
                  <p className="text-[9px] font-black text-green-500/60 uppercase tracking-widest">Confirmed</p>
                  <p className="text-3xl font-black">{gen.bookings?.confirmed || 0}</p>
                </div>
                <div className="p-6 bg-orange-500/5 border border-orange-500/10 rounded-3xl group hover:bg-orange-500/10 transition-all">
                  <FiClock className="text-orange-500 mb-4" size={20} />
                  <p className="text-[9px] font-black text-orange-500/60 uppercase tracking-widest">Pending</p>
                  <p className="text-3xl font-black">{gen.bookings?.pending || 0}</p>
                </div>
                <div className="p-6 bg-red-500/5 border border-red-500/10 rounded-3xl group hover:bg-red-500/10 transition-all">
                  <FiXCircle className="text-red-500 mb-4" size={20} />
                  <p className="text-[9px] font-black text-red-500/60 uppercase tracking-widest">Cancelled</p>
                  <p className="text-3xl font-black">{gen.bookings?.cancelled || 0}</p>
                </div>
              </div>
            </div>

            {/* Featured Activity Section (from activities data) */}
            {act.activity && (
              <div className="group bg-white/5 border border-white/10 rounded-[40px] p-10 hover:border-orange-500/30 transition-all">
                <div className="flex flex-col md:flex-row gap-10">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-3 py-1 bg-orange-500 text-[8px] font-black uppercase rounded tracking-widest">Featured Activity</span>
                    </div>
                    <h4 className="text-4xl font-black italic uppercase tracking-tighter mb-4 group-hover:text-orange-500 transition-colors">
                      {act.activity.title}
                    </h4>
                    <div className="flex gap-6 mb-8">
                      <div className="text-sm font-bold uppercase tracking-widest">
                        <span className="text-white/30 block text-[9px]">Price</span>
                        {act.activity.is_free ? 'Free' : `${act.activity.price} MAD`}
                      </div>
                      <div className="text-sm font-bold uppercase tracking-widest border-l border-white/10 pl-6">
                        <span className="text-white/30 block text-[9px]">Total Guests</span>
                        {act.revenue?.total_guests || 0}
                      </div>
                    </div>
                  </div>
                  
                  <div className="w-full md:w-64 space-y-4">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                      <div className="flex justify-between items-center text-[10px] font-black uppercase text-white/40 mb-2">
                        <span>Activity Revenue</span>
                        <FiTrendingUp className="text-green-500" />
                      </div>
                      <p className="text-xl font-black">{act.revenue?.total_paid_mad || '0.00'} MAD</p>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-1 p-4 bg-white/5 rounded-2xl border border-white/5 text-center">
                        <FiThumbsUp className="mx-auto mb-1 text-orange-500" size={14}/>
                        <p className="text-xs font-black">{act.engagement?.likes || 0}</p>
                      </div>
                      <div className="flex-1 p-4 bg-white/5 rounded-2xl border border-white/5 text-center">
                        <FiMessageSquare className="mx-auto mb-1 text-orange-500" size={14}/>
                        <p className="text-xs font-black">{act.engagement?.comments || 0}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Businesses List */}
            {isOrganizer && businesses.length > 0 && (
              <section>
                <h3 className="text-[11px] font-black text-blue-500 tracking-[4px] uppercase mb-6 flex items-center gap-2">
                  <FiBriefcase /> Managed Entities
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {businesses.map((biz) => (
                    <div key={biz.id} className="flex items-center gap-4 p-5 bg-white/[0.03] border border-white/5 rounded-3xl hover:bg-white/10 transition-all">
                      <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-500">
                        <FiCoffee size={20} />
                      </div>
                      <div>
                        <h5 className="font-black uppercase text-sm tracking-tight">{biz.name}</h5>
                        <p className="text-[9px] text-white/40 uppercase font-bold tracking-widest">{biz.location}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

          </div>
        </div>
      </div>
      <MatchNotification currentUserId={userData.id}/>
    </div>
  );
};

export default Profile;