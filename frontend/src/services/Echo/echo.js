import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export const echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST || '127.0.0.1',
    wsPort: import.meta.env.VITE_REVERB_PORT ?? 8080,
    forceTLS: import.meta.env.VITE_REVERB_SCHEME === 'https',
    enabledTransports: ['ws', 'wss'],
    authEndpoint: `${API_BASE}/broadcasting/auth`,
    auth: {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    }
});

export const refreshEchoAuth = () => {
    const token = localStorage.getItem('token');
    if (echo && echo.connector && echo.connector.options.auth) {
        echo.connector.options.auth.headers.Authorization = `Bearer ${token}`;
    }
};
