import React, { useState, useEffect } from 'react';
import { FiPlus, FiMapPin, FiTag, FiDollarSign, FiCalendar, FiImage, FiType, FiAlignLeft, FiSave } from 'react-icons/fi';

const ActivityForm = ({ initialData, onSuccess, isPopup }) => {
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

    useEffect(() => {
        if (initialData) {
            setForm({
                ...initialData,
                is_free: initialData.is_free === 1 || initialData.is_free === true
            });
        }
    }, [initialData]);

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
        const isEditing = !!initialData?.id;
        
        const url = isEditing 
            ? `http://127.0.0.1:8000/api/activities/${initialData.id}` 
            : 'http://127.0.0.1:8000/api/activities/create';
            
        const method = isEditing ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(form) 
            });

            if (res.ok) {
                onSuccess();
            }
        } catch (error) {
            console.error("Network error:", error);
        }
    }

    // Optimized utility classes for a more compact layout
    const inputWrapper = "relative flex flex-col space-y-1";
    const iconStyle = "absolute left-3 top-[34px] text-white/20 size-4";
    const inputClass = 'w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500/20 focus:border-orange-500/50 transition-all placeholder:text-white/10';
    const labelClass = "text-[9px] font-bold tracking-[1.5px] text-white/40 uppercase ml-1";

    return (
        <div className={`w-full bg-[#1a1518]/95 border border-white/10 rounded-[24px] md:p-8 shadow-2xl backdrop-blur-xl max-h-[100vh] overflow-y-auto`}>
            {/* Header - Scaled down */}
            <div className="text-center">
                <span className="text-orange-500 text-[9px] font-black tracking-[2px] uppercase">Creator Studio</span>
                <h2 className="text-2xl font-black text-white italic mt-1 tracking-tighter">
                    {initialData ? 'UPDATE EXPERIENCE' : 'CREATE NEW ACTIVITY'}
                </h2>
            </div>

            <form className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3" onSubmit={handleSubmit}>
                {/* Title - Span 2 columns */}
                <div className={`${inputWrapper} md:col-span-2`}>
                    <label className={labelClass}>Activity Title</label>
                    <FiType className={iconStyle} />
                    <input type="text" name="title" value={form.title} placeholder="e.g. Midnight Food Tour" required className={inputClass} onChange={handleChange} />
                </div>

                {/* Description - Span 2 columns */}
                <div className={`${inputWrapper} md:col-span-2`}>
                    <label className={labelClass}>Description</label>
                    <FiAlignLeft className="absolute left-3 top-[34px] text-white/20 size-4" />
                    <textarea name="description" value={form.description} placeholder="Describe the experience..." rows="2" required className={`${inputClass} resize-none pl-9`} onChange={handleChange} />
                </div>

                {/* Category & Location */}
                <div className={inputWrapper}>
                    <label className={labelClass}>Category</label>
                    <FiTag className={iconStyle} />
                    <input type="text" name="category" value={form.category} placeholder="Food, Culture, etc." required className={inputClass} onChange={handleChange} />
                </div>

                <div className={inputWrapper}>
                    <label className={labelClass}>Location</label>
                    <FiMapPin className={iconStyle} />
                    <input type="text" name="location" value={form.location} placeholder="City, Area" required className={inputClass} onChange={handleChange} />
                </div>

                {/* Pricing row */}
                <div className={inputWrapper}>
                    <label className={labelClass}>Pricing Model</label>
                    <select name="is_free" value={form.is_free} className={`${inputClass} appearance-none cursor-pointer pl-3`} onChange={handleChange}>
                        <option value={true} className="bg-[#1a1a1a]">Free Activity</option>
                        <option value={false} className="bg-[#1a1a1a]">Paid Activity</option>
                    </select>
                </div>

                <div className={inputWrapper}>
                    <label className={labelClass}>Price (MAD)</label>
                    <FiDollarSign className={iconStyle} />
                    <input type="number" name="price" value={form.price} placeholder="0.00" disabled={form.is_free} required className={`${inputClass} disabled:opacity-30`} onChange={handleChange} />
                </div>

                {/* Dates row */}
                <div className={inputWrapper}>
                    <label className={labelClass}>Start Date</label>
                    <FiCalendar className={iconStyle} />
                    <input type="date" name="start_date" value={form.start_date} required className={inputClass} onChange={handleChange} />
                </div>

                <div className={inputWrapper}>
                    <label className={labelClass}>End Date</label>
                    <FiCalendar className={iconStyle} />
                    <input type="date" name="end_date" value={form.end_date} required className={inputClass} onChange={handleChange} />
                </div>

                {/* Image URL - Span 2 columns */}
                <div className={`${inputWrapper} md:col-span-2`}>
                    <label className={labelClass}>Cover Image URL</label>
                    <FiImage className={iconStyle} />
                    <input type="text" name="image" value={form.image} placeholder="https://unsplash.com/..." required className={inputClass} onChange={handleChange} />
                </div>

                {/* Submit Button */}
                <div className="md:col-span-2 mt-4">
                    <button 
                        type="submit"
                        className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-black text-xs uppercase tracking-[2px] flex items-center justify-center gap-2 hover:shadow-lg transition-all active:scale-[0.98]"
                    >
                        {initialData ? <><FiSave size={16}/> Update</> : <><FiPlus size={16}/> Publish</>}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default ActivityForm;