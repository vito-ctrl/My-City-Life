import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import image from '../../../assets/images/Marrakech_.jpg';


const ResetPassword = () => {
    const [form, setForm] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const res = await fetch('http://127.0.0.1:8000/api/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...form, token })
        });
        if(res.ok) navigate('/login');
        setLoading(false);
    };

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-black font-sans text-white">
            {/* Left Side: Moroccan Riad Palette */}
            <div className="relative hidden w-[45%] items-center justify-center p-12 lg:flex overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#153232] via-[#2d8c99] to-black opacity-95" />
                <img 
                    src={image}
                    alt="Reset"
                    className="relative z-10 h-[75%] max-h-[600px] w-[75%] max-w-[500px] rounded-[24px] object-cover shadow-2xl"
                />
            </div>

            {/* Right Side: Form */}
            <div className="relative flex flex-1 items-center justify-center p-12 bg-gradient-to-r from-black/60 via-black/95 to-black">
                <div className="absolute top-12 left-12">
                    <span className="rounded-md border-[1.5px] border-white/30 px-3.5 py-2 text-sm font-semibold uppercase tracking-widest">
                        Security
                    </span>
                </div>

                <div className="w-full max-w-[420px]">
                    <h1 className="mb-4 text-[2rem] font-semibold tracking-tighter">Reset Password</h1>
                    <p className="mb-10 text-[13px] leading-relaxed text-white/35">
                        Please verify your email and enter a new secure password.
                    </p>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        <input 
                            type="email" 
                            name="email"
                            required 
                            placeholder="Verify Email"
                            className="w-full rounded-[10px] border border-white/10 bg-white/5 px-3.5 py-2.5 text-[13px] outline-none transition-all focus:bg-white/10"
                            onChange={e => setForm(prev => ({...prev, [e.target.name]: e.target.value}))}
                        />

                        <div className="relative">
                            <input 
                                type="password" 
                                name="password"
                                required 
                                placeholder="New Password"
                                className="w-full rounded-[10px] border border-white/10 bg-white/5 px-3.5 py-2.5 text-[13px] outline-none transition-all focus:bg-white/10"
                                onChange={e => setForm(prev => ({...prev, [e.target.name]: e.target.value}))}
                            />
                        </div>

                        <button type="submit" disabled={loading} className="mt-3 flex items-center justify-between rounded-[10px] bg-white/15 px-3.5 py-2.5 text-[13px] font-semibold transition-all hover:bg-white/20 disabled:opacity-50">
                            <span>{loading ? 'Updating...' : 'Update Password'}</span>
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7-7 7M5 12h14" />
                                </svg>
                            </div>
                        </button>
                    </form>

                    <div className="mt-10 border-t border-white/5 pt-8">
                        <ul className="space-y-2 text-[10px] font-bold uppercase tracking-widest text-white/30">
                            <li className="flex items-center gap-2"><div className="h-1 w-1 rounded-full bg-orange-500"/> Min 8 characters</li>
                            <li className="flex items-center gap-2"><div className="h-1 w-1 rounded-full bg-orange-500"/> Letters and numbers</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;