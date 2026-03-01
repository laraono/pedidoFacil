import { PERMISSIONS } from '@/utils/permissions';

const USERS_KEY = "users";
const ROLES_KEY = "roles";
const USER_KEY = "user";
const TOKEN_KEY = "userToken";

export function initMockRoles() {
  if (localStorage.getItem(ROLES_KEY)) return;

  const roles = [
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
    },
    {
      id: 6,
      name: 'Caixa',
      role: 'CAIXA', 
      permissions: [
        PERMISSIONS.CRIAR_PEDIDO,
        PERMISSIONS.COZINHA, 
        PERMISSIONS.CAIXA, 
        PERMISSIONS.ESTOQUE,
        PERMISSIONS.COMANDAS_FINALIZADAS,
      ]
    },
  ];

  localStorage.setItem(ROLES_KEY, JSON.stringify(roles));
}

export function initMockUsers() {
  if (localStorage.getItem(USERS_KEY)) return;
  const users = [
    {
      id: 1,
      name: "Admin",
      email: "admin@email.com",
      password: "123456",
      roleId: 1,
      status: "ATIVO"
    },
    {
      id: 2,
      name: "Gerente da Loja",
      email: "gerente@email.com",
      password: "123456",
      roleId: 2,
      status: "ATIVO"
    },
    {
      id: 4,
      name: "Pedro Garçom",
      email: "garcom@email.com",
      password: "123456",
      roleId: 4,
      status: "ATIVO"
    },
    {
      id: 5,
      name: "João Cozinha",
      email: "cozinha@email.com",
      password: "123456",
      roleId: 5,
      status: "ATIVO"
    },
     {
      id: 6,
      name: "Roberta Caixa",
      email: "caixa@email.com",
      password: "123456",
      roleId: 6,
      status: "ATIVO"
    }
  ];

  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export async function loginMock(email, password) {
  initMockRoles();
  initMockUsers();

  const users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
  const roles = JSON.parse(localStorage.getItem(ROLES_KEY)) || [];

  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    throw new Error("Credenciais inválidas");
  }

  if (user.status?.toUpperCase() !== "ATIVO") {
    throw new Error("Usuário inativo. Entre em contato com o administrador.");
  }

  const userRole = roles.find(r => r.id === user.roleId);

  if (!userRole) {
    console.error(`Cargo ID ${user.roleId} não encontrado para o usuário ${user.name}`);
    throw new Error("Erro de configuração de usuário: Sem cargo definido.");
  }

  const userWithRole = {
    ...user,
    role: userRole
  };

  localStorage.setItem(USER_KEY, JSON.stringify(userWithRole));
  localStorage.setItem(TOKEN_KEY, "mock-token");

  await new Promise(resolve => setTimeout(resolve, 500));

  return userWithRole;
}

export function logoutMock() {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(TOKEN_KEY);
}

export function getRolesMock() {
  return JSON.parse(localStorage.getItem(ROLES_KEY)) || [];
}

export function saveRolesMock(data) {
  localStorage.setItem(ROLES_KEY, JSON.stringify(data));
  return Promise.resolve();
}