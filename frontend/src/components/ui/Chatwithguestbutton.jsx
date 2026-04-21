import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMessageSquare, FiLoader } from 'react-icons/fi';

/**
 * Drop this button into your OrganizerBookings booking row/card.
 *
 * Usage:
 *   <ChatWithGuestButton bookingId={booking.id} />
 *
 * Props:
 *   bookingId  – the ID of the booking row (required)
 */
const ChatWithGuestButton = ({ bookingId }) => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const openChat = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://127.0.0.1:8000/api/support/chats', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ booking_id: bookingId }),
            });

            const data = await response.json();

            if (response.ok) {
                navigate(`/chat/${data.chat_slug}`);
            } else {
                console.error('Failed to open chat:', data);
            }
        } catch (error) {
            console.error('Error opening support chat:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={openChat}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-600/30 text-emerald-400 text-[11px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
        >
            {loading
                ? <FiLoader size={13} className="animate-spin" />
                : <FiMessageSquare size={13} />
            }
            {loading ? 'Opening...' : 'Chat with Guest'}
        </button>
    );
};

export default ChatWithGuestButton;