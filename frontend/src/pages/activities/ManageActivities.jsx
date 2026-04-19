import React, { useState, useEffect } from 'react';
import { 
  FiEdit3, FiTrash2, FiMapPin, FiTag, FiX, FiSearch, 
  FiActivity, FiCheckCircle, FiClock, FiPlus 
} from 'react-icons/fi';
import ActivityForm from './ActivityForm';
import Header from '../../components/layout/Header';
const ManageActivities = () => {
  const [activities, setActivities] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  // const {id} = useParams();
  const token = localStorage.getItem('token');

  const fetchMyActivities = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/activities/user/all`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setActivities(data || []); 
    } catch (err) {
      console.error("Fetch failed", err);
    } finally {
      setLoading(false);
    }
  };
  console.log("ac : ", activities);

  useEffect(() => { fetchMyActivities(); }, []);

  const openModal = (activity = null) => {
    setEditingActivity(activity);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`http://127.0.0.1:8000/api/activities/${id}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
        }
      });
      fetchMyActivities();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const filteredActivities = activities.filter(act => 
    act.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    act.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Dynamic Background Elements */}
      {!isModalOpen ? <Header /> : <></> }
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-orange-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-red-500/5 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-8 bg-orange-500 rounded-full" />
              <h1 className="text-5xl font-black italic tracking-tighter uppercase">
                Manage <span className="text-orange-500">Activities</span>
              </h1>
            </div>
            <p className="text-white/40 text-xs font-bold uppercase tracking-[0.3em] ml-5">
              Experience Control Center
            </p>
          </div>
          
          <button 
            onClick={() => openModal()} 
            className="group flex items-center gap-3 bg-white text-black px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-500 hover:text-white transition-all shadow-xl shadow-orange-500/10 active:scale-95"
          >
            <FiPlus className="text-lg group-hover:rotate-90 transition-transform" />
            Add New Experience
          </button>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          <StatCard icon={<FiActivity/>} label="Total Listed" value={activities.length} color="text-blue-400" />
          <StatCard icon={<FiCheckCircle/>} label="Active Now" value={activities.length} color="text-green-400" />
          <StatCard icon={<FiClock/>} label="Recent Edits" value="2" color="text-orange-400" />
        </div>

        {/* Search & Filter Bar */}
        <div className="relative mb-8 group">
          <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-orange-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search your experiences by title or category..." 
            className="w-full bg-white/[0.03] border border-white/5 py-5 pl-14 pr-6 rounded-2xl outline-none focus:border-orange-500/30 focus:bg-white/[0.05] transition-all font-medium placeholder:text-white/10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Activities List */}
        <div className="grid gap-4">
          {loading ? (
             <div className="py-20 text-center text-white/10 font-black tracking-widest uppercase animate-pulse">Loading Your Data...</div>
          ) : filteredActivities.length > 0 ? (
            filteredActivities.map(act => (
              <div key={act.id} className="group relative bg-white/[0.02] border border-white/5 p-5 rounded-[28px] flex flex-col md:flex-row justify-between items-center gap-6 hover:bg-white/[0.04] hover:border-orange-500/20 transition-all duration-500">
                
                <div className="flex items-center gap-6 w-full md:w-auto">
                  <div>
                    <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-1 block">
                      {act.category}
                    </span>
                    <h3 className="text-xl font-bold uppercase italic leading-none group-hover:text-orange-500 transition-colors">
                      {act.title}
                    </h3>
                    <div className="flex items-center gap-4 text-[10px] text-white/30 font-bold uppercase tracking-widest mt-3">
                      <span className="flex items-center gap-1.5"><FiMapPin size={12} className="text-orange-500"/> {act.location}</span>
                      <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10">{act.is_free ? 'Free' : `${act.price} MAD`}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 w-full md:w-auto justify-end border-t md:border-t-0 border-white/5 pt-4 md:pt-0">
                  <button 
                    onClick={() => openModal(act)} 
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white/5 rounded-xl hover:bg-orange-500 hover:text-white transition-all font-black text-[10px] uppercase tracking-widest"
                  >
                    <FiEdit3 size={14}/> Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(act.id)} 
                    className="flex items-center justify-center p-3 bg-red-500/5 text-red-500/40 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                  >
                    <FiTrash2 size={16}/>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[40px]">
              <p className="text-white/20 font-bold uppercase tracking-widest">No matching activities found</p>
            </div>
          )}
        </div>

        {/* POPUP MODAL */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
             <div className="relative w-full max-w-2xl animate-in zoom-in-95 duration-300">
                <button 
                    onClick={() => setIsModalOpen(false)} 
                    className="absolute top-[-60px] right-0 md:top-6 md:right-[-60px] z-[210] text-white/40 hover:text-white transition-colors"
                >
                    <FiX size={32}/>
                </button>
                
                <ActivityForm 
                    isPopup={true} 
                    initialData={editingActivity} 
                    onSuccess={() => {
                        setIsModalOpen(false);
                        fetchMyActivities();
                    }} 
                />
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper Component for Stats
const StatCard = ({ icon, label, value, color }) => (
  <div className="bg-white/[0.02] border border-white/5 p-6 rounded-[28px] hover:border-white/10 transition-colors">
    <div className={`text-2xl mb-4 ${color}`}>{icon}</div>
    <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">{label}</p>
    <p className="text-3xl font-black italic tracking-tighter mt-1">{value}</p>
  </div>
);

export default ManageActivities;