import React, { useState, useEffect, useRef } from 'react';
import { FiBell, FiCheck, FiMessageSquare, FiUsers, FiClock, FiX } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const NotificationCenter = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!token) return;

        fetchUnreadCount();

        const interval = setInterval(fetchUnreadCount, 30000);

        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            clearInterval(interval);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [token]);

    const fetchUnreadCount = async () => {
        try {
            const res = await fetch('http://127.0.0.1:8000/api/notifications/unread-count', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setUnreadCount(data.count);
        } catch (err) {
            console.error("Fetch unread count error:", err);
        }
    };

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://127.0.0.1:8000/api/notifications', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setNotifications(data);
            setUnreadCount(0); 
        } catch (err) {
            console.error("Fetch notifications error:", err);
        } finally {
            setLoading(false);
        }
    };

    const toggleOpen = () => {
        if (!isOpen) fetchNotifications();
        setIsOpen(!isOpen);
    };

    const markAsRead = async (id, data, type) => {
        try {
            await fetch(`http://127.0.0.1:8000/api/notifications/${id}/read`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (type === 'chat_ready' && data?.chat_slug) {
                navigate(`/chat/${data.chat_slug}`);
            }

            setIsOpen(false);
            fetchNotifications();
        } catch (err) {
            console.error("Mark as read error:", err);
        }
    };

    if (!token) return null;

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={toggleOpen}
                className="relative p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all"
            >
                <FiBell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-[#0a0a0a] animate-pulse">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-4 w-80 sm:w-96 bg-[#121212] border border-white/10 rounded-[24px] shadow-2xl z-[200] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-5 border-b border-white/5 flex items-center justify-between">
                        <h3 className="text-sm font-black uppercase tracking-widest text-white">Notifications</h3>
                        <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Recent Activity</span>
                    </div>

                    <div className="max-h-[400px] overflow-y-auto">
                        {loading ? (
                            <div className="p-10 text-center">
                                <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-10 text-center">
                                <FiBell size={24} className="mx-auto mb-3 text-white/5" />
                                <p className="text-xs font-bold text-white/20 uppercase tracking-widest">All caught up!</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-white/5">
                                {notifications.map((n) => (
                                    <div 
                                        key={n.id}
                                        onClick={() => markAsRead(n.id, n.data, n.type)}
                                        className={`p-4 flex gap-4 cursor-pointer transition-colors ${n.is_read ? 'opacity-60' : 'bg-white/[0.02] hover:bg-white/[0.04]'}`}
                                    >
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                            n.type === 'social_match' ? 'bg-indigo-500/10 text-indigo-400' : 
                                            n.type === 'chat_ready' ? 'bg-emerald-500/10 text-emerald-400' : 
                                            'bg-orange-500/10 text-orange-400'
                                        }`}>
                                            {n.type === 'social_match' ? <FiUsers size={18} /> : 
                                             n.type === 'chat_ready' ? <FiMessageSquare size={18} /> : 
                                             <FiBell size={18} />}
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <p className="text-xs font-medium text-white leading-relaxed">
                                                {n.content}
                                            </p>
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-white/20 uppercase tracking-tighter">
                                                <FiClock size={10} />
                                                {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                        {!n.is_read && (
                                            <div className="w-2 h-2 rounded-full bg-orange-500 mt-2 flex-shrink-0" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationCenter;
