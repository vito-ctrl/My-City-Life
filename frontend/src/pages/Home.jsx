import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';

const Home = () => {
  const navigate = useNavigate();

  const activities = [
    {
      id: 1,
      title: "Community Walking Tours",
      desc: "Join locals for guided walks through historic neighborhoods",
      badge: "FREE",
      badgeColor: "bg-green-500/90",
      img: "https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&fit=crop&q=80&w=800"
    },
    {
      id: 2,
      title: "Exclusive Food Tastings",
      desc: "Experience curated culinary journeys with local chefs",
      badge: "PREMIUM",
      badgeColor: "bg-orange-500/90",
      img: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800"
    },
    {
      id: 3,
      title: "Cultural Meetup Groups",
      desc: "Connect with communities sharing your interests",
      badge: "FREE",
      badgeColor: "bg-green-500/90",
      img: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&q=80&w=800"
    }
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-4 md:p-12">
      <Header/>
      {/* Main Bordered Container */}
      <div className="max-w-[1600px] mx-auto bg-gradient-to-br from-[#1a1518] via-[#0f0f0f] to-[#0a0a0a] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl">
        
        {/* Navigation */}
        <nav className="px-8 md:px-16 py-8 border-b border-white/5 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
              <svg width="24" height="24" viewBox="0 0 40 40" fill="none">
                <path d="M20 12L26 20L20 28L14 20L20 12Z" fill="white"/>
              </svg>
            </div>
            <span className="text-xl font-black tracking-tight text-white">MyCity<span className="text-orange-500">Life</span></span>
          </div>
          <div className="hidden md:flex gap-12 items-center">
            {['About', 'Activities', 'Pricing'].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-[11px] font-bold tracking-[2px] text-white/60 hover:text-white transition-colors uppercase">
                {item}
              </a>
            ))}
          </div>
        </nav>

        {/* Hero Section */}
        <section className="px-8 md:px-16 pt-20 pb-12 flex flex-col min-h-[85vh]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center flex-grow">
            {/* Left Content */}
            <div className="space-y-8">
              <p className="text-[11px] font-bold tracking-[3px] text-white/40 uppercase">Our Mission</p>
              <h1 className="text-7xl md:text-8xl font-black leading-[0.9] tracking-tighter text-white">
                DISCOVER<br />WHAT'S<br />HAPPENING
              </h1>
              <p className="text-white/60 text-lg max-w-md leading-relaxed">
                Connect with your city's pulse. Whether you're exploring as a visitor or rediscovering as a local, MyCityLife brings you authentic experiences.
              </p>
              <button 
                onClick={() => navigate('/register')}
                className="group flex items-center gap-4 border border-white/20 rounded-full pl-3 pr-6 py-3 hover:border-white/40 transition-all active:scale-95"
              >
                <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center group-hover:bg-white/10 transition-colors">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
                <span className="text-sm font-bold text-white uppercase tracking-wider">See More</span>
              </button>
            </div>

            {/* Right Image/Graphic */}
            <div className="relative flex items-center justify-center h-[500px]">
              <div className="absolute w-[500px] h-[500px] bg-radial-gradient from-orange-500/20 to-red-500/5 blur-[60px] rounded-full" />
              <img 
                src="https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&q=80&w=800" 
                alt="City Scene" 
                className="relative z-10 w-[350px] h-[480px] object-cover rounded-2xl shadow-2xl border border-white/10"
              />
              <div className="absolute bottom-[-40px] right-[20px] w-48 h-48 bg-orange-500/30 blur-[40px] rounded-full" />
            </div>
          </div>

          {/* Page Indicator Footer */}
          <div className="mt-20 pt-8 border-t border-white/5 flex items-center gap-8">
             <span className="text-sm font-bold text-white/30">01</span>
             <div className="w-48 h-[2px] bg-white/10 relative">
                <div className="absolute left-0 top-0 h-full w-1/3 bg-gradient-to-r from-orange-500 to-red-500" />
             </div>
             <span className="text-sm font-bold text-white/30">03</span>
          </div>
        </section>

        {/* Search Section */}
        <section className="bg-white/5 py-24 px-8 border-t border-white/5">
          <div className="max-w-4xl mx-auto text-center space-y-10">
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">Find Your Next Adventure</h2>
            <div className="bg-white/5 border border-white/10 p-3 rounded-[70px] flex flex-col md:flex-row items-center gap-4">
              <input 
                type="text" 
                placeholder="Enter your city" 
                className="bg-transparent flex-1 px-6 py-4 text-white outline-none placeholder:text-white/20 font-medium"
              />
              <div className="hidden md:block w-[1px] h-10 bg-white/10" />
              <select className="bg-transparent flex-1 px-6 py-4 text-white/70 outline-none cursor-pointer font-medium appearance-none">
                <option className="bg-[#1a1a1a]">All Categories</option>
                <option className="bg-[#1a1a1a]">Food & Dining</option>
                <option className="bg-[#1a1a1a]">Nightlife</option>
              </select>
              <button className="w-full md:w-auto bg-gradient-to-r from-orange-500 to-red-500 text-white pl-8 pr-4 py-4 rounded-full font-black flex items-center justify-between gap-6 hover:shadow-[0_8px_25px_rgba(249,115,22,0.4)] transition-all active:scale-95">
                EXPLORE
                <div className="bg-white/20 p-2 rounded-full">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </button>
            </div>
          </div>
        </section>

        {/* Activities Grid */}
        <section id="activities" className="px-8 md:px-16 py-24">
          <div className="mb-16">
            <span className="text-orange-500 text-[11px] font-black tracking-[2px] uppercase">Trending Now</span>
            <h2 className="text-5xl font-black text-white leading-tight mt-4 italic">Discover Activities<br />Happening Today</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {activities.map((act) => (
              <div key={act.id} className="group bg-white/5 border border-white/5 rounded-[32px] overflow-hidden hover:-translate-y-2 hover:border-white/10 transition-all duration-300">
                <div className="h-[300px] relative overflow-hidden">
                  <span className={`absolute top-5 right-5 z-20 ${act.badgeColor} text-white px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest backdrop-blur-md`}>
                    {act.badge}
                  </span>
                  <img src={act.img} alt={act.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                </div>
                <div className="p-8 space-y-3">
                  <h3 className="text-xl font-bold text-white">{act.title}</h3>
                  <p className="text-white/40 text-sm leading-relaxed">{act.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-gradient-to-t from-orange-600/10 to-transparent py-32 px-8 text-center border-t border-white/5">
          <div className="max-w-2xl mx-auto space-y-8">
            <h2 className="text-5xl md:text-6xl font-black text-white italic tracking-tighter leading-none">Your City Awaits</h2>
            <p className="text-white/50 text-lg leading-relaxed px-4">Join thousands discovering amazing experiences and meeting incredible people every day.</p>
            <button 
              onClick={() => navigate('/register')}
              className="inline-flex items-center gap-4 bg-gradient-to-r from-orange-500 to-red-500 text-white px-10 py-5 rounded-full font-black text-lg hover:shadow-[0_12px_40px_rgba(249,115,22,0.4)] hover:-translate-y-1 transition-all active:scale-95"
            >
              Start Exploring
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;