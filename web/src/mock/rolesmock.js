import { PERMISSIONS } from '@/utils/permissions';
const ROLES_KEY = 'roles';

export function initMockRoles() {
  if (localStorage.getItem(ROLES_KEY)) return;

  localStorage.setItem(
    ROLES_KEY,
    JSON.stringify([
      {
        id: 1,
        name: 'Admin',
        role: 'ADMIN',
        permissions: [
          PERMISSIONS.RELATORIOS,
          PERMISSIONS.COZINHA,
          PERMISSIONS.ESTOQUE,
          PERMISSIONS.CARDAPIO,
          PERMISSIONS.FUNCIONARIOS,
          PERMISSIONS.CONFIGURACAO,
          PERMISSIONS.ASSINATURA,
          PERMISSIONS.CRIAR_PEDIDO,
          PERMISSIONS.NOTIFICACOES 
        ]
      },
      {
        id: 2,
        name: 'Gerente',
        role: 'GERENTE',
        permissions: [
          PERMISSIONS.RELATORIOS,
          PERMISSIONS.COZINHA,
          PERMISSIONS.ESTOQUE,
          PERMISSIONS.CARDAPIO,
          PERMISSIONS.FUNCIONARIOS,
          PERMISSIONS.CONFIGURACAO,
          PERMISSIONS.ASSINATURA,
          PERMISSIONS.CRIAR_PEDIDO,
          PERMISSIONS.NOTIFICACOES 
        ]
      },
      {
        id: 4,
        name: 'Garçom',
        role: 'GARCOM',
        permissions: [
          PERMISSIONS.CRIAR_PEDIDO,
          PERMISSIONS.NOTIFICACOES
        ]
      },
      {
        id: 5,
        name: 'Cozinheiro',
        role: 'COZINHA',
        permissions: [
          PERMISSIONS.COZINHA, 
          PERMISSIONS.ESTOQUE
        ]
      }
    ])
  );
}

export function getRolesMock() {
  return JSON.parse(localStorage.getItem(ROLES_KEY)) || [];
}

export function saveRolesMock(data) {
  localStorage.setItem(ROLES_KEY, JSON.stringify(data));
  return Promise.resolve();
}