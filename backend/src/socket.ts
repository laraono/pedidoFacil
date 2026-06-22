import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { AppDataSource } from './database';
import { Establishment } from './database/entity/Establishment';

let io: SocketIOServer;

const STAFF_ROOMS = new Set(['kitchen', 'cashier', 'waiter']);

export function initSocket(httpServer: HttpServer): SocketIOServer {
    io = new SocketIOServer(httpServer, {
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:5173',
            credentials: true,
        },
    });

    io.use(async (socket: Socket, next) => {
        const token = socket.handshake.auth?.token as string | undefined;
        const totemCode = socket.handshake.auth?.totemCode as string | undefined;

        if (token) {
            try {
                const payload = jwt.verify(token, process.env.JWT_SECRET as string);
                (socket as any).usuario = payload;
                return next();
            } catch {
                return next(new Error('Token inválido.'));
            }
        }

        if (totemCode) {
            try {
                const repo = AppDataSource.getRepository(Establishment);
                const establishment = await repo.findOne({
                    where: { selfServiceCode: totemCode.trim().toUpperCase() },
                });
                if (!establishment?.temAutoatendimento) {
                    return next(new Error('Código do totem inválido ou autoatendimento desativado.'));
                }
                (socket as any).usuario = { role: 'TOTEM', estabelecimento: establishment.id };
                return next();
            } catch {
                return next(new Error('Erro ao validar totem.'));
            }
        }

        return next(new Error('Autenticação necessária.'));
    });

    io.on('connection', (socket: Socket) => {
        const usuario = (socket as any).usuario;
        const role = usuario?.role;
        const estabId = usuario?.estabelecimento;

        socket.on('join_room', (room: unknown) => {
            if (typeof room !== 'string') return;
            const r = room.trim();
            if (role === 'TOTEM') {
                if (r.startsWith('totem_')) { socket.join(r); return; }
            } else {
                if (STAFF_ROOMS.has(r) && estabId) { socket.join(`${r}_${estabId}`); return; }
            }
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