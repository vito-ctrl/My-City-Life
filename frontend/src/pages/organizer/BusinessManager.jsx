import React, { useState, useEffect } from 'react';
import { 
  FiEdit3, FiTrash2, FiMapPin, FiX, FiSearch, 
  FiBriefcase, FiTrendingUp, FiStar, FiPlus 
} from 'react-icons/fi';
import BusinessForm from '../../components/layout/BusinessForm';
import Header from '../../components/layout/Header';

const BusinessManager = () => {
    const [businesses, setBusinesses] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBusiness, setEditingBusiness] = useState(null);
    const token = localStorage.getItem('token');

    const fetchMyBusinesses = async () => {
        try {
            const res = await fetch(`http://127.0.0.1:8000/api/businesses/all`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setBusinesses(data || []); 
        } catch (err) {
            console.error("Fetch failed", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchMyBusinesses(); }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure? This will remove the business and its reservations.")) return;
        try {
            await fetch(`http://127.0.0.1:8000/api/businesses/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchMyBusinesses();
        } catch (err) {
            console.error("Delete failed", err);
        }
    };

    const filtered = businesses.filter(b => b.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-6 pb-24">
            <Header/>
            <div className="max-w-7xl mx-auto space-y-10">
                
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-10">
                    <div>
                        <h1 className="text-5xl font-black tracking-tighter uppercase">My Establishments</h1>
                        <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-[0.3em] mt-2 ml-1">Business Management Portal</p>
                    </div>
                    <button 
                        onClick={() => { setEditingBusiness(null); setIsModalOpen(true); }}
                        className="bg-amber-500 text-black px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20"
                    >
                        <FiPlus strokeWidth={4} /> Register New Business
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <StatCard icon={<FiBriefcase/>} label="Active Listings" value={businesses.length} color="text-amber-500" />
                    <StatCard icon={<FiTrendingUp/>} label="Total Reach" value="2.4k" color="text-emerald-500" />
                    <StatCard icon={<FiStar/>} label="Average Rating" value="4.8" color="text-blue-500" />
                </div>

                {/* Filter Bar */}
                <div className="relative max-w-md">
                    <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input 
                        type="text" 
                        placeholder="Search by name..." 
                        className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl py-4 pl-14 pr-6 text-xs font-bold focus:border-amber-500 outline-none transition-all"
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Business List */}
                <div className="grid grid-cols-1 gap-4">
                    {filtered.map(b => (
                        <div key={b.id} className="bg-zinc-900 border border-zinc-800 p-6 rounded-[24px] flex items-center justify-between group hover:border-zinc-700 transition-all">
                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 bg-zinc-800 rounded-2xl overflow-hidden border border-zinc-700">
                                    {b.image && <img src={`http://127.0.0.1:8000/storage/${JSON.parse(b.image)[0]}`} className="w-full h-full object-cover" alt="" />}
                                </div>
                                <div>
                                    <h3 className="text-lg font-black uppercase tracking-tight group-hover:text-amber-500 transition-colors">{b.name}</h3>
                                    <div className="flex items-center gap-4 mt-1 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                                        <span className="flex items-center gap-1.5"><FiMapPin size={12}/> {b.location}</span>
                                        <span className="px-2 py-0.5 bg-zinc-800 rounded text-amber-500">{b.type}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button onClick={() => { setEditingBusiness(b); setIsModalOpen(true); }} className="p-3 bg-zinc-800 text-zinc-400 rounded-xl hover:text-white transition-colors"><FiEdit3/></button>
                                <button onClick={() => handleDelete(b.id)} className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><FiTrash2/></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
                    <div className="relative w-full max-w-3xl">
                        <button onClick={() => setIsModalOpen(false)} className="absolute -top-12 right-0 text-zinc-500 hover:text-white"><FiX size={32}/></button>
                        <BusinessForm 
                            isPopup={true} 
                            initialData={editingBusiness} 
                            onSuccess={() => { setIsModalOpen(false); fetchMyBusinesses(); }} 
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

const StatCard = ({ icon, label, value, color }) => (
    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-[28px]">
        <div className={`text-2xl mb-4 ${color}`}>{icon}</div>
        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{label}</p>
        <h4 className="text-3xl font-black mt-1">{value}</h4>
    </div>
);

export default BusinessManager;