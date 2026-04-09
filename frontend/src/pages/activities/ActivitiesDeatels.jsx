import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FiMapPin, FiCalendar, FiClock, FiDollarSign, 
  FiArrowLeft, FiStar, FiInfo, FiCheckCircle 
} from 'react-icons/fi';

const ActivitiesDeatels = () => {
  const { type, id } = useParams(); // type is 'activities' or 'businesses'
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/${type}/${id}`);
        const data = await res.json();
        // Laravel single resource usually returns { data: {...} } or just {...}
        setItem(data.data || data);
      } catch (error) {
        console.error("Error fetching details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [type, id]);

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="text-orange-500 font-black animate-pulse tracking-widest">LOADING EXPERIENCE...</div>
    </div>
  );

  const isActivity = type === 'activities';
  const mainImage = item.image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1200";

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Hero Header */}
      <div className="relative h-[60vh] w-full overflow-hidden">
        <img src={mainImage} className="w-full h-full object-cover" alt="Hero" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/20 to-transparent" />
        
        {/* Navigation Overlays */}
        <div className="absolute top-8 left-8 z-20">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 bg-black/40 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-full hover:bg-orange-500 transition-all"
          >
            <FiArrowLeft /> <span className="text-[10px] font-black uppercase tracking-widest">Go Back</span>
          </button>
        </div>

        <div className="absolute bottom-12 left-8 md:left-16 z-20 max-w-3xl">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-orange-500 px-3 py-1 rounded-md text-[10px] font-black tracking-[2px] uppercase">
              {isActivity ? item.category : item.type}
            </span>
            <div className="flex items-center gap-1 text-yellow-500">
              <FiStar fill="currentColor" size={14} />
              <span className="text-sm font-bold text-white">4.9</span>
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase leading-none mb-4">
            {item.title || item.name}
          </h1>
          <div className="flex items-center gap-6 text-white/60">
            <div className="flex items-center gap-2">
              <FiMapPin className="text-orange-500" />
              <span className="text-sm font-medium">{item.location}</span>
            </div>
            {isActivity && (
              <div className="flex items-center gap-2">
                <FiClock className="text-orange-500" />
                <span className="text-sm font-medium">{item.duration || '2-3 Hours'}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="max-w-7xl mx-auto px-8 md:px-16 py-16 grid grid-cols-1 lg:grid-cols-3 gap-16">
        
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-12">
          <section>
            <h3 className="text-[11px] font-black text-orange-500 tracking-[3px] uppercase mb-6 flex items-center gap-2">
              <FiInfo /> About this {isActivity ? 'Activity' : 'Business'}
            </h3>
            <p className="text-white/50 text-xl leading-relaxed font-light">
              {item.description}
            </p>
          </section>

          {isActivity && item.requirements && (
            <section className="bg-white/5 border border-white/10 rounded-[32px] p-8">
              <h3 className="text-sm font-black uppercase tracking-widest mb-4">Requirements</h3>
              <p className="text-white/40 text-sm leading-relaxed">{item.requirements}</p>
            </section>
          )}

          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 bg-white/5 border border-white/5 rounded-2xl">
              <FiCheckCircle className="text-green-500 mb-4" size={24} />
              <h4 className="font-bold mb-2">Instant Confirmation</h4>
              <p className="text-xs text-white/30">Receive your booking confirmation immediately after payment.</p>
            </div>
            <div className="p-6 bg-white/5 border border-white/5 rounded-2xl">
              <FiCalendar className="text-blue-500 mb-4" size={24} />
              <h4 className="font-bold mb-2">Flexible Scheduling</h4>
              <p className="text-xs text-white/30">Easy cancellation or rescheduling up to 24 hours before.</p>
            </div>
          </section>
        </div>

        {/* Sidebar / Booking Action */}
        <div className="lg:col-span-1">
          <div className="sticky top-12 bg-[#1a1518] border border-white/10 rounded-[40px] p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <span className="text-white/40 text-[10px] font-black tracking-widest uppercase">Pricing</span>
              <div className="text-3xl font-black italic">
                {isActivity ? (
                  item.is_free ? <span className="text-green-500 uppercase">Free</span> : `${item.price} MAD`
                ) : 'Local Partner'}
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col">
                <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest mb-1">Date</span>
                <span className="text-sm font-bold">Select a date</span>
              </div>
              <div className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col">
                <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest mb-1">Guests</span>
                <span className="text-sm font-bold">1 Person</span>
              </div>
            </div>

            <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-5 rounded-2xl font-black uppercase tracking-[2px] transition-all shadow-[0_10px_30px_rgba(249,115,22,0.3)]">
              {isActivity ? 'Book Experience' : 'Contact Business'}
            </button>
            
            <p className="text-center text-[10px] text-white/20 font-bold uppercase tracking-widest mt-6">
              Secure payment via Stripe
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivitiesDeatels;