import React, { useState, useEffect } from 'react';
import { FiX, FiCheck, FiCalendar, FiClock, FiMessageSquare } from 'react-icons/fi';

const BusinessReservationModal = ({ isOpen, onClose, selectedItem }) => {
    const [formData, setFormData] = useState({
        reservable_item_id: '',
        start_time: '',
        end_time: '',
        notes: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Sync the selected item from the details page to the form state
    useEffect(() => {
        if (selectedItem) {
            setFormData(prev => ({ ...prev, reservable_item_id: selectedItem.id }));
        }
    }, [selectedItem]);

    const handleReservation = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage({ type: 'info', text: 'Securing your spot...' });

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://127.0.0.1:8000/api/business/reservations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (res.ok) {
                setMessage({ type: 'success', text: 'Reservation requested! Redirecting...' });
                setTimeout(() => {
                    onClose();
                    setMessage({ type: '', text: '' });
                }, 2000);
            } else {
                setMessage({ type: 'error', text: data.error || 'This slot is unavailable.' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Connection failed. Try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-5 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
                    <div>
                        <h3 className="text-white font-black uppercase tracking-widest text-xs">Confirm Reservation</h3>
                        <p className="text-[10px] text-zinc-500 font-bold mt-0.5 uppercase tracking-tighter">
                            Booking: <span className="text-amber-500">{selectedItem?.name}</span>
                        </p>
                    </div>
                    <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
                        <FiX size={20} />
                    </button>
                </div>

                <form onSubmit={handleReservation} className="p-6 space-y-5">
                    {/* Time Selection Grid */}
                    <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-1.5">
                            <label className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                                <FiCalendar className="text-amber-500" /> Start Date & Time
                            </label>
                            <input 
                                type="datetime-local" 
                                required
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-amber-500 outline-none transition-all"
                                onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                                <FiClock className="text-amber-500" /> End Date & Time
                            </label>
                            <input 
                                type="datetime-local" 
                                required
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-amber-500 outline-none transition-all"
                                onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                            />
                        </div>
                    </div>

                    {/* Notes Field */}
                    <div className="space-y-1.5">
                        <label className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                            <FiMessageSquare className="text-amber-500" /> Special Requests
                        </label>
                        <textarea 
                            rows="3"
                            placeholder="e.g. i will be happy if i reserve it"
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-amber-500 outline-none resize-none transition-all placeholder:text-zinc-700"
                            onChange={(e) => setFormData({...formData, notes: e.target.value})}
                        />
                    </div>

                    {/* Status Messages */}
                    {message.text && (
                        <div className={`text-[10px] font-bold uppercase tracking-widest text-center py-2 rounded-lg ${
                            message.type === 'error' ? 'text-red-500 bg-red-500/10' : 'text-amber-500 bg-amber-500/10'
                        }`}>
                            {message.text}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="pt-2 flex flex-col gap-3">
                        <button 
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-black py-4 rounded-xl transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest shadow-lg shadow-amber-500/10"
                        >
                            {isSubmitting ? 'Processing...' : <><FiCheck strokeWidth={3} /> Request Reservation</>}
                        </button>
                        
                        <button 
                            type="button"
                            onClick={onClose}
                            className="w-full text-zinc-500 hover:text-zinc-300 text-[10px] font-bold uppercase tracking-widest transition-colors"
                        >
                            Nevermind, take me back
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BusinessReservationModal;