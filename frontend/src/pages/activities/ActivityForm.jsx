import React, { useState, useEffect } from 'react';
import { FiPlus, FiMapPin, FiTag, FiDollarSign, FiCalendar, FiImage, FiType, FiAlignLeft, FiSave, FiX } from 'react-icons/fi';

const ActivityForm = ({ initialData, onSuccess, isPopup }) => {
    const [images, setImages] = useState([]); 
    const [previews, setPreviews] = useState([]);
    const [form, setForm] = useState({
        title: "",
        description: "",
        category: "",
        location: "",
        price: 0,
        start_date: '',
        end_date: ''
    });

    useEffect(() => {
        if (initialData) {
            setForm({
                ...initialData,
                is_free: initialData.is_free === 1 || initialData.is_free === true
            });

            if (initialData.image_urls) {
                setPreviews(initialData.image_urls);
            }
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        const finalValue = type === 'checkbox' ? e.target.checked : 
                        value === "true" ? true : 
                        value === "false" ? false : value;
                        
        setForm(prev => ({...prev, [name] : finalValue}));
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setImages(prev => [...prev, ...files]);

        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviews(prev => [...prev, ...newPreviews]);
    };

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const isEditing = !!initialData?.id;
        
        const formData = new FormData();
        
        Object.keys(form).forEach(key => {
            if (key === 'is_free') {
                formData.append(key, form[key] ? '1' : '0');
            } else if (key !== 'image' && key !== 'image_urls') {
                formData.append(key, form[key]);
            }
        });

        images.forEach((file) => {
            formData.append('images[]', file);
        });

        const url = isEditing 
            ? `http://127.0.0.1:8000/api/activities/${initialData.id}` 
            : 'http://127.0.0.1:8000/api/activities/create';
            
        const method = 'POST';
        if (isEditing) formData.append('_method', 'PUT');

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
                body: formData 
            });

            if (res.ok) {
                onSuccess();
            } else {
                const errorData = await res.json();
                console.error("Validation Errors:", errorData.errors);
            }
        } catch (error) {
            console.error("Network error:", error);
        }
    }

    const inputWrapper = "relative flex flex-col space-y-1";
    const iconStyle = "absolute left-3 top-[34px] text-white/20 size-4";
    const inputClass = 'w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500/20 focus:border-orange-500/50 transition-all placeholder:text-white/10';
    const labelClass = "text-[9px] font-bold tracking-[1.5px] text-white/40 uppercase ml-1";

    const today = new Date().toISOString().split("T")[0];

    return (
        <div className={`w-full bg-[#1a1518]/95 border border-white/10 rounded-[24px] md:p-8 shadow-2xl backdrop-blur-xl max-h-[100vh] overflow-y-auto`}>
            <div className="text-center">
                <span className="text-orange-500 text-[9px] font-black tracking-[2px] uppercase">Creator Studio</span>
                <h2 className="text-2xl font-black text-white italic mt-1 tracking-tighter">
                    {initialData ? 'UPDATE EXPERIENCE' : 'CREATE NEW ACTIVITY'}
                </h2>
            </div>

            <form className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3" onSubmit={handleSubmit}>
                <div className={`${inputWrapper} md:col-span-2`}>
                    <label className={labelClass}>Activity Title</label>
                    <FiType className={iconStyle} />
                    <input type="text" name="title" value={form.title} placeholder="e.g. Midnight Food Tour" required className={inputClass} onChange={handleChange} />
                </div>

                <div className={`${inputWrapper} md:col-span-2`}>
                    <label className={labelClass}>Description</label>
                    <FiAlignLeft className="absolute left-3 top-[34px] text-white/20 size-4" />
                    <textarea name="description" value={form.description} placeholder="Describe the experience..." rows="2" required className={`${inputClass} resize-none pl-9`} onChange={handleChange} />
                </div>

                <div className="md:col-span-2 space-y-2">
                    <label className={labelClass}>Activity Gallery (At least 1 image)</label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {previews.map((src, index) => (
                            <div key={index} className="relative aspect-square rounded-lg overflow-hidden group border border-white/10">
                                <img src={src} className="w-full h-full object-cover" alt="Preview" />
                                <button type="button" onClick={() => removeImage(index)} className="absolute top-1 right-1 bg-black/60 p-1 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                    <FiX size={12} />
                                </button>
                            </div>
                        ))}
                        <label className="aspect-square rounded-lg border-2 border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-colors">
                            <FiPlus className="text-orange-500" size={20} />
                            <span className="text-[8px] text-white/40 font-bold uppercase mt-1 text-center">Add<br/>Photo</span>
                            <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
                        </label>
                    </div>
                </div>

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

                <div className={inputWrapper}>
                    <label className={labelClass}>Price (MAD)</label>
                    <FiDollarSign className={iconStyle} />
                    <input type="number" name="price" value={form.price} placeholder="0.00" disabled={form.is_free} required className={`${inputClass} disabled:opacity-30`} onChange={handleChange} />
                </div>

               <div className={inputWrapper}>
                <label className={labelClass}>Start Date</label>
                <FiCalendar className={iconStyle} />
                <input
                    type="date"
                    name="start_date"
                    value={form.start_date}
                    required
                    min={today}
                    className={inputClass}
                    onChange={handleChange}
                />
                </div>

                <div className={inputWrapper}>
                <label className={labelClass}>End Date</label>
                <FiCalendar className={iconStyle} />
                <input
                    type="date"
                    name="end_date"
                    value={form.end_date}
                    required
                    min={form.start_date || today} 
                    className={inputClass}
                    onChange={handleChange}
                />
                </div>


                <div className="md:col-span-2 mt-4">
                    <button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-black text-xs uppercase tracking-[2px] flex items-center justify-center gap-2 hover:shadow-lg transition-all active:scale-[0.98]">
                        {initialData ? <><FiSave size={16}/> Update</> : <><FiPlus size={16}/> Publish</>}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default ActivityForm;