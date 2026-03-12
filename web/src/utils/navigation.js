import {
  BarChart3, ChefHat, UtensilsCrossed, Users,
  DollarSign, HamburgerIcon, Package, Receipt, Settings, StoreIcon
} from 'lucide-vue-next';
import { PERMISSIONS } from '@/utils/permissions';

// Importação das imagens para os Cards do Dashboard
import establishmentImage from '@/assets/estabelecimento.png';
import rolesImage from '@/assets/cargos.png';
import menuImage from '@/assets/atendimento1.png';
import productsImage from '@/assets/atendimento1.png';
import menuConfigImage from '@/assets/menu.png';

export const allMenuItems = [
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
    label: 'Relatorios',
    route: '/app/reports',
    icon: StoreIcon,
    description: 'Gráficos e relatórios.',
    permission: PERMISSIONS.RELATORIOS
  }
];