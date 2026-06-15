import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_IP = process.env.EXPO_PUBLIC_API_URL ?? null;

const getLocalStackUrl = (ipUrl: string | null): string => {
  if (!ipUrl) return 'http://127.0.0.1:4566';
  const baseUrl = ipUrl.split(':').slice(0, 2).join(':');
  return `${baseUrl}:4566`;
};

export const appConfig: {
  BASE_IP: string | null
  API_URL: string | null
  SOCKET_URL: string | null
  LOCALSTACK_URL: string
  ESTABLISHMENT_ID: number | null
  selfServiceCode: string | null
  isConfigured: boolean
} = {
  BASE_IP,
  API_URL: BASE_IP ? `${BASE_IP}/api/v1` : null,
  SOCKET_URL: BASE_IP,
  LOCALSTACK_URL: getLocalStackUrl(BASE_IP),
  ESTABLISHMENT_ID: null,
  selfServiceCode: null,
  isConfigured: false,
};

export const loadAppConfig = async (): Promise<boolean> => {
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

export const saveAppConfig = async (establishmentId: number | string, selfServiceCode = ''): Promise<void> => {
  try {
    await AsyncStorage.setItem('@PedidoFacil:EstID', establishmentId.toString());

    if (selfServiceCode) {
      await AsyncStorage.setItem('@PedidoFacil:TotemCode', selfServiceCode.toString());
    }

    appConfig.ESTABLISHMENT_ID = parseInt(establishmentId.toString(), 10);
    appConfig.selfServiceCode = selfServiceCode;
    appConfig.isConfigured = true;

    console.log(`[PedidoFácil] Estabelecimento ${establishmentId} salvo.`);
  } catch (error) {
    console.error('Erro ao salvar configurações:', error);
    throw error;
  }
};
