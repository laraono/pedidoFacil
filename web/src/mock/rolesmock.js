import { PERMISSIONS } from '@/utils/permissions';

const ROLES_KEY = 'roles';

export function initMockRoles() {
  if (localStorage.getItem(ROLES_KEY)) return;

  localStorage.setItem(
    ROLES_KEY,
    JSON.stringify([
      {
        id: 1,
        name: 'Gerente',
        permissions: [PERMISSIONS.CONFIGURACAO]
      },
      {
        id: 2,
        name: 'Garçom',
        permissions: [
          PERMISSIONS.CRIAR_PEDIDO,
          PERMISSIONS.NOTIFICACOES
        ]
      }
    ])
  );
}

export function getRolesMock() {
  initMockRoles();
  return JSON.parse(localStorage.getItem(ROLES_KEY)) || [];
}

export function saveRolesMock(data) {
  localStorage.setItem(ROLES_KEY, JSON.stringify(data));
  return Promise.resolve();
}