import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FiMapPin, FiMail, FiCalendar, FiUser, 
  FiHeart, FiEdit2, FiArrowLeft, FiBriefcase, FiCoffee 
} from 'react-icons/fi';

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/profile/${id}`,{
            method: 'GET',
            headers: {
                'Authorization' : `Bearer ${token}`,
                'Accept' : 'application/json'
            }
        });
        const data = await res.json();
        setUserData(data.user);
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="text-orange-500 font-black animate-pulse tracking-[4px] uppercase text-xs">Syncing Profile...</div>
    </div>
  );

  if (!userData) return <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center uppercase font-black">Profile Not Found</div>;

  const isOrganizer = userData.role?.toLowerCase() === 'organizer';

  // Image handling
  const profileImage = userData.image 
    ? `http://127.0.0.1:8000/storage/${userData.image}` 
    : `https://ui-avatars.com/api/?name=${userData.name}&background=f97316&color=fff`;

  // Parsing for 'User' specific data
  const interests = userData.profile?.interests 
    ? JSON.parse(userData.profile.interests) 
    : [];

  // Data for 'Organizer' specific businesses
  const businesses = userData.businesses || [];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-orange-500/30">
      
      {/* Banner */}
      <div className="h-56 bg-gradient-to-r from-orange-600/20 via-[#121212] to-[#0a0a0a] border-b border-white/5 relative">
        <button onClick={() => navigate(-1)} className="absolute top-8 left-8 flex items-center gap-2 bg-black/40 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl hover:bg-orange-500 transition-all group">
          <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest">Back</span>
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-8">
        <div className="relative -mt-24 flex flex-col md:flex-row items-end gap-10 mb-16">
          <img src={profileImage} alt={userData.name} className="w-48 h-48 object-cover rounded-[40px] border-8 border-[#0a0a0a] shadow-2xl shadow-orange-500/10" />
          
          <div className="flex-1 pb-4">
            <div className="flex items-center gap-3 mb-3">
              <span className={`px-3 py-1 rounded-md text-[9px] font-black tracking-widest uppercase italic ${isOrganizer ? 'bg-blue-600' : 'bg-orange-500'}`}>
                {userData.role}
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase leading-none mb-4">
              {userData.name}
            </h1>
            <div className="flex flex-wrap gap-6 text-white/40">
              <span className="flex items-center gap-2 text-[11px] font-bold uppercase"><FiMapPin className="text-orange-500"/> {userData.city}</span>
              <span className="flex items-center gap-2 text-[11px] font-bold uppercase"><FiUser className="text-orange-500"/> {userData.age} Years</span>
              <span className="flex items-center gap-2 text-[11px] font-bold uppercase"><FiMail className="text-orange-500"/> {userData.email}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 pb-24">
          
          {/* Sidebar: Common Stats */}
          <div className="space-y-6">
            <div className="bg-white/[0.03] border border-white/5 rounded-[32px] p-8">
              <h3 className="text-[10px] font-black text-orange-500 tracking-[3px] uppercase mb-6 italic">Account Info</h3>
              <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                    <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Joined</p>
                    <p className="font-bold text-sm uppercase">{new Date(userData.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                    <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Status</p>
                    <p className="font-bold text-sm uppercase text-green-500">Verified {userData.role}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2">
            
            {/* CONDITIONAL RENDER: USER INTERESTS */}
            {!isOrganizer && (
              <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h3 className="text-[11px] font-black text-orange-500 tracking-[4px] uppercase mb-8 flex items-center gap-2">
                  <FiHeart /> Personal Interests
                </h3>
                <div className="flex flex-wrap gap-4">
                  {interests.map((interest, idx) => (
                    <div key={idx} className="px-6 py-4 bg-white/5 border border-white/10 rounded-[20px] text-[11px] font-black uppercase tracking-widest hover:border-orange-500 transition-all">
                      {interest}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* CONDITIONAL RENDER: ORGANIZER BUSINESSES */}
            {isOrganizer && (
              <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h3 className="text-[11px] font-black text-blue-500 tracking-[4px] uppercase mb-8 flex items-center gap-2">
                  <FiBriefcase /> Managed Businesses
                </h3>
                <div className="grid gap-6">
                  {businesses.map((biz) => (
                    <div key={biz.id} className="group flex items-center gap-6 p-6 bg-white/5 border border-white/10 rounded-[32px] hover:bg-white/[0.08] transition-all cursor-pointer">
                      <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all">
                        <FiCoffee size={24} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest bg-blue-500/10 px-2 py-0.5 rounded">
                            {biz.type}
                          </span>
                        </div>
                        <h4 className="text-xl font-black italic uppercase tracking-tighter">{biz.name}</h4>
                        <p className="text-white/40 text-xs font-medium flex items-center gap-1 mt-1">
                          <FiMapPin size={12}/> {biz.location}
                        </p>
                      </div>
                      <div className="pr-4 opacity-0 group-hover:opacity-100 transition-opacity">
                         <FiArrowLeft className="rotate-180 text-white/40" />
                      </div>
                    </div>
                  ))}
                  {businesses.length === 0 && <p className="text-white/20 italic">No businesses registered yet.</p>}
                </div>
              </section>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;