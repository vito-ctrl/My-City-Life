import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiSend, FiArrowLeft, FiMoreVertical, FiClock, FiShield } from 'react-icons/fi';
import { echo } from '../../services/Echo/echo';

const ChatRoom = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [chat, setChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef(null);
    const userStr = localStorage.getItem('user');
    const currentUser = userStr ? JSON.parse(userStr) : null;

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        const fetchChatData = async () => {
            if (!slug) return;

            try {
                const response = await fetch(`http://127.0.0.1:8000/api/social/chats/${slug}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                const data = await response.json();
                // console.log("chat res", data || "hi"); 
                if (response.ok) {
                    setChat(data.chat);
                    setMessages(data.messages);
                } else {
                    navigate('/dashboard');
                }
            } catch (error) {
                console.error("Error fetching chat:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchChatData();
    }, [slug, navigate]);

    useEffect(() => {
        if (!slug) return;
        refreshEchoAuth()
        
        const channel = echo.private(`chat.${slug}`);
        
        channel.listen('ChatMessageSent', (event) => {
            console.log('New Message Received:', event);
            setMessages(prev => {
                // Prevent duplicate bubbles if the message is already in state
                if (prev.some(msg => msg.id === event.id)) return prev;
                return [...prev, event];
            });
        });

        return () => {
            channel.stopListening('ChatMessageSent');
        };
    }, [slug]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || isSending) return;

        setIsSending(true);
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/social/chats/${slug}/message`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                    'Accept' : 'application/json'
                },
                body: JSON.stringify({ message: newMessage })
            });

            const data = await response.json();
            console.log("sended message : ", data);
            if (response.ok) {
                setMessages(prev => [...prev, data[0]]); 
                setNewMessage('');
            }
        } catch (error) {
            console.error("Error sending message:", error);
        } finally {
            setIsSending(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-t-2 border-indigo-500 border-r-2 border-transparent rounded-full animate-spin"></div>
                    <p className="text-zinc-500 text-xs font-black uppercase tracking-[2px]">Securing Chat...</p>
                </div>
            </div>
        );
    }

    const otherUser = chat?.users.find(u => u.id !== currentUser?.id);

    return (
        <div className="min-h-screen bg-zinc-950 flex flex-col h-screen overflow-hidden text-zinc-100 font-inter">
            {/* Header */}
            <header className="flex-shrink-0 bg-zinc-900/50 backdrop-blur-xl border-b border-zinc-800/80 px-6 py-4 flex items-center justify-between z-10">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate(-1)}
                        className="p-2.5 rounded-xl bg-zinc-800/50 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all border border-zinc-700/50"
                    >
                        <FiArrowLeft size={18} />
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-sm font-black uppercase tracking-wider">{otherUser?.name || 'Shared Interest'}</h2>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                        </div>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">
                            Discussion: <span className="text-indigo-400">{chat?.activity?.title}</span>
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="hidden md:flex flex-col items-end mr-4">
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Privacy Active</span>
                        <span className="flex items-center gap-1 text-[9px] text-emerald-500 font-black uppercase">
                            <FiShield size={10} /> Secure Connection
                        </span>
                    </div>
                    <button className="p-2.5 rounded-xl text-zinc-500 hover:text-white transition-colors">
                        <FiMoreVertical size={20} />
                    </button>
                </div>
            </header>

            {/* Messages Area */}
            <main className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                <div className="max-w-3xl mx-auto space-y-8">
                    {/* Safety Banner */}
                    <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-2xl p-4 flex gap-4 items-start">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 flex-shrink-0 animate-pulse">
                            <FiShield size={20} />
                        </div>
                        <div>
                            <h4 className="text-xs font-black text-indigo-400 uppercase tracking-wider mb-1">Safety First</h4>
                            <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                                Coordination for "{chat?.activity?.title}". Remember to meet in public places and let someone know your plans.
                            </p>
                        </div>
                    </div>

                    {/* Chat Bubbles */}
                    {messages.map((msg, idx) => {
                        const isSystem = msg.sender_id === null;
                        const isMe = msg.sender_id === currentUser?.id;

                        if (isSystem) {
                            return (
                                <div key={msg.id || idx} className="flex justify-center my-6">
                                    <div className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-full">
                                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[2px] text-center">
                                            {msg.message}
                                        </p>
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <div key={`msg-${msg.id}-${idx}`} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group animate-in fade-in slide-in-from-bottom-2`}>
                                <div className={`flex flex-col max-w-[80%] md:max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
                                    <div className={`p-4 rounded-3xl text-sm font-medium leading-relaxed ${
                                        isMe 
                                            ? 'bg-indigo-600 text-white rounded-tr-none shadow-xl shadow-indigo-600/10' 
                                            : 'bg-zinc-900 text-zinc-300 rounded-tl-none border border-zinc-800'
                                    }`}>
                                        {msg.message}
                                    </div>
                                    <div className="mt-1.5 flex items-center gap-2 text-[10px] text-zinc-600 font-bold uppercase tracking-widest px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <FiClock size={10} />
                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>
            </main>

            {/* Input Area */}
            <footer className="flex-shrink-0 p-6 bg-zinc-950/80 backdrop-blur-xl border-t border-zinc-900">
                <div className="max-w-3xl mx-auto">
                    <form onSubmit={handleSendMessage} className="relative group">
                        <input 
                            type="text" 
                            className="w-full h-16 bg-zinc-900 border border-zinc-800 rounded-3xl pl-6 pr-20 text-sm font-medium focus:outline-none focus:border-indigo-500 transition-all placeholder:text-zinc-600"
                            placeholder="Collaborate on a plan..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                        />
                        <button 
                            type="submit"
                            disabled={!newMessage.trim() || isSending}
                            className="absolute right-2 top-1/2 -translate-y-1/2 h-12 w-12 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white rounded-2xl flex items-center justify-center transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
                        >
                            <FiSend size={18} />
                        </button>
                    </form>
                    <div className="mt-4 flex justify-center gap-6">
                        <span className="text-[9px] font-black text-zinc-700 uppercase tracking-[2px] italic">End-to-end encrypted</span>
                        <span className="text-[9px] font-black text-zinc-700 uppercase tracking-[2px] italic">Powered by MyCityLife Social</span>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default ChatRoom;
