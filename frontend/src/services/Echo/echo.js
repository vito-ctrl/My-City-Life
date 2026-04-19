import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

// Debugging line: add this to see if the key is actually loading
console.log('Pusher Key:', import.meta.env.VITE_REVERB_APP_KEY);

export const echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY, // This must not be undefined
    wsHost: import.meta.env.VITE_REVERB_HOST || window.location.hostname,
    wsPort: import.meta.env.VITE_REVERB_PORT ?? 8080,
    forceTLS: import.meta.env.VITE_REVERB_SCHEME === 'https',
    enabledTransports: ['ws', 'wss'],
    authEndpoint: 'http://localhost:8000/broadcasting/auth',
    // Since you are using JWT for your booking system
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