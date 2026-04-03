import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ForgetPassword = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await fetch('http://127.0.0.1:8000/api/forgot-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ email })
        });
        setStatus('If that email exists, a link has been sent.');
    };

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-black font-sans text-white">
            {/* Left Side: Gradient Image Container */}
            <div className="relative hidden w-[45%] items-center justify-center p-12 lg:flex overflow-hidden">
                {/* Custom Gradient inspired by "coastal-village" */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#28555f] via-[#d29178] to-black opacity-90" />
                
                {/* Background Blur Layer */}
                <div className="absolute top-1/2 left-1/2 h-[85%] w-[90%] -translate-x-1/2 -translate-y-1/2 bg-inherit blur-[60px] opacity-40" />
                
                <img 
                    src="https://images.unsplash.com/photo-1539650116574-8efeb43e2750?q=80&w=2070" 
                    alt="Illustration"
                    className="relative z-10 h-[75%] max-h-[600px] w-[75%] max-w-[500px] rounded-[24px] object-cover shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
                />
                <div className="absolute bottom-12 left-12 text-[12px] tracking-wider text-white/25 uppercase">
                    Photography by Unsplash
                </div>
            </div>

            {/* Right Side: Form Container */}
            <div className="relative flex flex-1 items-center justify-center p-12 bg-gradient-to-r from-black/60 via-black/95 to-black">
                {/* Logo */}
                <div className="absolute top-12 left-12">
                    <span className="inline-block rounded-md border-[1.5px] border-white/30 px-3.5 py-2 text-sm font-semibold tracking-tight">
                        APP LOGO
                    </span>
                </div>

                {/* Circular Back Button */}
                <Link to="/login" className="absolute left-12 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/50 transition-all hover:bg-white/10 hover:text-white/80">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                </Link>

                <div className="w-full max-w-[420px]">
                    <h1 className="mb-8 text-[2rem] font-semibold leading-tight tracking-tighter">
                        Forgot password?
                    </h1>

                    <div className="mb-10 flex items-center gap-2 text-sm">
                        <span className="text-white/45">Remember it?</span>
                        <Link to="/login" className="text-white underline decoration-white/30 transition-opacity hover:opacity-70">
                            Back to login
                        </Link>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        <input 
                            type="email" 
                            required 
                            placeholder="Email Address"
                            className="w-full rounded-[10px] border border-white/10 bg-white/5 px-3.5 py-2.5 text-[13px] text-white placeholder:text-white/35 outline-none transition-all focus:border-white/20 focus:bg-white/10"
                            onChange={(e) => setEmail(e.target.value)}
                        />

                        <button type="submit" className="mt-3 flex items-center justify-between rounded-[10px] bg-white/15 px-3.5 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-white/20">
                            <span className="uppercase tracking-widest">Send Reset Link</span>
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </button>
                    </form>

                    {status && <p className="mt-6 text-[13px] text-orange-400 font-medium">{status}</p>}
                </div>
            </div>
        </div>
    );
};

export default ForgetPassword;