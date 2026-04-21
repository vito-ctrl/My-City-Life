import { useEffect, useState } from 'react';
import { echo } from '../../services/Echo/echo';

export default function MatchNotification({ currentUserId }) {
    const [matchData, setMatchData] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        if (!currentUserId) return;

        const channel = echo.private(`user.${currentUserId}`);

        // ── Match found: both users need to vote ─────────────────────────
        channel.listen('SocialMatchFound', (event) => {
            console.log('SocialMatchFound:', event);
            setMatchData({
                type:         'vote',
                message:      event.message,
                activityName: event.activityName,
                voteId:       event.voteId,
            });
        });

        // ── Chat is ready: both users accepted → redirect ─────────────────
        channel.listen('ChatReady', (event) => {
            console.log('ChatReady:', event);
            // Show a brief "Chat Ready!" toast then redirect
            setMatchData({
                type:         'ready',
                message:      event.message,
                activityName: event.activityName,
                chatSlug:     event.chat_slug,
            });

            // Auto-redirect after 2 seconds
            setTimeout(() => {
                window.location.href = `/chat/${event.chat_slug}`;
            }, 2000);
        });

        return () => {
            channel.stopListening('SocialMatchFound');
            channel.stopListening('ChatReady');
        };
    }, [currentUserId]);

    const castVote = async (decision) => {
        setIsProcessing(true);
        try {
            const response = await fetch('http://127.0.0.1:8000/api/social/vote', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    vote_id:  matchData.voteId,
                    decision: decision,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                if (decision === 'accepted' && data.chat_slug) {
                    // Both already accepted → go immediately
                    window.location.href = `/chat/${data.chat_slug}`;
                } else if (decision === 'accepted') {
                    // Waiting for the other user
                    setMatchData({
                        type:    'waiting',
                        message: 'Waiting for the other person to accept...',
                        activityName: matchData.activityName,
                    });
                } else {
                    // Declined
                    setMatchData(null);
                }
            }
        } catch (error) {
            console.error('Error casting vote:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    if (!matchData) return null;

    // ── Chat Ready toast ──────────────────────────────────────────────────
    if (matchData.type === 'ready') {
        return (
            <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
                <div className="w-80 rounded-2xl bg-emerald-950 border border-emerald-800/60 p-5 shadow-2xl">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-xl">🎉</div>
                        <div>
                            <h3 className="text-sm font-black text-emerald-400 uppercase tracking-wider">Chat Ready!</h3>
                            <p className="text-xs text-emerald-200/60 mt-0.5">Redirecting you now...</p>
                        </div>
                    </div>
                    <div className="mt-3 h-1 bg-emerald-900 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full animate-[progress_2s_linear_forwards]" />
                    </div>
                </div>
            </div>
        );
    }

    // ── Waiting for other user toast ──────────────────────────────────────
    if (matchData.type === 'waiting') {
        return (
            <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
                <div className="w-80 rounded-2xl bg-slate-900 border border-indigo-800/40 p-5 shadow-2xl">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                            <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-white uppercase tracking-wider">You're In!</h3>
                            <p className="text-xs text-slate-400 mt-0.5">{matchData.message}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setMatchData(null)}
                        className="mt-4 w-full text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-slate-400 transition-colors"
                    >
                        Dismiss (we'll notify you when they accept)
                    </button>
                </div>
            </div>
        );
    }

    // ── Match Found: cast your vote ───────────────────────────────────────
    return (
        <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
            <div className="w-80 rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl">
                <div className="flex items-center gap-4 mb-5">
                    <div className="flex -space-x-2">
                        <div className="h-10 w-10 rounded-full border-2 border-slate-900 bg-indigo-600 flex items-center justify-center text-[10px] font-black text-white z-10 uppercase tracking-wider">
                            You
                        </div>
                        <div className="h-10 w-10 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-lg">
                            👋
                        </div>
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-white uppercase tracking-wider">Match Found!</h3>
                        <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{matchData.message}</p>
                    </div>
                </div>

                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 mb-4">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Activity</p>
                    <p className="text-xs font-bold text-indigo-400 mt-0.5">{matchData.activityName}</p>
                </div>

                <div className="space-y-2">
                    <button
                        onClick={() => castVote('accepted')}
                        disabled={isProcessing}
                        className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 px-4 py-2.5 text-[11px] font-black text-white uppercase tracking-widest transition-all active:scale-95"
                    >
                        {isProcessing ? 'Processing...' : '✓ Accept & Meet Up'}
                    </button>
                    <button
                        onClick={() => castVote('declined')}
                        disabled={isProcessing}
                        className="w-full rounded-xl bg-transparent border border-slate-700 hover:bg-slate-800 px-4 py-2.5 text-[11px] font-black text-slate-400 uppercase tracking-widest transition-all"
                    >
                        Maybe Later
                    </button>
                </div>
            </div>
        </div>
    );
}