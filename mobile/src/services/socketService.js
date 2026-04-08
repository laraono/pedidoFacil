import { io } from "socket.io-client";
import { SOCKET_URL } from "./apiConfig";

let socket = null;

export function connectMobileSocket() {
  if (socket && socket.connected) return socket;

  socket = io(SOCKET_URL, {
    transports: ["polling", "websocket"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
  });

  socket.on("connect", () => {
    console.log("[Mobile Socket] Conectado:", socket.id);
    socket.emit("join_room", "waiter");
  });

  socket.on("connect_error", (err) => {
    console.warn("[Mobile Socket] Erro de conexão:", err.message);
  });

  return socket;
}

export function listenOrderStatus(orderId, onUpdate) {
  if (!socket) {
    console.warn(
      "[Mobile Socket] Tentativa de ouvir status sem conexão ativa.",
    );
    return;
  }

  socket.on("order_status_updated", (data) => {
    if (data.orderId === orderId) {
      if (typeof onUpdate === "function") onUpdate(data);
    }
  });
}

export function stopListeningOrderStatus() {
  if (socket) socket.off("order_status_updated");
}

export function disconnectMobileSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function getSocket() {
  return socket;
}
