import {
  ChefHat, UtensilsCrossed, Users,
  DollarSign, HamburgerIcon, Package, Receipt, Settings, BarChart2,
  CreditCard, ShieldAlert, UserCog, Tag, FileText, Calculator, Store
} from 'lucide-vue-next';
import type { Component } from 'vue';
import { PERMISSIONS, type Permission } from '@/utils/permissions';

import establishmentImage from '@/assets/estabelecimento.png';
import rolesImage from '@/assets/cargos.png';
import menuImage from '@/assets/atendimento1.png';
import productsImage from '@/assets/atendimento1.png';
import menuConfigImage from '@/assets/menu.png';

export interface MenuItem {
  label: string;
  route: string;
  icon: Component;
  image?: string;
  description: string;
  callToAction?: string;
  permission?: Permission;
  managerOnly?: boolean;
}

export interface AdminMenuItem {
  label: string;
  route: string;
  icon: Component;
  description: string;
  callToAction?: string;
  adminOnly: true;
}

export const SUBSCRIPTION_GUARDED_ROUTES = [
  '/app/menu',
  '/app/cashier',
  '/app/kitchen',
  '/app/closed',
  '/app/reports',
];

export const allMenuItems: MenuItem[] = [
  {
    label: 'Estabelecimento',
    route: '/app/settings/establishment',
    icon: Settings,
    image: establishmentImage,
    description: 'Configure o nome, logo, CNPJ e formas de pagamento do seu negócio.',
    callToAction: 'Gerenciar Estabelecimento',
    permission: PERMISSIONS.CONFIGURACAO
  },
  {
    label: 'Cargos',
    route: '/app/settings/roles',
    icon: Users,
    image: rolesImage,
    description: 'Defina quem pode acessar cada parte do sistema — cozinha, caixa ou cardápio.',
    callToAction: 'Gerenciar Cargos',
    permission: PERMISSIONS.FUNCIONARIOS
  },
  {
    label: 'Personalização do Menu',
    route: '/app/menu?editMode=true',
    icon: Users,
    image: menuConfigImage,
    description: 'Deixe o cardápio com a cara do seu negócio: cores, fontes e visual dos produtos.',
    callToAction: 'Personalize',
    permission: PERMISSIONS.CRIAR_PEDIDO
  },
  {
    label: 'Usuários',
    route: '/app/settings/users',
    icon: Users,
    image: rolesImage,
    description: 'Cadastre os funcionários e dê acesso ao sistema para cada um deles.',
    callToAction: 'Gerenciar',
    permission: PERMISSIONS.FUNCIONARIOS
  },
  {
    label: 'Categorias',
    route: '/app/settings/categories',
    icon: UtensilsCrossed,
    image: rolesImage,
    description: 'Crie grupos no cardápio, como Entradas, Bebidas e Pratos Principais.',
    callToAction: 'Gerenciar Categorias',
    permission: PERMISSIONS.CARDAPIO
  },
  {
    label: 'Produtos',
    route: '/app/settings/products',
    icon: Package,
    image: productsImage,
    description: 'Cadastre os itens do cardápio com nome, descrição, preço e variações.',
    callToAction: 'Gerenciar Produtos',
    permission: PERMISSIONS.CARDAPIO
  },
  {
    label: 'Cupons de Desconto',
    route: '/app/settings/coupons',
    icon: Tag,
    image: rolesImage,
    description: 'Crie códigos de desconto para atrair e fidelizar clientes.',
    callToAction: 'Gerenciar Cupons',
    permission: PERMISSIONS.CUPONS
  },
  {
    label: 'Notas Fiscais',
    route: '/app/settings/nf',
    icon: FileText,
    image: rolesImage,
    description: 'Emita notas fiscais eletrônicas (NF-e) para as suas vendas.',
    callToAction: 'Gerenciar NF',
    permission: PERMISSIONS.NOTA_FISCAL
  },
  {
    label: 'Cardápio',
    route: '/app/menu',
    icon: HamburgerIcon,
    image: menuImage,
    description: 'Abra o cardápio digital para anotar o pedido de uma mesa ou comanda.',
    callToAction: 'Fazer Pedido',
    permission: PERMISSIONS.CRIAR_PEDIDO
  },
  {
    label: 'Caixa',
    route: '/app/cashier',
    icon: DollarSign,
    description: 'Veja as comandas abertas, feche a conta e registre o pagamento.',
    callToAction: 'Abrir Caixa',
    permission: PERMISSIONS.CAIXA
  },
  {
    label: 'Cozinha',
    route: '/app/kitchen',
    icon: ChefHat,
    description: 'Veja em tempo real os pedidos que chegaram e marque-os como prontos.',
    callToAction: 'Ver Pedidos',
    permission: PERMISSIONS.COZINHA
  },
  {
    label: 'Finalizados',
    route: '/app/closed',
    icon: Receipt,
    description: 'Consulte todas as comandas já pagas e fechadas.',
    callToAction: 'Ver Histórico',
    permission: PERMISSIONS.COMANDAS_FINALIZADAS
  },
  {
    label: 'Relatórios',
    route: '/app/reports',
    icon: BarChart2,
    description: 'Veja gráficos de faturamento, produtos mais vendidos e desempenho da equipe.',
    permission: PERMISSIONS.RELATORIOS
  },
  {
    label: 'Assinatura',
    route: '/app/subscription',
    icon: CreditCard,
    description: 'Veja e gerencie seu plano ativo, data de vencimento e forma de pagamento.',
    callToAction: 'Ver Assinatura',
    permission: PERMISSIONS.ASSINATURA
  },
  {
    label: 'Meu Perfil',
    route: '/app/settings/profile',
    icon: Users,
    description: 'Atualize seus dados pessoais, senha de acesso e informações de contato.',
    callToAction: 'Editar Perfil',
    managerOnly: true
  },
];

export const adminMenuItems: AdminMenuItem[] = [
  {
    label: 'Assinaturas',
    route: '/app/admin/subscriptions',
    icon: ShieldAlert,
    description: 'Controle de todos os gerentes.',
    callToAction: 'Ver Assinaturas',
    adminOnly: true
  },
  {
    label: 'Planos',
    route: '/app/admin/plans',
    icon: Package,
    description: 'CRUD de planos.',
    callToAction: 'Gerenciar Planos',
    adminOnly: true
  },
  {
    label: 'Estabelecimentos',
    route: '/app/admin/establishments',
    icon: Store,
    description: 'Lista de todos os estabelecimentos cadastrados.',
    callToAction: 'Ver Estabelecimentos',
    adminOnly: true
  },
  {
    label: 'Administradores',
    route: '/app/admin/users',
    icon: UserCog,
    description: 'Gerenciar contas com acesso ao painel admin.',
    callToAction: 'Gerenciar',
    adminOnly: true
  },
  {
    label: 'Relatórios',
    route: '/app/admin/reports',
    icon: BarChart2,
    description: 'Faturamento da plataforma.',
    callToAction: 'Ver Relatórios',
    adminOnly: true
  },
];
