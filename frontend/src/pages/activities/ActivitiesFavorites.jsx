import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ActivityCard from '../../components/ui/ActivityCard';
import Header from '../../components/layout/Header';
import { FiHeart, FiArrowLeft } from 'react-icons/fi'; 
import { fetchAllFavorites } from '../../services/favorites';

const ActivitiesFavorites = () => {
    const navigate = useNavigate();
    const [favorites, setFavorites] = useState({ activities: [], businesses: [] }); 
    const [activeTab, setActiveTab] = useState('activities');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFavoriteActivity = async () => {
            try {
                const data = await fetchAllFavorites();
                setFavorites(data);

                if (data.activities.length === 0 && data.businesses.length > 0) {
                    setActiveTab('businesses');
                }
            } catch (err) {
                console.error("Error fetching favorites:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchFavoriteActivity();
    }, []);

    const activeItems = favorites[activeTab];
    const totalFavorites = favorites.activities.length + favorites.businesses.length;

    const handleFavoriteChange = (type, itemId, isFavorited) => {
        if (isFavorited) {
            return;
        }

        setFavorites((currentFavorites) => ({
            ...currentFavorites,
            [type]: currentFavorites[type].filter((entry) => entry.id !== itemId),
        }));
    };

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
                            <p className="text-sm text-white/40">
                                {totalFavorites} saved {totalFavorites === 1 ? 'place' : 'places'} ready for your next plan.
                            </p>
                        </div>
                        <button 
                            onClick={() => navigate('/')}
                            className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-full text-[11px] font-bold tracking-widest uppercase hover:bg-white/10 transition-all text-white"
                        >
                            <FiArrowLeft /> Back to Explore
                        </button>
                    </div>

                    <div className="mb-10 flex flex-wrap gap-3">
                        <button
                            onClick={() => setActiveTab('activities')}
                            className={`rounded-full px-5 py-3 text-[11px] font-black uppercase tracking-widest transition-all ${
                                activeTab === 'activities'
                                    ? 'bg-orange-500 text-white'
                                    : 'bg-white/5 text-white/70 hover:bg-white/10'
                            }`}
                        >
                            Activities ({favorites.activities.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('businesses')}
                            className={`rounded-full px-5 py-3 text-[11px] font-black uppercase tracking-widest transition-all ${
                                activeTab === 'businesses'
                                    ? 'bg-orange-500 text-white'
                                    : 'bg-white/5 text-white/70 hover:bg-white/10'
                            }`}
                        >
                            Businesses ({favorites.businesses.length})
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="text-white/20 font-black animate-pulse tracking-[0.2em] uppercase italic text-xl">
                                Loading your discoveries...
                            </div>
                        </div>
                    ) : activeItems.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            {activeItems.map((item) => (
                                <ActivityCard
                                    key={`${activeTab}-${item.id}`} 
                                    item={item} 
                                    type={activeTab}
                                    onFavoriteChange={(isFavorited) => handleFavoriteChange(activeTab, item.id, isFavorited)}
                                    onClick={() => navigate(activeTab === 'activities' ? `/activities/${item.id}` : `/organizer/details/${item.id}`)} 
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-24 text-center space-y-6">
                            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                                <FiHeart size={40} className="text-white/10" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-bold text-white italic">Nothing saved yet</h3>
                                <p className="text-white/40 text-sm max-w-xs mx-auto">
                                    {activeTab === 'activities'
                                        ? 'Start exploring your city and save the moments that matter most to you.'
                                        : 'Save the businesses you want to revisit so your favorite spots stay one tap away.'}
                                </p>
                            </div>
                            <button 
                                onClick={() => navigate('/')}
                                className="bg-orange-500 text-white px-10 py-4 rounded-full font-black text-[11px] uppercase tracking-widest hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/20"
                            >
                                Discover {activeTab === 'activities' ? 'Activities' : 'Businesses'}
                            </button>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default ActivitiesFavorites;
