import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const BACKEND_URL = API_URL.includes('http') ? API_URL.replace('/api/v1', '') : window.location.origin;

let socket = null;

export function connectSocket(room) {
    if (!socket) {
        socket = io(BACKEND_URL, {
            withCredentials: true,
            transports: ['websocket'], 
            reconnectionAttempts: 5,
            timeout: 10000,
        });

        socket.on('connect', () => {
            console.log(`[Socket.IO] Conectado com sucesso em: ${BACKEND_URL}`);
        });

        socket.on('connect_error', (err) => {
            console.error(`[Socket.IO] Falha na conexão: ${err.message}`);
        });
    }

    socket.emit('join_room', room);

    return socket;
}

export function getSocket() {
    return socket;
}

export function disconnectSocket() {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
}