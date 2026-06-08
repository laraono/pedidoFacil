export function getGroupedOrderItems(order) {
  const items = order.items || order.productOrders || [];
  const groups = [];
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

export function getOrderOriginalTotal(order) {
  const items = getGroupedOrderItems(order);
  if (items.length === 0) return Number(order.price ?? 0);
  return items.reduce((sum, item) => sum + item.total, 0);
}

export function getOrderPaid(order) {
  return (order.paymentOrders || []).reduce((sum, po) => sum + Number(po.price || 0), 0);
}

export function getOrderTotal(order) {
  return Math.max(0, getOrderOriginalTotal(order) - getOrderPaid(order));
}

export function getComandaMainLabel(comanda) {
  return comanda?.isAutoatendimento && comanda?.customerName
    ? comanda.customerName
    : comanda?.label || `#${comanda?.id}`;
}

export const BACKEND_TO_LOCAL_STATUS = {
  Aguardando_Preparo: "pending",
  Em_Preparo: "preparing",
  Pronto: "ready",
  Finalizado: "finished",
  Cancelado: "cancelled",
};

const INACTIVE_STATUSES = new Set(["cancelled", "Cancelado", "CANCELADO"]);

export function resolveOrderStatus(order, kitchenOrders = []) {
  const kitchenOrder = kitchenOrders.find((ko) => ko.id === order.id);
  return kitchenOrder
    ? kitchenOrder.status
    : BACKEND_TO_LOCAL_STATUS[order.status] || order.status;
}

export function isOrderActive(order, kitchenOrders = []) {
  return !INACTIVE_STATUSES.has(resolveOrderStatus(order, kitchenOrders));
}
