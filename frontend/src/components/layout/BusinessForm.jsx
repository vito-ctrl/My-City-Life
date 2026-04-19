import React, { useState, useEffect } from 'react';
import { 
    FiPlus, FiMapPin, FiTag, FiClock, FiImage, 
    FiType, FiAlignLeft, FiSave, FiX, FiCamera 
} from 'react-icons/fi';
import Header from './Header';

const BusinessForm = ({ initialData, onSuccess, isPopup }) => {
    const [images, setImages] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form, setForm] = useState({
        name: "",
        description: "",
        type: "Restaurant",
        location: "",
        opening_hours: ""
    });

    useEffect(() => {
        if (initialData) {
            setForm({
                name: initialData.name || "",
                description: initialData.description || "",
                type: initialData.type || "Restaurant",
                location: initialData.location || "",
                opening_hours: initialData.opening_hours || ""
            });
            if (initialData.image) {
                try {
                    const paths = JSON.parse(initialData.image);
                    setPreviews(paths.map(path => `http://127.0.0.1:8000/storage/${path}`));
                } catch (e) {
                    setPreviews([initialData.image]);
                }
            }
        }
    }, [initialData]);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setImages(prev => [...prev, ...files]);
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviews(prev => [...prev, ...newPreviews]);
    };

    const removeImage = (index) => {
        setPreviews(prev => prev.filter((_, i) => i !== index));
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const formData = new FormData();
        Object.keys(form).forEach(key => formData.append(key, form[key]));
        images.forEach(image => formData.append('images[]', image));
        if (initialData) formData.append('_method', 'PUT');

        try {
            const token = localStorage.getItem('token');
            const url = initialData 
                ? `http://127.0.0.1:8000/api/businesses/${initialData.id}` 
                : `http://127.0.0.1:8000/api/businesses/create`;
            
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            if (res.ok) onSuccess(); 
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Tighter spacing classes
    const inputClass = "w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2.5 pl-10 pr-4 text-xs font-bold text-white focus:border-amber-500 transition-all outline-none placeholder:text-zinc-800";
    const labelClass = "block text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1 ml-1";
    const iconStyle = "absolute left-3.5 top-[34px] text-zinc-700 size-3.5";

    return (
        <div className={`bg-zinc-900 border border-zinc-800 flex flex-col ${isPopup ? 'rounded-2xl shadow-2xl max-h-[85vh]' : 'rounded-3xl'}`}>
            {/* Sticky Header */}
            <div className="p-5 border-b border-zinc-800 flex justify-between items-center shrink-0">
                <div>
                    <h2 className="text-sm font-black text-white uppercase tracking-tight">
                        {initialData ? 'Edit Business' : 'New Establishment'}
                    </h2>
                </div>
            </div>


            {/* Scrollable Body */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto custom-scrollbar space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Name */}
                    <div className="relative md:col-span-1">
                        <label className={labelClass}>Business Name</label>
                        <FiType className={iconStyle} />
                        <input name="name" value={form.name} onChange={handleChange} required className={inputClass} placeholder="The Luxe Lounge" />
                    </div>

                    {/* Type */}
                    <div className="relative md:col-span-1">
                        <label className={labelClass}>Category</label>
                        <FiTag className={iconStyle} />
                        <select name="type" value={form.type} onChange={handleChange} className={inputClass}>
                            {['Bar', 'Cafe', 'Restaurant', 'Store', 'Event Space'].map(t => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>

                    {/* Location */}
                    <div className="relative md:col-span-2">
                        <label className={labelClass}>Location</label>
                        <FiMapPin className={iconStyle} />
                        <input name="location" value={form.location} onChange={handleChange} required className={inputClass} placeholder="Street, City" />
                    </div>

                    {/* Opening Hours */}
                    <div className="relative md:col-span-2">
                        <label className={labelClass}>Opening Hours</label>
                        <FiClock className={iconStyle} />
                        <input name="opening_hours" value={form.opening_hours} onChange={handleChange} className={inputClass} placeholder="09:00 - 22:00" />
                    </div>

                    {/* Description - Smaller Area */}
                    <div className="relative md:col-span-2">
                        <label className={labelClass}>Description</label>
                        <FiAlignLeft className="absolute left-3.5 top-[34px] text-zinc-700 size-3.5" />
                        <textarea name="description" value={form.description} onChange={handleChange} required rows="3" className={`${inputClass} resize-none h-20 pl-10`} placeholder="Write something short..." />
                    </div>

                    {/* Gallery - Horizontal Scroll or Smaller Grid */}
                    <div className="md:col-span-2">
                        <label className={labelClass}>Photos</label>
                        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                            <label className="shrink-0 w-24 h-20 rounded-lg border-2 border-dashed border-zinc-800 flex flex-col items-center justify-center cursor-pointer hover:border-amber-500 hover:bg-amber-500/5 transition-all">
                                <FiCamera className="text-zinc-700 mb-1" size={16} />
                                <span className="text-[8px] font-bold text-zinc-700 uppercase">Add</span>
                                <input type="file" multiple className="hidden" onChange={handleImageChange} accept="image/*" />
                            </label>
                            
                            {previews.map((src, i) => (
                                <div key={i} className="relative shrink-0 w-24 h-20 rounded-lg overflow-hidden border border-zinc-800 group">
                                    <img src={src} className="w-full h-full object-cover" alt="" />
                                    <button type="button" onClick={() => removeImage(i)} className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                        <FiX size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sticky-style Submit Button */}
                <div className="pt-2">
                    <button type="submit" disabled={isSubmitting} className="w-full bg-amber-500 text-black py-3 rounded-lg font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-amber-400 transition-all active:scale-[0.98] disabled:opacity-50">
                        {isSubmitting ? 'Saving...' : <><FiSave size={14}/> {initialData ? 'Update Profile' : 'Publish Business'}</>}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default BusinessForm;