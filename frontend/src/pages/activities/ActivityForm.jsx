import React, { useState } from 'react';
import { FiPlus, FiMapPin, FiTag, FiDollarSign, FiCalendar, FiImage, FiType, FiAlignLeft } from 'react-icons/fi';

const ActivityForm = () => {
    const [form, setForm] = useState({
        title: "",
        description: "",
        category: "",
        location: "",
        price: 0,
        is_free: true,
        image: "",
        start_date: '',
        end_date: ''
    });

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        const finalValue = type === 'checkbox' ? e.target.checked : 
                        value === "true" ? true : 
                        value === "false" ? false : value;
                        
        setForm(prev => ({...prev, [name] : finalValue}));
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            const res = await fetch('http://127.0.0.1:8000/api/activities/create', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ ...form }) 
            });

            const data = await res.json();
            if (!res.ok) {
                console.error("Error:", data);
            } else {
                console.log("Success:", data);
                // Optional: add a success notification here
            }
        } catch (error) {
            console.error("Network error:", error);
        }
    }

    const inputWrapper = "relative flex flex-col space-y-2";
    const iconStyle = "absolute left-4 top-[42px] text-white/20";
    const inputClass = 'w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/50 transition-all placeholder:text-white/10';
    const labelClass = "text-[11px] font-bold tracking-[2px] text-white/40 uppercase ml-1";

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
            <div className="w-full max-w-2xl bg-[#1a1518]/50 border border-white/10 rounded-[32px] p-8 md:p-12 shadow-2xl backdrop-blur-xl">
                
                {/* Header */}
                <div className="mb-10 text-center">
                    <span className="text-orange-500 text-[11px] font-black tracking-[3px] uppercase">Creator Studio</span>
                    <h2 className="text-4xl font-black text-white italic mt-2 tracking-tighter">CREATE NEW ACTIVITY</h2>
                </div>

                <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit}>
                    
                    {/* Title */}
                    <div className={`${inputWrapper} md:col-span-2`}>
                        <label className={labelClass}>Activity Title</label>
                        <FiType className={iconStyle} />
                        <input type="text" name="title" placeholder="e.g. Midnight Food Tour" required className={inputClass} onChange={handleChange} />
                    </div>

                    {/* Description */}
                    <div className={`${inputWrapper} md:col-span-2`}>
                        <label className={labelClass}>Description</label>
                        <FiAlignLeft className="absolute left-4 top-[42px] text-white/20" />
                        <textarea name="description" placeholder="Describe the experience..." rows="3" required className={`${inputClass} resize-none`} onChange={handleChange} />
                    </div>

                    {/* Category & Location */}
                    <div className={inputWrapper}>
                        <label className={labelClass}>Category</label>
                        <FiTag className={iconStyle} />
                        <input type="text" name="category" placeholder="Food, Culture, etc." required className={inputClass} onChange={handleChange} />
                    </div>

                    <div className={inputWrapper}>
                        <label className={labelClass}>Location</label>
                        <FiMapPin className={iconStyle} />
                        <input type="text" name="location" placeholder="City, Area" required className={inputClass} onChange={handleChange} />
                    </div>

                    {/* Pricing Logic */}
                    <div className={inputWrapper}>
                        <label className={labelClass}>Pricing Model</label>
                        <select name="is_free" className={`${inputClass} appearance-none cursor-pointer`} onChange={handleChange}>
                            <option value={true} className="bg-[#1a1a1a]">Free Activity</option>
                            <option value={false} className="bg-[#1a1a1a]">Paid Activity</option>
                        </select>
                    </div>

                    <div className={inputWrapper}>
                        <label className={labelClass}>Price (MAD)</label>
                        <FiDollarSign className={iconStyle} />
                        <input type="number" name="price" placeholder="0.00" disabled={form.is_free} required className={`${inputClass} disabled:opacity-30`} onChange={handleChange} />
                    </div>

                    {/* Image URL */}
                    <div className={`${inputWrapper} md:col-span-2`}>
                        <label className={labelClass}>Cover Image URL</label>
                        <FiImage className={iconStyle} />
                        <input type="text" name="image" placeholder="https://unsplash.com/..." required className={inputClass} onChange={handleChange} />
                    </div>

                    {/* Dates */}
                    <div className={inputWrapper}>
                        <label className={labelClass}>Start Date</label>
                        <FiCalendar className={iconStyle} />
                        <input type="date" name="start_date" required className={inputClass} onChange={handleChange} />
                    </div>

                    <div className={inputWrapper}>
                        <label className={labelClass}>End Date</label>
                        <FiCalendar className={iconStyle} />
                        <input type="date" name="end_date" required className={inputClass} onChange={handleChange} />
                    </div>

                    {/* Submit Button */}
                    <div className="md:col-span-2 mt-6">
                        <button 
                            type="submit"
                            className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-[2px] flex items-center justify-center gap-3 hover:shadow-[0_8px_25px_rgba(249,115,22,0.4)] transition-all active:scale-[0.98]"
                        >
                            <FiPlus strokeWidth={3} />
                            Publish Activity
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ActivityForm;