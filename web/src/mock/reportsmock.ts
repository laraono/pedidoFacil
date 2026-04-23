export type ReportPeriod = '24h' | '7d' | '30d' | 'all';

export interface KpiData {
  faturamento: string;
  ticketMedio: string;
  cancelamentos: number;
  giroMesa: string;
}

export interface ChartDataPoint {
  label: string;
  value: number;
}

export interface ChannelData {
  name: string;
  value: number;
  color: string;
}

export interface PeakHourData {
  hora: string;
  fluxo: number;
}

export interface WaiterData {
  id: number;
  name: string;
  revenue: string;
  orders: number;
}

export interface CancellationData {
  motivo: string;
  count: number;
  color: string;
}

export interface CouponUsageData {
  code: string;
  uses: number;
  discount: number;
  type: string;
}

export interface TopProductData {
  nome: string;
  categoria: string;
  qtd: number;
  receita: string;
  margem: string;
}

export const getKpisMock = (period: ReportPeriod): KpiData => {
  const multipliers: Record<ReportPeriod, number> = { '24h': 1, '7d': 7, '30d': 30, 'all': 180 };
  const m = multipliers[period] || 7;

  return {
    faturamento: (5335.70 * m).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
    ticketMedio: (85.25 + (Math.random() * 5)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
    cancelamentos: Math.floor(2 * m) + 1,
    giroMesa: (4.1 + (Math.random() * 0.8)).toFixed(1)
  };
};

export const getRevenueChartMock = (period: ReportPeriod): ChartDataPoint[] => {
  if (period === '24h') {
    return [
      { label: '10:00', value: 120 }, { label: '12:00', value: 450 }, { label: '14:00', value: 300 },
      { label: '18:00', value: 600 }, { label: '20:00', value: 950 }, { label: '22:00', value: 700 }
    ];
  } else if (period === '30d' || period === 'all') {
    return [
      { label: 'Semana 1', value: 35000 }, { label: 'Semana 2', value: 42000 },
      { label: 'Semana 3', value: 38000 }, { label: 'Semana 4', value: 45000 }
    ];
  }
  return [
    { label: 'Seg', value: 3200 }, { label: 'Ter', value: 4500 }, { label: 'Qua', value: 4100 },
    { label: 'Qui', value: 5800 }, { label: 'Sex', value: 8500 }, { label: 'Sáb', value: 9200 }, { label: 'Dom', value: 7800 }
  ];
};

export const getSalesByChannelMock = (period: ReportPeriod): ChannelData[] => {
  if (period === '24h') return [{ name: 'Garçom (Mesas)', value: 65, color: 'bg-brand-green' }, { name: 'Autoatendimento', value: 25, color: 'bg-blue-500' }, { name: 'Caixa', value: 10, color: 'bg-gray-400' }];
  if (period === '30d' || period === 'all') return [{ name: 'Garçom (Mesas)', value: 50, color: 'bg-brand-green' }, { name: 'Autoatendimento', value: 40, color: 'bg-blue-500' }, { name: 'Caixa', value: 10, color: 'bg-gray-400' }];

  return [
    { name: 'Garçom (Mesas)', value: 55, color: 'bg-brand-green' },
    { name: 'Autoatendimento', value: 35, color: 'bg-blue-500' },
    { name: 'Caixa', value: 10, color: 'bg-gray-400' }
  ];
};

export const getPaymentMethodsMock = (period: ReportPeriod): ChannelData[] => {
  if (period === '24h') return [{ name: 'Pix', value: 55, color: 'bg-brand-green' }, { name: 'Cartão de Crédito', value: 30, color: 'bg-blue-500' }, { name: 'Cartão de Débito', value: 10, color: 'bg-indigo-400' }, { name: 'Dinheiro', value: 5, color: 'bg-gray-400' }];
  if (period === '30d' || period === 'all') return [{ name: 'Pix', value: 40, color: 'bg-brand-green' }, { name: 'Cartão de Crédito', value: 45, color: 'bg-blue-500' }, { name: 'Cartão de Débito', value: 10, color: 'bg-indigo-400' }, { name: 'Dinheiro', value: 5, color: 'bg-gray-400' }];

  return [
    { name: 'Pix', value: 45, color: 'bg-brand-green' },
    { name: 'Cartão de Crédito', value: 35, color: 'bg-blue-500' },
    { name: 'Cartão de Débito', value: 15, color: 'bg-indigo-400' },
    { name: 'Dinheiro', value: 5, color: 'bg-gray-400' }
  ];
};

export const getPeakHoursMock = (period: ReportPeriod): PeakHourData[] => {
  const variation = (period === '24h') ? 20 : (period === '30d' || period === 'all') ? -10 : 0;
  return [
    { hora: '11:00', fluxo: Math.min(100, Math.max(10, 20 + variation)) },
    { hora: '12:00', fluxo: Math.min(100, Math.max(10, 85 + variation)) },
    { hora: '13:00', fluxo: Math.min(100, Math.max(10, 95 + variation)) },
    { hora: '14:00', fluxo: Math.min(100, Math.max(10, 40 + variation)) },
    { hora: '18:00', fluxo: Math.min(100, Math.max(10, 60 + variation)) },
    { hora: '19:00', fluxo: Math.min(100, Math.max(10, 90 + variation)) },
    { hora: '20:00', fluxo: Math.min(100, Math.max(10, 100)) },
    { hora: '21:00', fluxo: Math.min(100, Math.max(10, 85 + variation)) },
    { hora: '22:00', fluxo: Math.min(100, Math.max(10, 50 + variation)) }
  ];
};

export const getTopWaitersMock = (period: ReportPeriod): WaiterData[] => {
  const m = (period === '24h') ? 1 : (period === '30d') ? 30 : (period === 'all') ? 180 : 7;
  return [
    { id: 102, name: 'Carlos Silva', revenue: `R$ ${(607.14 * m).toLocaleString('pt-BR')}`, orders: 7 * m },
    { id: 105, name: 'Ana Souza', revenue: `R$ ${(555.71 * m).toLocaleString('pt-BR')}`, orders: 6 * m },
    { id: 108, name: 'Marcos Paulo', revenue: `R$ ${(442.85 * m).toLocaleString('pt-BR')}`, orders: 5 * m }
  ];
};

export const getCancellationsMock = (period: ReportPeriod): CancellationData[] => {
  const m = (period === '24h') ? 0.2 : (period === '30d') ? 4 : (period === 'all') ? 24 : 1;
  return [
    { motivo: 'Demora no preparo', count: Math.ceil(18 * m), color: 'bg-red-500' },
    { motivo: 'Pedido errado / Erro do Garçom', count: Math.ceil(7 * m), color: 'bg-orange-400' },
    { motivo: 'Desistência / Cliente foi embora', count: Math.ceil(3 * m), color: 'bg-gray-400' },
  ];
};

export const getCouponUsageMock = (period: ReportPeriod): CouponUsageData[] => {
  const m = (period === '24h') ? 0.1 : (period === '30d') ? 4 : (period === 'all') ? 20 : 1;
  return [
    { code: 'BEMVINDO10', uses: Math.ceil(42 * m), discount: 10, type: 'percent' },
    { code: 'FIDELIDADE', uses: Math.ceil(28 * m), discount: 15, type: 'percent' },
    { code: 'DESC5REAIS', uses: Math.ceil(19 * m), discount: 5, type: 'fixed' },
    { code: 'HAPPY20', uses: Math.ceil(11 * m), discount: 20, type: 'percent' },
    { code: 'PROMO15', uses: Math.ceil(7 * m), discount: 15, type: 'fixed' },
  ];
};

export const getTopProductsMock = (period: ReportPeriod): TopProductData[] => {
  const m = (period === '24h') ? 0.15 : (period === '30d') ? 4.5 : (period === 'all') ? 25 : 1;

  return [
    { nome: 'Picanha na Chapa', categoria: 'Pratos', qtd: Math.ceil(142 * m), receita: `R$ ${(8236.00 * m).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, margem: '45%' },
    { nome: 'Suco de Laranja 500ml', categoria: 'Bebidas', qtd: Math.ceil(310 * m), receita: `R$ ${(3100.00 * m).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, margem: '70%' },
    { nome: 'Batata Frita Especial', categoria: 'Porções', qtd: Math.ceil(98 * m), receita: `R$ ${(1960.00 * m).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, margem: '60%' },
    { nome: 'Pudim de Leite', categoria: 'Sobremesas', qtd: Math.ceil(45 * m), receita: `R$ ${(540.00 * m).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, margem: '80%' },
  ];
};
