import { connectSocket, disconnectSocket, getSocket } from '../services/socket';

export function initCashierSocket(onOrderStatusUpdate) {
    connectSocket('cashier');
    const socket = getSocket();

    socket.on('order_status_updated', (data) => {
        console.log('[Cashier Socket] Status atualizado:', data);
        if (typeof onOrderStatusUpdate === 'function') {
            onOrderStatusUpdate(data);
        }
    });
}

export function destroyCashierSocket() {
    const socket = getSocket();
    if (socket) socket.off('order_status_updated');
    disconnectSocket();
}
