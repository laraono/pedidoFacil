import { PERMISSIONS } from '@/utils/permissions';

const USERS_KEY = "users";
const ROLES_KEY = "roles";
const USER_KEY = "user";
const TOKEN_KEY = "userToken";

export interface MockRole {
  id: number;
  name: string;
  role: string;
  permissions: string[];
}

export interface MockUser {
  id: number;
  name: string;
  username: string;
  email: string;
  password: string;
  roleId: number;
  status: string;
  role?: MockRole;
}

export function initMockRoles(): void {
  if (localStorage.getItem(ROLES_KEY)) return;

  const roles: MockRole[] = [
    {
      id: 2,
      name: 'Gerente',
      role: 'GERENTE',
      permissions: [
        PERMISSIONS.RELATORIOS,
        PERMISSIONS.COZINHA,
        PERMISSIONS.CARDAPIO,
        PERMISSIONS.FUNCIONARIOS,
        PERMISSIONS.CONFIGURACAO,
        PERMISSIONS.ASSINATURA,
        PERMISSIONS.CRIAR_PEDIDO,
        PERMISSIONS.NOTIFICACOES,
        PERMISSIONS.CAIXA,
        PERMISSIONS.COMANDAS_FINALIZADAS,
      ]
    },
  ];

  localStorage.setItem(ROLES_KEY, JSON.stringify(roles));
}

export function initMockUsers(): void {
  if (localStorage.getItem(USERS_KEY)) return;
  const users: MockUser[] = [
    {
      id: 2,
      name: "Gerente da Loja",
      username: "gerente",
      email: "gerente@email.com",
      password: "123456",
      roleId: 2,
      status: "ATIVO"
    },
  ];

  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export async function loginMock(username: string, password: string): Promise<MockUser> {
  initMockRoles();
  initMockUsers();

  const users: MockUser[] = JSON.parse(localStorage.getItem(USERS_KEY) ?? '[]') || [];
  const roles: MockRole[] = JSON.parse(localStorage.getItem(ROLES_KEY) ?? '[]') || [];

  // Support both username and legacy email login
  const user = users.find(u =>
    (u.username === username || u.email === username) && u.password === password
  );

  if (!user) {
    throw new Error("Credenciais inválidas");
  }

  if (user.status?.toUpperCase() !== "ATIVO") {
    throw new Error("Usuário inativo. Entre em contato com o administrador.");
  }

  const userRole = roles.find(r => Number(r.id) === Number(user.roleId));

  if (!userRole) {
    console.error(`Cargo ID ${user.roleId} não encontrado para o usuário ${user.name}`);
    throw new Error("Erro de configuração de usuário: Sem cargo definido.");
  }

  const userWithRole: MockUser = {
    ...user,
    role: userRole
  };

  localStorage.setItem(USER_KEY, JSON.stringify(userWithRole));
  localStorage.setItem(TOKEN_KEY, "mock-token");

  await new Promise(resolve => setTimeout(resolve, 500));

  return userWithRole;
}

export function logoutMock(): void {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(TOKEN_KEY);
}

export function getRolesMock(): MockRole[] {
  return JSON.parse(localStorage.getItem(ROLES_KEY) ?? '[]') || [];
}

export function saveRolesMock(data: MockRole[]): Promise<void> {
  localStorage.setItem(ROLES_KEY, JSON.stringify(data));
  return Promise.resolve();
}
