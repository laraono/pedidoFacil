import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const hostUri = Constants.expoConfig?.hostUri || '';
const packagerIp = hostUri ? hostUri.split(':')[0] : null;

const DEFAULT_IP = process.env.EXPO_PUBLIC_API_URL || (packagerIp ? `http://${packagerIp}:3000` : 'http://localhost:3000');

export const appConfig = {
  BASE_IP: DEFAULT_IP,
  API_URL: `${DEFAULT_IP}/api/v1`,
  SOCKET_URL: DEFAULT_IP,
  ESTABLISHMENT_ID: null, 
  selfServiceCode: null,
  isConfigured: false, 
};

export const loadAppConfig = async () => {
  try {
    const savedIp = await AsyncStorage.getItem('@PedidoFacil:BaseIP');
    const savedId = await AsyncStorage.getItem('@PedidoFacil:EstID');
    const savedCode = await AsyncStorage.getItem('@PedidoFacil:TotemCode'); 

    if (__DEV__) {
      appConfig.BASE_IP = DEFAULT_IP;
      appConfig.API_URL = `${DEFAULT_IP}/api/v1`;
      appConfig.SOCKET_URL = DEFAULT_IP;
    } else if (savedIp) {
      appConfig.BASE_IP = savedIp;
      appConfig.API_URL = `${savedIp}/api/v1`;
      appConfig.SOCKET_URL = savedIp;
    }

    if (savedId) {
      appConfig.ESTABLISHMENT_ID = parseInt(savedId, 10);
      appConfig.isConfigured = true;
    } else {
      appConfig.ESTABLISHMENT_ID = null;
      appConfig.isConfigured = false; 
    }

    if (savedCode) {
      appConfig.selfServiceCode = savedCode;
    }

    console.log(`[PedidoFácil] 🛰️ Configuração: IP=${appConfig.API_URL} | EstID=${appConfig.ESTABLISHMENT_ID} | Configurado=${appConfig.isConfigured}`);
    return appConfig.isConfigured;
  } catch (error) {
    console.error('Erro ao carregar configurações:', error);
    return false;
  }
};

export const saveAppConfig = async (ip, establishmentId, selfServiceCode = '') => {
  try {
    const cleanIp = ip ? ip.replace(/\/$/, '') : DEFAULT_IP;
    
    await AsyncStorage.setItem('@PedidoFacil:BaseIP', cleanIp);
    await AsyncStorage.setItem('@PedidoFacil:EstID', establishmentId.toString());
    
    if (selfServiceCode) {
        await AsyncStorage.setItem('@PedidoFacil:TotemCode', selfServiceCode.toString());
    }
    
    appConfig.BASE_IP = cleanIp;
    appConfig.API_URL = `${cleanIp}/api/v1`;
    appConfig.SOCKET_URL = cleanIp;
    appConfig.ESTABLISHMENT_ID = parseInt(establishmentId, 10);
    appConfig.selfServiceCode = selfServiceCode;
    appConfig.isConfigured = true; 
    
    console.log(`[PedidoFácil] 💾 Primeiro contato realizado! Estabelecimento ${establishmentId} salvo.`);
  } catch (error) {
    console.error('Erro ao salvar configurações:', error);
    throw error;
  }
};