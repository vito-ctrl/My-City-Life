import React, { useState, useEffect } from 'react';
import { 
  FiEdit3, FiTrash2, FiPlus, FiX, FiCheck, 
  FiMapPin, FiCalendar, FiDollarSign, FiTag, FiType 
} from 'react-icons/fi';

const ManageActivities = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    price: 0,
    is_free: 1,
    image: "",
    start_date: "",
    end_date: "",
    duration: "",
    requirements: ""
  });

  const token = localStorage.getItem('token');

  // 1. Fetch activities for the current user
  const fetchMyActivities = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/activities', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      // Adjust this based on if you have a specific 'my-activities' endpoint 
      // or if your 'index' filtered by auth.
      setActivities(data.data || []); 
    } catch (err) {
      console.error("Fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMyActivities(); }, []);

  // 2. Handle Form Changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: name === 'is_free' ? Number(value) : value }));
  };

  // 3. Open Modal for Create or Edit
  const openModal = (activity = null) => {
    if (activity) {
      setEditingId(activity.id);
      setForm({ ...activity, is_free: activity.is_free ? 1 : 0 });
    } else {
      setEditingId(null);
      setForm({ title: "", description: "", category: "", location: "", price: 0, is_free: 1, image: "", start_date: "", end_date: "", duration: "", requirements: "" });
    }
    setIsModalOpen(true);
  };

  // 4. Create or Update Logic
  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editingId 
      ? `http://127.0.0.1:8000/api/activities/${editingId}` 
      : 'http://127.0.0.1:8000/api/activities/create';
    
    const method = editingId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(form)
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchMyActivities();
      }
    } catch (err) {
      console.error("Submit failed", err);
    }
  };

  // 5. Delete Logic
  const handleDelete = async (id) => {
    // if (!window.confirm("Are you sure you want to delete this activity?"))
    console.log(id);
    try {
      await fetch(`http://127.0.0.1:8000/api/activities/${id}`, {
        method: 'DELETE',
        headers: { 
            'Accept' : 'application/json',
            'Content-Type' : 'application/json',
            'Authorization': `Bearer ${token}` 
        }
      });
      fetchMyActivities();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8 md:p-16">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-black italic tracking-tighter">MANAGE <span className="text-orange-500">ACTIVITIES</span></h1>
            <p className="text-white/40 text-sm mt-2 uppercase tracking-widest font-bold">Control your listed experiences</p>
          </div>
          <button 
            onClick={() => openModal()}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
          >
            <FiPlus strokeWidth={3} /> Create New
          </button>
        </header>

        {/* Activity List */}
        <div className="grid gap-4">
          {activities.map(act => (
            <div key={act.id} className="bg-white/5 border border-white/5 p-6 rounded-[24px] flex flex-col md:flex-row justify-between items-center gap-6 hover:border-white/10 transition-all">
              <div className="flex items-center gap-6">
                <img src={act.image} alt="" className="w-16 h-16 rounded-xl object-cover border border-white/10" />
                <div>
                  <h3 className="text-lg font-bold uppercase italic">{act.title}</h3>
                  <div className="flex items-center gap-4 text-[10px] text-white/30 font-bold uppercase tracking-widest mt-1">
                    <span className="flex items-center gap-1"><FiMapPin className="text-orange-500"/> {act.location}</span>
                    <span className="flex items-center gap-1"><FiTag className="text-orange-500"/> {act.category}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => openModal(act)} className="p-4 bg-white/5 rounded-xl hover:text-orange-500 transition-colors"><FiEdit3 /></button>
                <button onClick={() => handleDelete(act.id)} className="p-4 bg-white/5 rounded-xl hover:text-red-500 transition-colors"><FiTrash2 /></button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Form */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
            <div className="bg-[#141113] border border-white/10 w-full max-w-2xl rounded-[40px] p-8 md:p-12 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black italic uppercase tracking-tighter">
                  {editingId ? 'Edit Activity' : 'New Activity'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="text-white/20 hover:text-white"><FiX size={24}/></button>
              </div>

              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase text-white/30 tracking-widest">Title</label>
                  <input name="title" value={form.title} onChange={handleChange} required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-orange-500 transition-all" />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase text-white/30 tracking-widest">Description</label>
                  <textarea name="description" value={form.description} onChange={handleChange} rows="3" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-orange-500 transition-all resize-none" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-white/30 tracking-widest">Pricing</label>
                  <select name="is_free" value={form.is_free} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none">
                    <option value={1} className="bg-black">Free</option>
                    <option value={0} className="bg-black">Paid</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-white/30 tracking-widest">Price (MAD)</label>
                  <input type="number" name="price" value={form.price} onChange={handleChange} disabled={form.is_free === 1} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none disabled:opacity-20" />
                </div>

                {/* Additional fields (Location, Dates, Image URL) would go here following the same pattern */}
                
                <div className="md:col-span-2 pt-6">
                  <button type="submit" className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-orange-500 hover:text-white transition-all">
                    {editingId ? 'Save Changes' : 'Create Activity'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageActivities;