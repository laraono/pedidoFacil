export const PERMISSIONS = {
  RELATORIOS: 'RELATORIOS',
  COZINHA: 'COZINHA',
  CARDAPIO: 'CARDAPIO',
  FUNCIONARIOS: 'FUNCIONARIOS',
  CONFIGURACAO: 'CONFIGURACAO',
  ASSINATURA: 'ASSINATURA',
  CRIAR_PEDIDO: 'CRIAR_PEDIDO',
  NOTIFICACOES: 'NOTIFICACOES',
  CAIXA: 'CAIXA',
  COMANDAS_FINALIZADAS: 'COMANDAS_FINALIZADAS',
  CUPONS: 'CUPONS',
  NOTA_FISCAL: 'NOTA_FISCAL',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

export interface PermissionInfo {
  id: Permission;
  label: string;
  desc: string;
}

export const AVAILABLE_PERMISSIONS: PermissionInfo[] = [
  { id: PERMISSIONS.RELATORIOS, label: 'Relatórios', desc: 'Acesso a métricas e desempenho.' },
  { id: PERMISSIONS.COZINHA, label: 'Cozinha', desc: 'Gestão e preparo de pedidos.' },
  { id: PERMISSIONS.CARDAPIO, label: 'Cardápio', desc: 'Edição de produtos e categorias.' },
  { id: PERMISSIONS.FUNCIONARIOS, label: 'Funcionários', desc: 'Gestão de usuários e cargos.' },
  { id: PERMISSIONS.CONFIGURACAO, label: 'Configuração', desc: 'Ajustes gerais do sistema.' },
  { id: PERMISSIONS.ASSINATURA, label: 'Assinatura', desc: 'Gestão de pagamentos e planos.' },
  { id: PERMISSIONS.CAIXA, label: 'Caixa', desc: 'Fluxo financeiro e recebimentos.' },
  { id: PERMISSIONS.CRIAR_PEDIDO, label: 'Criar Pedido', desc: 'Lançamento de novas vendas.' },
  { id: PERMISSIONS.COMANDAS_FINALIZADAS, label: 'Histórico', desc: 'Visualizar pedidos encerrados.' },
  { id: PERMISSIONS.CUPONS, label: 'Cupons', desc: 'Gerenciar cupons de desconto.' },
  { id: PERMISSIONS.NOTA_FISCAL, label: 'Nota Fiscal', desc: 'Emissão e gestão de NF-e.' },
];
