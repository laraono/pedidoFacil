export function useUtils() {
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value || 0);
  };

  const parsedFeatures = (features: any): string[] => {
    if (!features) return []
    try { return JSON.parse(features) }
    catch { return String(features).split(',').map((f: string) => f.trim()).filter(Boolean) }
  };

  return { formatCurrency, parsedFeatures };
}
