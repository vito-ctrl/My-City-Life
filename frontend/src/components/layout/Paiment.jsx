import React, { useState } from 'react';
import { FiShield } from 'react-icons/fi';

// 1. Accept props: isOpen, onClose, and activityId
const Paiment = ({ isOpen, onClose, activityId }) => {
    const [bookingDate, setBookingDate] = useState('');
    const [guests, setGuests] = useState(1);
    const [bookingMsg, setBookingMsg] = useState('');
    const [isOpenToGroup, setIsOpenToGroup] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleBooking = async () => {
        setBookingMsg('Processing booking...');
        setIsSubmitting(true);
        
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setBookingMsg('Please login first to book.');
                return;
            }

            const res = await fetch('http://127.0.0.1:8000/api/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    activity_id: activityId, // Using the prop here
                    booking_date: bookingDate,
                    number_of_guests: guests,
                    is_open_to_group: isOpenToGroup
                })
            });

            const data = await res.json();
            if (res.ok) {
                setBookingMsg(`Booking successful!`);
                // Close modal after success
                setTimeout(() => {
                    onClose();
                    setBookingMsg('');
                }, 2000);
            } else {
                setBookingMsg(`Error: ${data.error || 'Failed to book'}`);
            }
        } catch (e) {
            setBookingMsg('Error connecting to server.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // 2. Use the "isOpen" prop to control visibility
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95">
                <h3 className="text-xl font-bold text-white mb-4">Book Activity</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-zinc-400 text-xs font-bold uppercase tracking-widest mb-1.5">Date & Time</label>
                        <input 
                            type="datetime-local" 
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500 transition-colors"
                            value={bookingDate}
                            onChange={(e) => setBookingDate(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-zinc-400 text-xs font-bold uppercase tracking-widest mb-1.5">Number of Guests</label>
                        <input 
                            type="number" 
                            min="1"
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500 transition-colors"
                            value={guests}
                            onChange={(e) => setGuests(parseInt(e.target.value))}
                        />
                    </div>

                    <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 mt-2">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Shared Booking</h4>
                                <p className="text-[10px] text-zinc-400 mt-0.5">Allow others to see your interest and chat.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    className="sr-only peer"
                                    checked={isOpenToGroup}
                                    onChange={() => setIsOpenToGroup(!isOpenToGroup)}
                                />
                                <div className="w-9 h-5 bg-zinc-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-indigo-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                            </label>
                        </div>
                    </div>

                    {bookingMsg && (
                        <p className="text-sm font-semibold text-amber-500 pt-2">{bookingMsg}</p>
                    )}

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                        <button 
                            onClick={onClose} // Use the onClose prop
                            className="px-5 py-2.5 text-sm font-bold text-zinc-400 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleBooking}
                            disabled={!bookingDate || isSubmitting}
                            className="px-5 py-2.5 text-sm font-bold bg-amber-500 text-black rounded-xl hover:bg-amber-400 disabled:opacity-50 transition-all"
                        >
                            {isSubmitting ? 'Processing...' : 'Submit Booking'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Paiment;