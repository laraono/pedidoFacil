import { io, Socket } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const BACKEND_URL = API_URL.includes('http') ? API_URL.replace('/api/v1', '') : window.location.origin;

let socket: Socket | null = null;

export function connectSocket(room: string): Socket {
  if (!socket) {
    socket = io(BACKEND_URL, {
      withCredentials: true,
      transports: ['websocket'],
      reconnectionAttempts: 30,
      timeout: 10000,
    });

    socket.on('connect_error', (err: Error) => {
      console.error(`[Socket.IO] Falha na conexão: ${err.message}`);
    });
  }

  socket.emit('join_room', room);
  return socket;
}

export function getSocket(): Socket | null {
  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
