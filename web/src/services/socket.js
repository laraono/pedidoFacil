import { io } from 'socket.io-client';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

let socket = null;

export function connectSocket(room) {
    if (!socket) {
        socket = io(BACKEND_URL, {
            withCredentials: true,
            transports: ['websocket', 'polling'],
        });

        socket.on('connect', () => {
            console.log(`[Socket.IO] Conectado ao servidor. ID: ${socket.id}`);
        });

        socket.on('disconnect', (reason) => {
            console.log(`[Socket.IO] Desconectado: ${reason}`);
        });

        socket.on('connect_error', (err) => {
            console.error(`[Socket.IO] Erro de conexão: ${err.message}`);
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
