const ESTABLISHMENT_KEY = 'establishment';

export interface EstablishmentInfo {
  name: string;
  cnpj: string;
  phone: string;
  address: string;
}

export interface EstablishmentData {
  info: EstablishmentInfo;
}

export function initMockEstablishment(): void {
  if (!localStorage.getItem(ESTABLISHMENT_KEY)) {
    localStorage.setItem(
      ESTABLISHMENT_KEY,
      JSON.stringify({
        info: {
          name: 'Restaurante Exemplo',
          cnpj: '00.000.000/0001-00',
          phone: '(11) 99999-9999',
          address: 'Rua Exemplo, 123'
        }
      } satisfies EstablishmentData)
    );
  }
}

export function getEstablishmentMock(): Promise<EstablishmentData | null> {
  return Promise.resolve(
    JSON.parse(localStorage.getItem(ESTABLISHMENT_KEY) ?? 'null')
  );
}

export function updateEstablishmentMock(data: EstablishmentInfo): Promise<void> {
  localStorage.setItem(
    ESTABLISHMENT_KEY,
    JSON.stringify({
      info: data
    } satisfies EstablishmentData)
  );

  return Promise.resolve();
}
