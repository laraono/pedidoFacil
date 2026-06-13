import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_IP = process.env.EXPO_PUBLIC_API_URL;

export const appConfig = {
  BASE_IP,
  API_URL: BASE_IP ? `${BASE_IP}/api/v1` : null,
  SOCKET_URL: BASE_IP,
  ESTABLISHMENT_ID: null,
  selfServiceCode: null,
  isConfigured: false,
};

export const loadAppConfig = async () => {
  try {
    const savedId = await AsyncStorage.getItem('@PedidoFacil:EstID');
    const savedCode = await AsyncStorage.getItem('@PedidoFacil:TotemCode');

    if (savedId && appConfig.API_URL) {
      appConfig.ESTABLISHMENT_ID = parseInt(savedId, 10);
      appConfig.isConfigured = true;
    } else {
      appConfig.ESTABLISHMENT_ID = null;
      appConfig.isConfigured = false;
    }

    if (savedCode) {
      appConfig.selfServiceCode = savedCode;
    }

    console.log(`[PedidoFácil] IP=${appConfig.API_URL} | EstID=${appConfig.ESTABLISHMENT_ID} | Configurado=${appConfig.isConfigured}`);
    return appConfig.isConfigured;
  } catch (error) {
    console.error('Erro ao carregar configurações:', error);
    return false;
  }
};

export const saveAppConfig = async (establishmentId, selfServiceCode = '') => {
  try {
    await AsyncStorage.setItem('@PedidoFacil:EstID', establishmentId.toString());

    if (selfServiceCode) {
      await AsyncStorage.setItem('@PedidoFacil:TotemCode', selfServiceCode.toString());
    }

    appConfig.ESTABLISHMENT_ID = parseInt(establishmentId, 10);
    appConfig.selfServiceCode = selfServiceCode;
    appConfig.isConfigured = true;

    console.log(`[PedidoFácil] Estabelecimento ${establishmentId} salvo.`);
  } catch (error) {
    console.error('Erro ao salvar configurações:', error);
    throw error;
  }
};
