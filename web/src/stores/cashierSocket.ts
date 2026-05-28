import { connectSocket, disconnectSocket, getSocket } from '../services/socket';

export function initCashierSocket(onOrderStatusUpdate: (data: unknown) => void): void {
  connectSocket('cashier');
  const socket = getSocket();

  socket?.on('order_status_updated', (data: unknown) => {
    console.log('[Cashier Socket] Status atualizado:', data);
    onOrderStatusUpdate(data);
  });
}

export function destroyCashierSocket(): void {
  const socket = getSocket();
  if (socket) socket.off('order_status_updated');
  disconnectSocket();
}
