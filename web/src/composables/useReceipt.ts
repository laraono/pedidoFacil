import { useToast } from "@/composables/useToast";
import localStorageService from "@/services/localStorageService";

interface GroupedItem {
  name: string;
  amount: number;
  price: number;
  total: number;
  observation: string;
  unitPrice?: number;
}

export function useReceipt() {
  const { showToast } = useToast();
  const comandaUnitLabel = localStorageService.getComandaUnitLabel() || 'Mesa';

  function getGroupedOrderItems(order: any): GroupedItem[] {
    const items: any[] = order.items || order.productOrders || [];
    const groups: GroupedItem[] = [];

    items.forEach((i: any) => {
      const variationName = i.variations?.[0]?.productVariation?.name || "";
      const baseName = i.name || i.product?.name || "Item";
      const fullName = baseName + (variationName ? ` (${variationName})` : "");
      const amount = Number(i.amount || i.quantity || 1);
      const price = Number(i.price ?? i.Preco_Unitario_Momento ?? 0);
      const obs = i.observation || i.obs || "";

      const existing = groups.find(
        (g) => g.name === fullName && Math.abs(g.price - price) < 0.01 && g.observation === obs
      );

      if (existing) {
        existing.amount += amount;
        existing.total += price * amount;
      } else {
        groups.push({
          name: fullName,
          amount,
          price,
          total: price * amount,
          observation: obs,
        });
      }
    });
    return groups;
  }

  function buildReceiptHtml(
    comanda: any, 
    paymentInfo: any = null, 
    selectedOrderIds: number[] = [], 
    kitchenOrders: any[] = []
  ): string {
    const now = new Date();
    const dateStr = now.toLocaleDateString("pt-BR");
    const timeStr = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    
    const allItems: GroupedItem[] = [];
    
    const relevantOrders: any[] = selectedOrderIds.length > 0 
      ? (comanda.orders || []).filter((o: any) => selectedOrderIds.includes(o.id)) 
      : (comanda.orders || []);

    relevantOrders.forEach((order: any) => {
      const kitchenOrder = kitchenOrders.find((k: any) => k.id === order.id);
      if (kitchenOrder?.status === "cancelled") return;
      
      const items = getGroupedOrderItems(order);
      items.forEach((item) => {
        const existing = allItems.find((i) => i.name === item.name);
        if (existing) { 
          existing.amount += item.amount; 
          existing.total += item.total; 
        } else { 
          allItems.push({ 
            name: item.name, 
            amount: item.amount, 
            price: item.price,
            unitPrice: item.price, 
            total: item.total,
            observation: item.observation
          }); 
        }
      });
    });

    const subtotalVal = paymentInfo?.subtotal || 0;
    const totalFinal = paymentInfo ? paymentInfo.totalFinal : subtotalVal;
    const coupon = paymentInfo?.coupon || null;
    const couponDisc = paymentInfo?.couponDiscount || 0;
    const manualDisc = paymentInfo?.manualDiscount || 0;
    const payments = paymentInfo?.payments || [];

    const itemRows = allItems.map((i) => `<tr><td style="padding:5px 4px;">${i.amount}x</td><td style="padding:5px 4px;">${i.name}</td><td style="padding:5px 4px;text-align:right;">R$ ${(i.unitPrice || i.price).toFixed(2)}</td><td style="padding:5px 4px;text-align:right;">R$ ${i.total.toFixed(2)}</td></tr>`).join("");
    const discountSection = manualDisc > 0 || couponDisc > 0 ? `<tr style="color:#555;"><td colspan="3" style="padding:4px;border-top:1px dashed #ccc;padding-top:8px;">Subtotal</td><td style="padding:4px;text-align:right;border-top:1px dashed #ccc;padding-top:8px;">R$ ${subtotalVal.toFixed(2)}</td></tr>${manualDisc > 0 ? `<tr style="color:#c00;"><td colspan="3" style="padding:3px 4px;">Desconto aplicado</td><td style="padding:3px 4px;text-align:right;">− R$ ${manualDisc.toFixed(2)}</td></tr>` : ""}${couponDisc > 0 ? `<tr style="color:#c00;"><td colspan="3" style="padding:3px 4px;">Cupom ${coupon ? `(${coupon})` : ""}</td><td style="padding:3px 4px;text-align:right;">− R$ ${couponDisc.toFixed(2)}</td></tr>` : ""}` : "";
    const paymentSection = payments.length ? payments.map((p: any) => `<tr><td colspan="3" style="padding:3px 4px;color:#555;">${p.type}</td><td style="padding:3px 4px;text-align:right;">R$ ${Number(p.amount).toFixed(2)}</td></tr>`).join("") : "";
    
    return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>Cupom</title><style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:monospace;font-size:13px;color:#111;background:#fff;padding:16px;}.wrap{max-width:320px;margin:0 auto;}h2{text-align:center;font-size:16px;letter-spacing:1px;margin-bottom:2px;}.sub{text-align:center;color:#555;font-size:11px;margin-bottom:12px;}hr{border:none;border-top:1px dashed #aaa;margin:10px 0;}table{width:100%;border-collapse:collapse;}th{text-align:left;font-size:10px;text-transform:uppercase;color:#888;padding:4px;}th:last-child,th:nth-child(3){text-align:right;}.total-row td{font-weight:bold;font-size:15px;border-top:2px solid #111;padding-top:8px;padding-bottom:4px;}.footer{text-align:center;margin-top:14px;color:#888;font-size:10px;}@media print{body{padding:0;}button{display:none!important;}}</style></head><body><div class="wrap"><h2>CUPOM FISCAL</h2><p class="sub">${dateStr} às ${timeStr}</p><hr><p style="font-size:11px;margin-bottom:6px;">${comandaUnitLabel}: <strong>${comanda.isAutoatendimento && comanda.customerName ? comanda.customerName : comanda.label}</strong></p><hr><table><thead><tr><th>Qtd</th><th>Descrição</th><th>Unit.</th><th>Total</th></tr></thead><tbody>${itemRows}${discountSection}<tr class="total-row"><td colspan="3">TOTAL</td><td style="text-align:right;">R$ ${Number(totalFinal).toFixed(2)}</td></tr>${paymentSection}</tbody></table><hr><p class="footer">Obrigado!</p><div style="text-align:center;margin-top:16px;"><button onclick="window.print()" style="padding:8px 20px;background:#1976d2;color:#fff;border:none;border-radius:6px;font-size:13px;cursor:pointer;">Imprimir</button></div></div></body></html>`;
  }

  function emitReceipt(
    comanda: any, 
    paymentInfo: any = null, 
    selectedOrderIds: number[] = [], 
    kitchenOrders: any[] = []
  ): void {
    const html = buildReceiptHtml(comanda, paymentInfo, selectedOrderIds, kitchenOrders);
    const win = window.open("", "_blank", "width=400,height=600");
    if (!win) { 
      showToast("Permita pop-ups para imprimir.", "error"); 
      return; 
    }
    
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 400);
  }

  return { emitReceipt };
}