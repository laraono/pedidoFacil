const ROLES_KEY = 'roles';

export function initMockRoles() {
  if (!localStorage.getItem(ROLES_KEY)) {
    localStorage.setItem(
      ROLES_KEY,
      JSON.stringify([
        {
          id: 1,
          name: 'Gerente',
          permissions: [
            'Controle de Estoque',
            'Acesso a Histórico de Pedidos',
            'Enviar notificações'
          ]
        },
        {
          id: 2,
          name: 'Caixa',
          permissions: [
            'Acesso à lista de Pedidos Prontos',
            'Enviar notificações'
          ]
        },
        {
          id: 3,
          name: 'Cozinha',
          permissions: [
            'Acesso à lista de Pedidos em preparo',
            'Acesso à lista de Pedidos Prontos'
          ]
        },
        {
          id: 4,
          name: 'Garçom',
          permissions: [
            'Pode criar Pedidos (Garçom)',
            'Enviar notificações'
          ]
        }
      ])
    );
  }
}

export function getRolesMock() {
  return Promise.resolve(
    JSON.parse(localStorage.getItem(ROLES_KEY))
  );
}

export function saveRolesMock(data) {
  localStorage.setItem(ROLES_KEY, JSON.stringify(data));
  return Promise.resolve();
}
