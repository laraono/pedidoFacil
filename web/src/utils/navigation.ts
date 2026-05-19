import {
  ChefHat, UtensilsCrossed, Users,
  DollarSign, HamburgerIcon, Package, Receipt, Settings, BarChart2,
  CreditCard, ShieldAlert, UserCog, Tag, FileText, Calculator
} from 'lucide-vue-next';
import type { Component } from 'vue';
import { PERMISSIONS, type Permission } from '@/utils/permissions';

// Importação das imagens para os Cards do Dashboard
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
}

export interface AdminMenuItem {
  label: string;
  route: string;
  icon: Component;
  description: string;
  callToAction?: string;
  adminOnly: true;
}

export const allMenuItems: MenuItem[] = [
  {
    label: 'Estabelecimento',
    route: '/app/settings/establishment',
    icon: Settings,
    image: establishmentImage,
    description: 'Gerencie dados gerais do estabelecimento.',
    callToAction: 'Editar Info',
    permission: PERMISSIONS.CONFIGURACAO
  },
  {
    label: 'Cargos e Permissões',
    route: '/app/settings/roles',
    icon: Users,
    image: rolesImage,
    description: 'Configure os cargos da sua equipe.',
    callToAction: 'Gerenciar Cargos',
    permission: PERMISSIONS.CONFIGURACAO
  },
  {
    label: 'Personalização do Menu',
    route: '/app/menu?editMode=true',
    icon: Users,
    image: menuConfigImage,
    description: 'Personalize o Estilo do Menu.',
    callToAction: 'Personalize',
    permission: PERMISSIONS.CONFIGURACAO
  },
  {
    label: 'Gerenciar Usuários',
    route: '/app/settings/users',
    icon: Users,
    image: rolesImage,
    description: 'Adicione, Edite e Remova Usuários',
    callToAction: 'Gerenciar',
    permission: PERMISSIONS.CONFIGURACAO
  },
  {
    label: 'Categorias',
    route: '/app/settings/categories',
    icon: UtensilsCrossed,
    image: rolesImage,
    description: 'Organize as seções do seu cardápio.',
    callToAction: 'Gerenciar Categorias',
    permission: PERMISSIONS.CONFIGURACAO
  },
  {
    label: 'Produtos',
    route: '/app/settings/products',
    icon: Package,
    image: productsImage,
    description: 'Configure seus pratos e preços.',
    callToAction: 'Gerenciar Produtos',
    permission: PERMISSIONS.CONFIGURACAO
  },
  {
    label: 'Cupons de Desconto',
    route: '/app/settings/coupons',
    icon: Tag,
    image: rolesImage,
    description: 'Crie e gerencie cupons promocionais.',
    callToAction: 'Gerenciar Cupons',
    permission: PERMISSIONS.CUPONS
  },
  {
    label: 'Notas Fiscais',
    route: '/app/settings/nf',
    icon: FileText,
    image: rolesImage,
    description: 'Emissão e gestão de NF-e.',
    callToAction: 'Gerenciar NF',
    permission: PERMISSIONS.NOTA_FISCAL
  },
  {
    label: 'Cardápio',
    route: '/app/menu',
    icon: HamburgerIcon,
    image: menuImage,
    description: 'Acesse o cardápio digital.',
    callToAction: 'Fazer Pedido',
    permission: PERMISSIONS.CRIAR_PEDIDO
  },
  {
    label: 'Caixa',
    route: '/app/cashier',
    icon: DollarSign,
    description: 'Pagamento e fechamento de comandas.',
    callToAction: 'Abrir Caixa',
    permission: PERMISSIONS.CAIXA
  },
  {
    label: 'Cozinha',
    route: '/app/kitchen',
    icon: ChefHat,
    description: 'Fila de produção e status dos pedidos.',
    callToAction: 'Ver Pedidos',
    permission: PERMISSIONS.COZINHA
  },
  {
    label: 'Finalizados',
    route: '/app/closed',
    icon: Receipt,
    description: 'Histórico de comandas concluídas.',
    callToAction: 'Ver Histórico',
    permission: PERMISSIONS.COMANDAS_FINALIZADAS
  },
  {
    label: 'Relatórios',
    route: '/app/reports',
    icon: BarChart2,
    description: 'Gráficos e relatórios.',
    permission: PERMISSIONS.RELATORIOS
  },
  {
    label: 'Assinatura',
    route: '/app/subscription',
    icon: CreditCard,
    description: 'Gerencie seu plano e pagamentos.',
    callToAction: 'Ver Assinatura',
    permission: PERMISSIONS.ASSINATURA
  },
  {
    label: 'Meu Perfil',
    route: '/app/settings/profile',
    icon: Users,
    description: 'Dados pessoais para contato e cobranças.',
    callToAction: 'Editar Perfil',
    permission: PERMISSIONS.CONFIGURACAO
  },
  {
    label: 'Terminal',
    route: '/app/settings/register',
    icon: Calculator,
    description: 'Gerencie terminais de máquinas de cartão.',
    callToAction: 'Ver terminal',
    permission: PERMISSIONS.CONFIGURACAO
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
    description: 'CRUD de planos (máx. 2).',
    callToAction: 'Gerenciar Planos',
    adminOnly: true
  },
  {
    label: 'Métricas',
    route: '/app/admin/metrics',
    icon: BarChart2,
    description: 'KPIs e métricas de assinaturas.',
    callToAction: 'Ver Métricas',
    adminOnly: true
  },
  {
    label: 'Usuários Admin',
    route: '/app/admin/users',
    icon: UserCog,
    description: 'Gerenciar contas com acesso ao painel admin.',
    callToAction: 'Gerenciar',
    adminOnly: true
  },
  {
    label: 'Relatórios Admin',
    route: '/app/admin/reports',
    icon: BarChart2,
    description: 'Faturamento da plataforma.',
    callToAction: 'Ver Relatórios',
    adminOnly: true
  },
];
