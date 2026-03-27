const ESTABLISHMENT_KEY = 'establishment';

export function initMockEstablishment() {
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
      })
    );
  }
}

export function getEstablishmentMock() {
  return Promise.resolve(
    JSON.parse(localStorage.getItem(ESTABLISHMENT_KEY))
  );
}

export function updateEstablishmentMock(data) {
  localStorage.setItem(
    ESTABLISHMENT_KEY,
    JSON.stringify({
      info: data
    })
  );

  return Promise.resolve();
}
