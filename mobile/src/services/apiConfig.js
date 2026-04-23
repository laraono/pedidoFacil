import Constants from 'expo-constants';

const hostUri = Constants.expoConfig?.hostUri || '';
const packagerIp = hostUri ? hostUri.split(':')[0] : null;

const BASE_IP = process.env.EXPO_PUBLIC_API_URL || (packagerIp ? `http://${packagerIp}:3000` : 'http://localhost:3000');

export const API_URL = `${BASE_IP}/api/v1`;
export const SOCKET_URL = BASE_IP;

console.log(`[PedidoFácil] 🛰️ Conectando ao Backend em: ${API_URL}`);