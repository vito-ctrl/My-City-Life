import { useEffect, useState } from 'react';
import { echo } from '../../services/Echo/echo'; // Import your echo instance

export default function MatchNotification({ currentUserId }) {
    const [matchData, setMatchData] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        if (!currentUserId) return;
            
        
        const channel = echo.private(`user.${currentUserId}`);
        // console.log("chanel : ",channel);
        
        const res = channel.listen('SocialMatchFound', (event) => {
            console.log('Match Found!', event);
            // In a real app, you'd pass the actual request_id in the event from the backend
            setMatchData({
                message: event.message,
                activityName: event.activityName,
                requestId: event.requestId // Make sure to add this to your Laravel Event!
            });
        });
        console.log("res : ", res);
        return () => {
            // console.log("SocialMatchFound")
            channel.stopListening('SocialMatchFound');
        };
    }, [currentUserId]);

    const handleAccept = async () => {
        setIsProcessing(true);

        try {
            const response = await fetch('http://127.0.0.1:8000/api/social/accept', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ request_id: matchData.requestId })
            });
            const data = await response.json();
            
            if (response.ok) {
                // Redirect to the new chat room!
                window.location.href = `/chat/${data.chat_slug}`;
            }
        } catch (error) {
            console.error("error in acssepting chat invit : ", error);
        } finally {
            setIsProcessing(false);
            setMatchData(null);
        }
    };

    const handleDecline = async () => {
        setMatchData(null);
        // Call the decline endpoint in the background
        await fetch('/api/social/decline', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ request_id: matchData.requestId })
        });
    };

    if (!matchData) return null;

    return (
        <div className="fixed bottom-5 right-5 z-50 animate-fade-in-up">
            <div className="max-w-sm w-80 rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl">
                <div className="flex items-center space-x-4">
                    <div className="flex -space-x-2">
                        <div className="h-10 w-10 rounded-full border-2 border-slate-900 bg-indigo-500 flex items-center justify-center text-xs font-bold text-white z-10">YOU</div>
                        <div className="h-10 w-10 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center">
                            <span className="text-lg">👋</span>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-white">Match Found!</h3>
                        <p className="text-xs text-slate-400 line-clamp-2">{matchData.message}</p>
                    </div>
                </div>

                <div className="mt-5 space-y-3">
                    <button 
                        onClick={handleAccept}
                        disabled={isProcessing}
                        className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-colors disabled:opacity-50"
                    >
                        {isProcessing ? 'Connecting...' : 'Accept & Chat'}
                    </button>
                    <button 
                        onClick={handleDecline}
                        className="w-full rounded-lg bg-transparent border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors"
                    >
                        Maybe Later
                    </button>
                </div>
            </div>
        </div>
    );
}