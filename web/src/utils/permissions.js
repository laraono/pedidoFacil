export const PERMISSIONS = {
  RELATORIOS: 'RELATORIOS',
  COZINHA: 'COZINHA',
  ESTOQUE: 'ESTOQUE',
  CARDAPIO: 'CARDAPIO',
  FUNCIONARIOS: 'FUNCIONARIOS',
  CONFIGURACAO: 'CONFIGURACAO',
  ASSINATURA: 'ASSINATURA',
  CRIAR_PEDIDO: 'CRIAR_PEDIDO',
  NOTIFICACOES: 'NOTIFICACOES',
  CAIXA: 'CAIXA',
  COMANDAS_FINALIZADAS: 'COMANDAS_FINALIZADAS'
};

export const AVAILABLE_PERMISSIONS = [
  { id: PERMISSIONS.RELATORIOS, label: 'Relatórios', desc: 'Acesso a métricas e desempenho.' },
  { id: PERMISSIONS.COZINHA, label: 'Cozinha', desc: 'Gestão e preparo de pedidos.' },
  { id: PERMISSIONS.ESTOQUE, label: 'Estoque', desc: 'Controle de insumos e produtos.' },
  { id: PERMISSIONS.CARDAPIO, label: 'Cardápio', desc: 'Edição de itens e categorias.' },
  { id: PERMISSIONS.FUNCIONARIOS, label: 'Funcionários', desc: 'Gestão de usuários e cargos.' },
  { id: PERMISSIONS.CONFIGURACAO, label: 'Configuração', desc: 'Ajustes gerais do sistema.' },
  { id: PERMISSIONS.CAIXA, label: 'Caixa', desc: 'Fluxo financeiro e recebimentos.' },
  { id: PERMISSIONS.CRIAR_PEDIDO, label: 'Criar Pedido', desc: 'Lançamento de novas vendas.' },
  { id: PERMISSIONS.COMANDAS_FINALIZADAS, label: 'Histórico', desc: 'Visualizar pedidos encerrados.' },
];