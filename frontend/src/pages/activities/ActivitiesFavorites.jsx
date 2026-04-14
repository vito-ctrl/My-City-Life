import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Added for navigation support
import ActivityCard from '../../components/ui/ActivityCard';
import Header from '../../components/layout/Header';
import { FiHeart, FiArrowLeft } from 'react-icons/fi'; // Icons for better UI

const ActivitiesFavorites = () => {
    const navigate = useNavigate();
    const [activities, setActivities] = useState([]); // Renamed for clarity
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchFavoriteActivity = async () => {
            try {
                const res = await fetch('http://127.0.0.1:8000/api/favorite/all', {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                setActivities(data);
            } catch (err) {
                console.error("Error fetching favorites:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchFavoriteActivity();
    }, [token]);

    return (
        <div className="min-h-screen bg-[#0a0a0a]">
            <div className="max-w-[1600px] mx-auto bg-gradient-to-br from-[#1a1518] via-[#0f0f0f] to-[#0a0a0a] min-h-screen shadow-2xl flex flex-col">
                <Header />

                <main className="flex-1 px-8 md:px-16 py-12">
                    {/* Persistent Section Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                        <div className="space-y-2">
                            <span className="flex items-center gap-2 text-orange-500 text-[11px] font-black tracking-[3px] uppercase">
                                <FiHeart className="fill-current" /> Curated
                            </span>
                            <h2 className="text-5xl font-black text-white leading-tight italic uppercase">
                                Your <span className="text-orange-500">Favorites</span>
                            </h2>
                        </div>
                        <button 
                            onClick={() => navigate('/')}
                            className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-full text-[11px] font-bold tracking-widest uppercase hover:bg-white/10 transition-all text-white"
                        >
                            <FiArrowLeft /> Back to Explore
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="text-white/20 font-black animate-pulse tracking-[0.2em] uppercase italic text-xl">
                                Loading your discoveries...
                            </div>
                        </div>
                    ) : activities.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            {activities.map((e) => (
                                <ActivityCard
                                    key={e.id} 
                                    item={e} 
                                    type="activity" 
                                    onClick={() => navigate(`/activities/${e.id}`)} 
                                />
                            ))}
                        </div>
                    ) : (
                        /* Enhanced Empty State */
                        <div className="flex flex-col items-center justify-center py-24 text-center space-y-6">
                            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                                <FiHeart size={40} className="text-white/10" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-bold text-white italic">Nothing saved yet</h3>
                                <p className="text-white/40 text-sm max-w-xs mx-auto">
                                    Start exploring your city and save the moments that matter most to you.
                                </p>
                            </div>
                            <button 
                                onClick={() => navigate('/')}
                                className="bg-orange-500 text-white px-10 py-4 rounded-full font-black text-[11px] uppercase tracking-widest hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/20"
                            >
                                Discover Activities
                            </button>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default ActivitiesFavorites;