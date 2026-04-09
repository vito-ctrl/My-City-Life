import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FiMapPin, FiCalendar, FiClock, FiArrowLeft, 
  FiInfo, FiCheckCircle, FiUser, FiZap, FiShield 
} from 'react-icons/fi';

const ActivitiesDeatels = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        // Assuming 'activities' type based on your data structure
        const res = await fetch(`http://127.0.0.1:8000/api/activities/${id}`);
        const json = await res.json();
        setItem(json.data);
      } catch (error) {
        console.error("Error fetching details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="text-orange-500 font-black animate-pulse tracking-widest uppercase text-xs">Syncing Data...</div>
    </div>
  );

  if (!item) return <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center uppercase font-black">Record Not Found</div>;

  // Formatting helpers
  const formatDate = (dateString) => {
    if (!dateString) return "TBA";
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', day: 'numeric', year: 'numeric' 
    });
  };

  // Handle Laravel Storage Path for User Image
  const getUserImage = (path) => {
    if (!path) return null;
    return path.startsWith('http') ? path : `http://127.0.0.1:8000/storage/${path}`;
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-orange-500/30">
      {/* Hero Header */}
      <div className="relative h-[60vh] w-full overflow-hidden">
        <img 
          src={item.image || "https://picsum.photos/id/22/1200/800"} 
          className="w-full h-full object-cover grayscale-[20%] hover:grayscale-0 transition-all duration-700" 
          alt={item.title} 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent" />
        
        <div className="absolute top-8 left-8 z-20">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-3 bg-black/40 backdrop-blur-md border border-white/10 px-6 py-3 rounded-2xl hover:bg-orange-500 transition-all group"
          >
            <FiArrowLeft className="group-hover:-translate-x-1 transition-transform"/> 
            <span className="text-[10px] font-black uppercase tracking-[2px]">Back</span>
          </button>
        </div>

        <div className="absolute bottom-12 left-8 md:left-16 z-20 max-w-5xl">
          <div className="flex items-center gap-3 mb-6">
            <span className="bg-orange-500 text-white px-4 py-1 rounded-lg text-[10px] font-black tracking-[3px] uppercase shadow-[0_0_20px_rgba(249,115,22,0.4)]">
              {item.category}
            </span>
          </div>
          <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter uppercase leading-[0.8] mb-6">
            {item.title}
          </h1>
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2 text-white/50 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
              <FiMapPin className="text-orange-500" />
              <span className="text-xs font-bold uppercase tracking-wider">{item.location}</span>
            </div>
            {item.duration && (
              <div className="flex items-center gap-2 text-white/50 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                <FiClock className="text-orange-500" />
                <span className="text-xs font-bold uppercase tracking-wider">{item.duration}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-8 md:px-16 py-20 grid grid-cols-1 lg:grid-cols-3 gap-20">
        
        <div className="lg:col-span-2 space-y-16">
          <section>
            <h3 className="text-[11px] font-black text-orange-500 tracking-[4px] uppercase mb-8 flex items-center gap-2">
              <FiInfo /> Description
            </h3>
            <p className="text-white/40 text-2xl leading-relaxed font-light italic">
              {item.description}
            </p>
          </section>

          {/* Requirements - Only show if not null */}
          {item.requirements && (
            <section className="bg-white/[0.02] border border-white/5 rounded-[40px] p-10">
              <h3 className="text-sm font-black uppercase tracking-[3px] mb-6 flex items-center gap-3 text-orange-500">
                  <FiCheckCircle /> Essential Info
              </h3>
              <p className="text-white/60 text-lg border-l border-orange-500/30 pl-6">
                {item.requirements}
              </p>
            </section>
          )}

          {/* Marshall Hogan's Profile */}
          <section className="flex items-center justify-between p-8 bg-white/5 rounded-[32px] border border-white/5">
            <div className="flex items-center gap-6">
              <div className="relative">
                {item.user?.image ? (
                  <img 
                    src={getUserImage(item.user.image)} 
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-orange-500/20" 
                    alt={item.user.name} 
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-orange-500 flex items-center justify-center text-3xl font-black italic">
                    {item.user?.name.charAt(0)}
                  </div>
                )}
                <div className="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 rounded-full border-4 border-[#0a0a0a] flex items-center justify-center">
                   <FiShield size={10} className="text-white" />
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black text-white/20 uppercase tracking-[3px]">Verified Host</p>
                <h4 className="text-2xl font-black uppercase italic tracking-tighter">{item.user?.name}</h4>
                <div className="flex items-center gap-4 mt-1">
                    <span className="text-[10px] font-bold text-orange-500 uppercase">{item.user?.city}</span>
                    <span className="w-1 h-1 bg-white/20 rounded-full" />
                    <span className="text-[10px] font-bold text-white/40 uppercase">{item.user?.age} Years Old</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-[#141113] border border-white/10 rounded-[48px] p-10">
            <div className="mb-12">
              <span className="text-white/20 text-[10px] font-black tracking-[4px] uppercase block mb-3 text-center">Admission</span>
              <div className="text-6xl font-black italic text-white tracking-tighter text-center">
                {item.is_free === 1 || item.price === 0 ? (
                  <span className="text-green-500 uppercase drop-shadow-[0_0_15px_rgba(34,197,94,0.3)]">Free</span>
                ) : (
                  <span className="flex items-baseline justify-center">
                    <span className="text-2xl mr-2 text-orange-500">MAD</span>{item.price}
                  </span>
                )}
              </div>
            </div>

            <div className="bg-white/5 border border-white/5 p-6 rounded-[32px] mb-8 space-y-6">
                <div>
                    <p className="text-[9px] font-black text-white/20 uppercase tracking-[2px] mb-2 flex items-center gap-2">
                        <FiCalendar className="text-orange-500"/> Schedule
                    </p>
                    <div className="flex justify-between items-center text-sm">
                        <span className="font-bold">{formatDate(item.start_date)}</span>
                        <span className="text-white/20">to</span>
                        <span className="font-bold">{formatDate(item.end_date)}</span>
                    </div>
                </div>
            </div>

            <button className="w-full bg-white text-black py-6 rounded-[24px] font-black uppercase text-xs tracking-[4px] hover:bg-orange-500 hover:text-white transition-all shadow-xl active:scale-95">
              Confirm Booking
            </button>
            
            <p className="text-[9px] text-center text-white/20 font-bold uppercase tracking-[2px] mt-8 italic">
              ID: {item.id} • Ref: {item.user_id}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivitiesDeatels;