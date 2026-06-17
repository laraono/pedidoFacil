interface Variation {
  productVariation?: { name?: string };
}

interface OrderItem {
  name?: string;
  product?: { name?: string };
  variations?: Variation[];
  amount?: number;
  quantity?: number;
  price?: number;
  Preco_Unitario_Momento?: number;
  observation?: string;
  obs?: string;
}

interface GroupedItem {
  name: string;
  amount: number;
  price: number;
  total: number;
  observation: string;
}

interface PaymentOrder {
  price?: number;
}

interface Order {
  items?: OrderItem[];
  productOrders?: OrderItem[];
  price?: number;
  paymentOrders?: PaymentOrder[];
  status?: string;
  id?: number;
}

interface KitchenOrder {
  id?: number;
  status: string;
}

interface Comanda {
  isAutoatendimento?: boolean;
  customerName?: string;
  label?: string;
  id?: number;
}

export function getGroupedOrderItems(order: Order): GroupedItem[] {
  const items = order.items || order.productOrders || [];
  const groups: GroupedItem[] = [];
  items.forEach((i) => {
    const variationName = (i.variations?.[0]?.productVariation?.name || "").trim();
    const baseName = (i.name || i.product?.name || "Item").trim();
    const fullName = baseName + (variationName ? ` (${variationName})` : "");
    const amount = Number(i.amount || i.quantity || 1);
    const price = Number(i.price ?? i.Preco_Unitario_Momento ?? 0);
    const obs = (i.observation || i.obs || "").trim();
    const existing = groups.find(
      (g) => g.name === fullName && Math.abs(g.price - price) < 0.01 && g.observation === obs
    );
    if (existing) {
      existing.amount += amount;
      existing.total += price * amount;
    } else {
      groups.push({ name: fullName, amount, price, total: price * amount, observation: obs });
    }
  });
  return groups;
}

export function getOrderOriginalTotal(order: Order): number {
  const items = getGroupedOrderItems(order);
  if (items.length === 0) return Number(order.price ?? 0);
  return items.reduce((sum, item) => sum + item.total, 0);
}

export function getOrderPaid(order: Order): number {
  return (order.paymentOrders || []).reduce((sum, po) => sum + Number(po.price || 0), 0);
}

export function getOrderTotal(order: Order): number {
  return Math.max(0, getOrderOriginalTotal(order) - getOrderPaid(order));
}

export function getComandaMainLabel(comanda: Comanda | null | undefined): string {
  return comanda?.isAutoatendimento && comanda?.customerName
    ? comanda.customerName
    : comanda?.label || `#${comanda?.id}`;
}

export const BACKEND_TO_LOCAL_STATUS: Record<string, string> = {
  Aguardando_Preparo: "pending",
  Em_Preparo: "preparing",
  Pronto: "ready",
  Finalizado: "finished",
  Cancelado: "cancelled",
};

const INACTIVE_STATUSES = new Set(["cancelled", "Cancelado", "CANCELADO"]);

export function resolveOrderStatus(order: Order, kitchenOrders: KitchenOrder[] = []): string {
  const kitchenOrder = kitchenOrders.find((ko) => ko.id === order.id);
  if (kitchenOrder) return kitchenOrder.status;
  const rawStatus = typeof order.status === 'object' && order.status !== null
    ? (order.status as any).nome
    : (order.status as string);
  return BACKEND_TO_LOCAL_STATUS[rawStatus || ""] || rawStatus || "";
}

export function isOrderActive(order: Order, kitchenOrders: KitchenOrder[] = []): boolean {
  return !INACTIVE_STATUSES.has(resolveOrderStatus(order, kitchenOrders));
}