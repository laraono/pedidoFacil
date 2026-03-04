// src/mock/reportsmock.js

export const getKpisMock = (period) => {
  const multipliers = { '24h': 1, '7d': 7, '30d': 30 };
  const m = multipliers[period] || 7;

  return {
    faturamento: (5335.70 * m).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
    ticketMedio: (85.25 + (Math.random() * 5)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
    cancelamentos: Math.floor(2 * m) + 1,
    giroMesa: (4.1 + (Math.random() * 0.8)).toFixed(1)
  };
};

export const getRevenueChartMock = (period) => {
  if (period === '24h') {
    return [
      { label: '10:00', value: 120 }, { label: '12:00', value: 450 }, { label: '14:00', value: 300 },
      { label: '18:00', value: 600 }, { label: '20:00', value: 950 }, { label: '22:00', value: 700 }
    ];
  } else if (period === '30d') {
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

export const getSalesByChannelMock = (period) => {
  if (period === '24h') return [{ name: 'Garçom (Mesas)', value: 65, color: 'bg-brand-green' }, { name: 'Autoatendimento', value: 25, color: 'bg-blue-500' }, { name: 'Caixa', value: 10, color: 'bg-gray-400' }];
  if (period === '30d') return [{ name: 'Garçom (Mesas)', value: 50, color: 'bg-brand-green' }, { name: 'Autoatendimento', value: 40, color: 'bg-blue-500' }, { name: 'Caixa', value: 10, color: 'bg-gray-400' }];
  
  return [
    { name: 'Garçom (Mesas)', value: 55, color: 'bg-brand-green' },
    { name: 'Autoatendimento', value: 35, color: 'bg-blue-500' },
    { name: 'Caixa', value: 10, color: 'bg-gray-400' }
  ];
};

export const getPaymentMethodsMock = (period) => {
  if (period === '24h') return [{ name: 'Pix', value: 55, color: 'bg-brand-green' }, { name: 'Cartão de Crédito', value: 30, color: 'bg-blue-500' }, { name: 'Cartão de Débito', value: 10, color: 'bg-indigo-400' }, { name: 'Dinheiro', value: 5, color: 'bg-gray-400' }];
  if (period === '30d') return [{ name: 'Pix', value: 40, color: 'bg-brand-green' }, { name: 'Cartão de Crédito', value: 45, color: 'bg-blue-500' }, { name: 'Cartão de Débito', value: 10, color: 'bg-indigo-400' }, { name: 'Dinheiro', value: 5, color: 'bg-gray-400' }];
  
  return [
    { name: 'Pix', value: 45, color: 'bg-brand-green' },
    { name: 'Cartão de Crédito', value: 35, color: 'bg-blue-500' },
    { name: 'Cartão de Débito', value: 15, color: 'bg-indigo-400' },
    { name: 'Dinheiro', value: 5, color: 'bg-gray-400' }
  ];
};

export const getPeakHoursMock = (period) => {
  const variation = period === '24h' ? 20 : period === '30d' ? -10 : 0;
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

export const getTopWaitersMock = (period) => {
  const m = period === '24h' ? 1 : period === '30d' ? 30 : 7;
  return [
    { id: 102, name: 'Carlos Silva', revenue: `R$ ${(607.14 * m).toLocaleString('pt-BR')}`, orders: 7 * m },
    { id: 105, name: 'Ana Souza', revenue: `R$ ${(555.71 * m).toLocaleString('pt-BR')}`, orders: 6 * m },
    { id: 108, name: 'Marcos Paulo', revenue: `R$ ${(442.85 * m).toLocaleString('pt-BR')}`, orders: 5 * m }
  ];
};

export const getCancellationsMock = (period) => {
  const m = period === '24h' ? 0.2 : period === '30d' ? 4 : 1;
  return [
    { motivo: 'Demora no preparo', count: Math.ceil(18 * m), color: 'bg-red-500' },
    { motivo: 'Pedido errado / Erro do Garçom', count: Math.ceil(7 * m), color: 'bg-orange-400' },
    { motivo: 'Desistência / Cliente foi embora', count: Math.ceil(3 * m), color: 'bg-gray-400' },
  ];
};