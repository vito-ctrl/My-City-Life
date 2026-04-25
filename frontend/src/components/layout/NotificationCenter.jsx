import React, { useEffect, useRef, useState } from 'react';
import {
    FiBell,
    FiBriefcase,
    FiCheckCircle,
    FiClock,
    FiXCircle,
} from 'react-icons/fi';
import { echo } from '../../services/Echo/echo';

const API_BASE = 'http://127.0.0.1:8000';
const MAX_NOTIFICATIONS = 20;

const TYPE_CONFIG = {
    booking_requested: {
        label: 'New Booking Request',
        icon: FiBell,
        iconClass: 'bg-amber-500/10 text-amber-300',
        badgeClass: 'border-amber-500/20 bg-amber-500/10 text-amber-300',
    },
    booking_confirmed: {
        label: 'Booking Confirmed',
        icon: FiCheckCircle,
        iconClass: 'bg-emerald-500/10 text-emerald-300',
        badgeClass: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300',
    },
    booking_cancelled: {
        label: 'Booking Cancelled',
        icon: FiXCircle,
        iconClass: 'bg-red-500/10 text-red-300',
        badgeClass: 'border-red-500/20 bg-red-500/10 text-red-300',
    },
    reservation_requested: {
        label: 'New Reservation Request',
        icon: FiBriefcase,
        iconClass: 'bg-sky-500/10 text-sky-300',
        badgeClass: 'border-sky-500/20 bg-sky-500/10 text-sky-300',
    },
    reservation_confirmed: {
        label: 'Reservation Confirmed',
        icon: FiCheckCircle,
        iconClass: 'bg-emerald-500/10 text-emerald-300',
        badgeClass: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300',
    },
    reservation_cancelled: {
        label: 'Reservation Cancelled',
        icon: FiXCircle,
        iconClass: 'bg-red-500/10 text-red-300',
        badgeClass: 'border-red-500/20 bg-red-500/10 text-red-300',
    },
};

const formatRelativeTime = (value) => {
    if (!value) return 'Just now';

    const date = new Date(value);
    const diffSeconds = Math.max(1, Math.floor((date.getTime() - Date.now()) / 1000));
    const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

    if (Math.abs(diffSeconds) < 60) return formatter.format(diffSeconds, 'second');

    const diffMinutes = Math.floor(diffSeconds / 60);
    if (Math.abs(diffMinutes) < 60) return formatter.format(diffMinutes, 'minute');

    const diffHours = Math.floor(diffMinutes / 60);
    if (Math.abs(diffHours) < 24) return formatter.format(diffHours, 'hour');

    const diffDays = Math.floor(diffHours / 24);
    return formatter.format(diffDays, 'day');
};

const formatDateTime = (value) => {
    if (!value) return null;

    return new Intl.DateTimeFormat('en-GB', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(value));
};

const buildMeta = (notification) => {
    const data = notification.data ?? {};

    if (notification.type.startsWith('booking_')) {
        return [
            data.number_of_guests ? `${data.number_of_guests} guest${data.number_of_guests !== 1 ? 's' : ''}` : null,
            data.booking_date ? formatDateTime(data.booking_date) : null,
            data.amount !== undefined && data.amount !== null ? `${data.amount} MAD` : null,
        ].filter(Boolean);
    }

    if (notification.type.startsWith('reservation_')) {
        return [
            data.business_name ?? null,
            data.item_name ?? null,
            data.start_time ? formatDateTime(data.start_time) : null,
        ].filter(Boolean);
    }

    return [];
};

const upsertNotification = (items, incoming) => {
    const filtered = items.filter((item) => item.id !== incoming.id);
    return [incoming, ...filtered].slice(0, MAX_NOTIFICATIONS);
};

