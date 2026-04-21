import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMessageSquare, FiSearch, FiClock, FiChevronRight, FiUsers, FiShield } from 'react-icons/fi';

const TYPE_CONFIG = {
    social: {
        label: 'Social Match',
        icon: <FiUsers size={12} />,
        color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
        dot: 'bg-indigo-500',
    },
    support: {
        label: 'Support',
        icon: <FiShield size={12} />,
        color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        dot: 'bg-emerald-500',
    },
};

const MessagesPage = () => {
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchChats = async () => {
            try {
                const response = await fetch('http://127.0.0.1:8000/api/social/chats', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Accept': 'application/json',
                    },
                });
                const data = await response.json();
                if (response.ok) setChats(data);
            } catch (error) {
                console.error('Failed to load chats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchChats();
    }, []);

    const filtered = chats.filter(chat =>
        chat.activity?.title?.toLowerCase().includes(search.toLowerCase()) ||
        chat.users?.some(u => u.name?.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 font-inter">
            {/* Header */}
            <header className="sticky top-0 z-20 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-900 px-6 py-8">
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tighter text-white">
                            Social <span className="text-indigo-500">Hub</span>
                        </h1>
                        <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[3px] mt-1">
                            Coordinate your city adventures
                        </p>
                    </div>

                    {/* Search */}
                    <div className="relative group max-w-md w-full">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-indigo-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search conversations..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-indigo-500/50 transition-all"
                        />
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto p-6">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
                        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Retrieving Chats...</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {filtered.length > 0 ? filtered.map((chat) => {
                            const typeConf = TYPE_CONFIG[chat.type] || TYPE_CONFIG.social;
                            const lastMsg  = chat.messages?.[0];

                            return (
                                <div
                                    key={chat.id}
                                    // ✅ Fixed: route is /chat/:slug not /messages/:slug
                                    onClick={() => navigate(`/chat/${chat.slug}`)}
                                    className="group relative bg-zinc-900/30 hover:bg-zinc-900/60 border border-zinc-800/50 hover:border-indigo-500/30 rounded-3xl p-5 transition-all cursor-pointer flex items-center gap-6"
                                >
                                    {/* Icon */}
                                    <div className="relative flex-shrink-0">
                                        <div className="w-16 h-16 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-500 group-hover:text-indigo-400 transition-colors">
                                            <FiMessageSquare size={24} />
                                        </div>
                                        {chat.unread_count > 0 && (
                                            <span className="absolute -top-2 -right-2 bg-indigo-600 text-[10px] font-black px-2 py-1 rounded-lg border-2 border-zinc-950 animate-bounce">
                                                {chat.unread_count}
                                            </span>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1 gap-2">
                                            <h3 className="text-sm font-black uppercase tracking-wider truncate text-zinc-200">
                                                {chat.activity?.title || 'Unknown Activity'}
                                            </h3>
                                            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest flex items-center gap-1 flex-shrink-0">
                                                <FiClock size={10} />
                                                {lastMsg ? new Date(lastMsg.created_at).toLocaleDateString() : 'New'}
                                            </span>
                                        </div>

                                        <p className="text-zinc-500 text-xs font-medium truncate pr-10">
                                            {lastMsg?.message || 'No messages yet. Start the conversation!'}
                                        </p>

                                        <div className="mt-3 flex items-center gap-2 flex-wrap">
                                            {/* Chat type badge */}
                                            <span className={`flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md border ${typeConf.color}`}>
                                                {typeConf.icon}
                                                {typeConf.label}
                                            </span>

                                            {/* Participants */}
                                            {chat.users?.slice(0, 2).map((user) => (
                                                <span key={user.id} className="text-[9px] font-black text-zinc-600 uppercase tracking-widest bg-zinc-800/50 px-2 py-1 rounded-md border border-zinc-700/50">
                                                    {user.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="text-zinc-700 group-hover:text-indigo-500 transition-colors flex-shrink-0">
                                        <FiChevronRight size={20} />
                                    </div>

                                    <div className="absolute inset-0 rounded-3xl bg-indigo-500/0 group-hover:bg-indigo-500/[0.02] transition-colors pointer-events-none" />
                                </div>
                            );
                        }) : (
                            <div className="text-center py-20 border-2 border-dashed border-zinc-900 rounded-3xl">
                                <p className="text-zinc-600 text-xs font-black uppercase tracking-[3px]">
                                    {search ? 'No conversations match your search' : 'No Active Chats Found'}
                                </p>
                                {!search && (
                                    <button
                                        onClick={() => navigate('/Dashboard')}
                                        className="mt-6 px-8 py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
                                    >
                                        Browse Activities
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default MessagesPage;