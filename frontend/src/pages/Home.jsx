import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ActivityCard from '../components/ui/ActivityCard';
import { FiSearch, FiChevronRight } from 'react-icons/fi';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

const Home = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState([]);
  const [search, setSearch] = useState("");

  const user = localStorage.getItem('user');
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const [actRes, busRes] = await Promise.all([
          fetch('http://127.0.0.1:8000/api/activities', { headers }),
          fetch('http://127.0.0.1:8000/api/businesses', { headers })
        ]);
        
        const acts = await actRes.json();
        const buss = await busRes.json();
        console.log("buss", buss);
        
        setActivities(acts.data || []);
        setBusinesses(buss.data || []);
      } catch (error) {
        console.error("Discovery error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    const getLocation = () => {
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
    };

    const getCityCountry = async () => {
      try {
        const position = await getLocation();
        const { latitude, longitude } = position.coords;
        const API_KEY = "b46deea88e6a47d2bfcba9d6c6bda72d";

        const res = await fetch(
          `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${API_KEY}`
        );

        const data = await res.json();
        console.log(data);

        const components = data.results[0].components;

        const city =
          components.city ||
          components.town ||
          components.village ||
          components.state;

        const country = components.country;

        setLocation([city, country]);
      } catch (err) {
        console.error("Location denied or unavailable : ", err);
      }
    };
    // getCityCountry()
  }, [token]);

  activities.forEach(element => {
    console.log(element.location);
  });

  return (
    <div className="bg-[#0a0a0a]">
      <div className="max-w-[1600px] mx-auto bg-gradient-to-br from-[#1a1518] via-[#0f0f0f] to-[#0a0a0a] overflow-hidden shadow-2xl">
        <Header/>

        {/* Hero Section */}
        <section className="px-8 md:px-16 py-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center border-b border-white/5">
          <div className="space-y-8">
            <h1 className="text-7xl md:text-8xl font-black leading-[0.9] tracking-tighter text-white italic">
              LIVE THE<br /><span className="text-orange-500">MOMENT</span>
            </h1>
            <p className="text-white/40 text-lg max-w-md leading-relaxed font-medium">
              Explore curated activities and local businesses. From hidden street food to exclusive cultural tours.
            </p>
            
            {/* Real Search Bar */}
            <div className="bg-white/5 border border-white/10 p-2 rounded-full flex items-center max-w-lg group focus-within:border-orange-500/50 transition-all">
              <FiSearch className="ml-6 text-white/20 group-focus-within:text-orange-500" />
              <input 
                type="text" 
                placeholder="Search activities..." 
                className="bg-transparent flex-1 px-4 py-3 text-white outline-none placeholder:text-white/10"
                onChange={(e) => setSearch(e.target.value)}
              />
              <button className="bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-full transition-all">
                <FiChevronRight size={20}/>
              </button>
            </div>
          </div>

          <div className="relative h-[500px] hidden lg:flex items-center justify-center">
            <div className="absolute w-[400px] h-[400px] bg-orange-500/10 blur-[80px] rounded-full" />
            <img 
              src="https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&q=80&w=800" 
              className="relative z-10 w-[380px] h-[520px] object-cover rounded-[40px] border border-white/10 rotate-3 hover:rotate-0 transition-transform duration-500" 
              alt="City" 
            />
          </div>
        </section>

        {search ? <section className="px-8 md:px-16 py-14">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <h2 className="text-5xl font-black text-white leading-tight italic mt-2">ACTIVITIES FOUNDED</h2>
            </div>
          </div>

          {loading ? (
            <div className="text-white/20 font-black animate-pulse">LOADING DISCOVERIES...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {activities.filter(e => e.location.toLowerCase().includes(search.toLowerCase())).map((act) => (
                <ActivityCard 
                  key={act.id} 
                  item={act} 
                  type="activities" 
                  onClick={() => navigate(`/activities/${act.id}`)} 
                />
              ))}
            </div>
          )}
        </section> : null}

        {/* ACTIVITIES IN YOUR CITY */}
        <section className="px-8 md:px-16 py-14">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              {/* <span className="text-orange-500 text-[11px] font-black tracking-[3px] uppercase">Explore</span> */}
              <h2 className="text-5xl font-black text-white leading-tight italic mt-2">ACTIVITIES IN YOUR CITY</h2>
            </div>
            {/* <button className="px-8 py-3 bg-white/5 border border-white/10 rounded-full text-[11px] font-bold tracking-widest uppercase hover:bg-white/10 transition-all">
              View All Activities
            </button> */}
          </div>

          {loading ? (
            <div className="text-white/20 font-black animate-pulse">LOADING DISCOVERIES...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {activities.filter((e) => e.location === location[0]).map((act) => (
                <ActivityCard 
                  key={act.id} 
                  item={act} 
                  type="activities" 
                  onClick={() => navigate(`/activities/${act.id}`)} 
                />
              ))}
            </div>
          )}
        </section>

        {/* TRENDING Activities */}
        <section className="px-8 md:px-16 py-14">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <span className="text-orange-500 text-[11px] font-black tracking-[3px] uppercase">Explore</span>
              <h2 className="text-5xl font-black text-white leading-tight italic mt-2">TRENDING ACTIVITIES</h2>
            </div>
            <button className="px-8 py-3 bg-white/5 border border-white/10 rounded-full text-[11px] font-bold tracking-widest uppercase hover:bg-white/10 transition-all">
              View All Activities
            </button>
          </div>

          {loading ? (
            <div className="text-white/20 font-black animate-pulse">LOADING DISCOVERIES...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {activities.map((act) => (
                <ActivityCard 
                  key={act.id} 
                  item={act} 
                  type="activities" 
                  onClick={() => navigate(`/activities/${act.id}`)} 
                />
              ))}
            </div>
          )}
        </section>

        <section className="px-8 md:px-16 py-24 bg-white/[0.02] border-t border-white/5">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <span className="text-orange-500 text-[11px] font-black tracking-[3px] uppercase">Partnered</span>
              <h2 className="text-5xl font-black text-white leading-tight italic mt-2">LOCAL BUSINESSES</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {businesses.map((biz) => (
              <ActivityCard 
                key={biz.id}
                item={biz} 
                type="businesses" 
                onClick={() => navigate(`/organizer/details/${biz.id}`)} 
              />
            ))}
          </div>
        </section>

        {!user ? 
          <section className="py-32 px-8 text-center bg-gradient-to-b from-transparent to-orange-500/5">
            <h2 className="text-6xl md:text-7xl font-black text-white italic tracking-tighter mb-8 leading-none">READY TO EXPLORE?</h2>
            <button 
              onClick={() => navigate('/register')}
              className="bg-white text-black px-12 py-5 rounded-full font-black text-sm uppercase tracking-widest hover:bg-orange-500 hover:text-white transition-all shadow-xl"
            >
              Join MyCityLife Now
            </button>
          </section>
        : (
          // return 
          <div></div>
        )} 
      </div>
    </div>
  );
};

export default Home;