const NotificationCard = ({ notification, onRead }) => {
    const config = TYPE_CONFIG[notification.type] ?? TYPE_CONFIG.booking_requested;
    const Icon = config.icon;
    const meta = buildMeta(notification);

    return (
        <button
            type="button"
            onClick={() => onRead(notification.id)}
            className={`w-full text-left p-4 transition-colors ${
                notification.is_read
                    ? 'opacity-60 hover:bg-white/[0.03]'
                    : 'bg-white/[0.02] hover:bg-white/[0.05]'
            }`}
        >
            <div className="flex gap-4">
                <div className={`mt-0.5 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl ${config.iconClass}`}>
                    <Icon size={18} />
                </div>

                <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-center justify-between gap-3">
                        <span className={`rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.22em] ${config.badgeClass}`}>
                            {config.label}
                        </span>
                        {!notification.is_read && <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full bg-orange-500" />}
                    </div>

                    <p className="text-sm font-semibold leading-relaxed text-white">
                        {notification.content}
                    </p>

                    {meta.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                            {meta.map((item) => (
                                <span
                                    key={item}
                                    className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white/45"
                                >
                                    {item}
                                </span>
                            ))}
                        </div>
                    )}

                    <div className="mt-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-white/25">
                        <FiClock size={11} />
                        {formatRelativeTime(notification.created_at)}
                    </div>
                </div>
            </div>
        </button>
    );
};

const NotificationCenter = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const dropdownRef = useRef(null);
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const currentUser = storedUser ? JSON.parse(storedUser) : null;

    const fetchUnreadCount = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/notifications/unread-count`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setUnreadCount(data.count ?? 0);
        } catch (err) {
            console.error('Fetch unread count error:', err);
        }
    };

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/notifications`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setNotifications(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Fetch notifications error:', err);
        } finally {
            setLoading(false);
        }
    };

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

    useEffect(() => {
        if (!token || !currentUser?.id) return;

        const channel = echo.private(`user.${currentUser.id}`);

        const handleIncoming = (event) => {
            const incoming = event.notification;

            if (!incoming) {
                fetchUnreadCount();
                return;
            }

            setNotifications((items) => upsertNotification(items, incoming));

            if (!incoming.is_read) {
                setUnreadCount((count) => count + 1);
            }
        };

        channel.listen('.notification.created', handleIncoming);

        return () => {
            channel.stopListening('.notification.created');
            echo.leave(`user.${currentUser.id}`);
        };
    }, [token, currentUser?.id]);

    const toggleOpen = () => {
        if (!isOpen) {
            fetchNotifications();
        }

        setIsOpen((value) => !value);
    };

    const markAsRead = async (id) => {
        const target = notifications.find((item) => item.id === id);

        try {
            await fetch(`${API_BASE}/api/notifications/${id}/read`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });

            setNotifications((items) =>
                items.map((item) =>
                    item.id === id ? { ...item, is_read: true } : item
                )
            );

            if (target && !target.is_read) {
                setUnreadCount((count) => Math.max(0, count - 1));
            }
        } catch (err) {
            console.error('Mark as read error:', err);
        }
    };

    if (!token) return null;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={toggleOpen}
                className="relative rounded-xl border border-white/10 bg-white/5 p-2.5 text-white/60 transition-all hover:bg-white/10 hover:text-white"
            >
                <FiBell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#0a0a0a] bg-orange-500 text-[10px] font-black text-white animate-pulse">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 z-[200] mt-4 w-80 overflow-hidden rounded-[28px] border border-white/10 bg-[#121212] shadow-2xl sm:w-[28rem]">
                    <div className="border-b border-white/5 bg-gradient-to-b from-white/[0.04] to-transparent p-5">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-[0.24em] text-white">
                                    Notifications
                                </h3>
                                <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.22em] text-white/25">
                                    Live booking and reservation updates
                                </p>
                            </div>
                            <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.22em] text-emerald-300">
                                Live
                            </div>
                        </div>
                    </div>

                    <div className="max-h-[420px] overflow-y-auto">
                        {loading ? (
                            <div className="p-10 text-center">
                                <div className="mx-auto h-6 w-6 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-10 text-center">
                                <FiBell size={26} className="mx-auto mb-3 text-white/5" />
                                <p className="text-xs font-black uppercase tracking-[0.22em] text-white/20">
                                    All caught up
                                </p>
                                <p className="mt-2 text-[11px] text-white/25">
                                    New booking and reservation updates will appear here.
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-white/5">
                                {notifications.map((notification) => (
                                    <NotificationCard
                                        key={notification.id}
                                        notification={notification}
                                        onRead={markAsRead}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {notifications.length > 0 && (
                        <div className="border-t border-white/5 px-5 py-3 text-[10px] font-bold uppercase tracking-[0.22em] text-white/25">
                            {unreadCount} unread updates
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationCenter;
