import { io, Socket } from "socket.io-client";
import { appConfig } from "./apiConfig";

let socket: Socket | null = null;

export function connectMobileSocket(): Socket | null {
  if (socket) return socket;

  if (!appConfig.SOCKET_URL) {
    console.warn("[Mobile Socket] SOCKET_URL não configurado. App ainda não configurado.");
    return null;
  }

  socket = io(appConfig.SOCKET_URL, {
    transports: ["polling", "websocket"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
    auth: { totemCode: appConfig.selfServiceCode },
  });

  socket.on("connect", () => {
    console.log("[Mobile Socket] Conectado:", socket!.id);
    if (appConfig.selfServiceCode) {
      socket!.emit("join_room", `totem_${appConfig.selfServiceCode}`);
    }
  });

  socket.on("disconnect", (reason: string) => {
    console.log("[Mobile Socket] Desconectado:", reason);
  });

  socket.on("connect_error", (err: Error) => {
    console.warn("[Mobile Socket] Erro de conexão:", err.message);
  });

  return socket;
}

export function disconnectMobileSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function getSocket(): Socket | null {
  return socket;
}
