import { io } from "socket.io-client";
import { appConfig } from "./apiConfig"; 

let socket = null;

export function connectMobileSocket() {
  if (socket && socket.connected) return socket;

  socket = io(appConfig.SOCKET_URL, {
    transports: ["polling", "websocket"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
  });

  socket.on("connect", () => {
    console.log("[Mobile Socket] Conectado:", socket.id);
    socket.emit("join_room", "waiter");
    if (appConfig.selfServiceCode) {
      socket.emit("join_room", `totem_${appConfig.selfServiceCode}`);
    }
  });

  socket.on("disconnect", (reason) => {
    console.log("[Mobile Socket] Desconectado:", reason);
  });

  socket.on("connect_error", (err) => {
    console.warn("[Mobile Socket] Erro de conexão:", err.message);
  });

  return socket;
}

export function listenOrderStatus(orderId, onUpdate) {
  if (!socket) {
    console.warn("[Mobile Socket] Socket não conectado. Chame connectMobileSocket() primeiro.");
    return;
  }

  socket.on("order_status_updated", (data) => {
    if (data.orderId === orderId) {
      console.log("[Mobile Socket] Status do meu pedido atualizado:", data);
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