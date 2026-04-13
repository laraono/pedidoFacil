import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';

let io: SocketIOServer;

export function initSocket(httpServer: HttpServer): SocketIOServer {
    io = new SocketIOServer(httpServer, {
        cors: {
            origin: [
                process.env.FRONTEND_URL || 'http://localhost:5173',
                'http://localhost:8081',
                'exp://localhost:8081',
            ],
            credentials: true,
        },
    });

    io.on('connection', (socket: Socket) => {
        console.log(`[Socket.IO] Cliente conectado: ${socket.id}`);

        socket.on('join_room', (room: string) => {
            socket.join(room);
            console.log(`[Socket.IO] ${socket.id} entrou na sala: ${room}`);
        });

        socket.on('disconnect', () => {
            console.log(`[Socket.IO] Cliente desconectado: ${socket.id}`);
        });
    });

    return io;
}

export function getIO(): SocketIOServer {
    if (!io) {
        throw new Error('Socket.IO não foi inicializado. Chame initSocket() primeiro.');
    }
    return io;
}