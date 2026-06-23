export function useUtils() {
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value || 0);
  };

  const parsedFeatures = (features: any): string[] => {
    if (!features) return [];
    if (Array.isArray(features)) {
      return features.flatMap((f: any) =>
        String(f?.description ?? f).split('\n')
      ).map(s => s.trim()).filter(Boolean);
    }
    return String(features).split('\n').map((f: string) => f.trim()).filter(Boolean);
  };

  return { formatCurrency, parsedFeatures };
}
