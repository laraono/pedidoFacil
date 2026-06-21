import { io, Socket } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const BACKEND_URL = API_URL.includes('http') ? API_URL.replace('/api/v1', '') : window.location.origin;

let socket: Socket | null = null;
const joinedRooms = new Set<string>();

export function connectSocket(room: string): Socket {
  if (!socket) {
    let errorCount = 0;

    socket = io(BACKEND_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnectionAttempts: Infinity,
      timeout: 10000,
      auth: (cb) => cb({ token: localStorage.getItem('accessToken') }),
    });

    socket.on('connect_error', (err: Error) => {
      errorCount++;
      if (errorCount >= 3) console.error(`[Socket.IO] Falha na conexão: ${err.message}`);
    });

    // re-entra nas salas e reseta contador a cada (re)conexão
    socket.on('connect', () => {
      errorCount = 0;
      joinedRooms.forEach((r) => socket?.emit('join_room', r));
    });
  }

  joinedRooms.add(room);
  if (socket.connected) socket.emit('join_room', room);
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
  joinedRooms.clear();
}
