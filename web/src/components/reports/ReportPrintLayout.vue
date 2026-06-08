<script setup>
  import { useUtils } from "@/composables/useUtils";

  const { formatCurrency } = useUtils();

  const props = defineProps({
    restaurantName: String,
    performanceTitle: String,
    currentDate: String,
    metrics: Object,
    revenueData: Array,
    getMaxRevenue: Function,
    salesByChannel: Array,
    paymentMethods: Array,
    topWaiters: Array,
    peakHours: Array,
    cancellations: Array,
    totalCancellationsCount: Number,
    financialImpact: String,
    topProducts: Array,
    couponUsage: Array,
    maxCouponUses: Function,
  });

  const maxCoupon = () => {
    if (typeof props.maxCouponUses === "function") return props.maxCouponUses();
    return Math.max(...(props.couponUsage || []).map((c) => c.uses), 1);
  };

  const getMetricLabel = (key) =>
    ({
      faturamento: "Faturamento",
      ticketMedio: "Ticket Médio",
      cancelamentos: "Cancelamentos",
      giroMesa: "Giro de Mesa",
    })[key] ?? key;

  const formatMetric = (key, val) => {
    if (key === "faturamento" || key === "ticketMedio")
      return formatCurrency(val);
    return val;
  };

  const maxRev = () => {
    if (typeof props.getMaxRevenue === "function") return props.getMaxRevenue();
    return Math.max(...(props.revenueData || []).map((d) => d.value), 1);
  };
</script>

<template>
  <div
    class="report-print-root w-full bg-white text-black font-sans"
    style="font-family: Inter, Arial, sans-serif"
  >
    <div
      style="
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        border-bottom: 2px solid #111;
        padding-bottom: 12px;
        margin-bottom: 20px;
        margin-top: 4px;
      "
    >
      <div style="display: flex; align-items: center; gap: 14px">
        <div
          style="
            width: 44px;
            height: 44px;
            background: #f3f4f6;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
          "
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path
              d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"
              stroke="#10b981"
              stroke-width="2"
              stroke-linecap="round"
            />
            <polyline
              points="9 22 9 12 15 12 15 22"
              stroke="#10b981"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </div>
        <div>
          <p
            style="
              font-size: 18px;
              font-weight: 900;
              color: #111;
              margin: 0;
              line-height: 1.1;
            "
          >
            Relatório de Gestão
          </p>
          <p
            style="
              font-size: 10px;
              font-weight: 700;
              color: #6b7280;
              text-transform: uppercase;
              letter-spacing: 0.1em;
              margin: 3px 0 0;
            "
          >
            {{ restaurantName }}
          </p>
        </div>
      </div>
      <div style="text-align: right">
        <p
          style="
            font-size: 10px;
            font-weight: 900;
            color: #111;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            margin: 0;
          "
        >
          {{ performanceTitle }}
        </p>
        <p
          style="
            font-size: 9px;
            color: #9ca3af;
            font-weight: 600;
            margin: 3px 0 0;
          "
        >
          Gerado em: {{ currentDate }}
        </p>
      </div>
    </div>

    <p
      style="
        font-size: 10px;
        font-weight: 900;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: #111;
        margin: 0 0 10px;
      "
    >
      Resumo Executivo
    </p>
    <div
      style="
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 10px;
        margin-bottom: 20px;
      "
    >
      <div
        v-for="(val, key) in metrics"
        :key="key"
        style="
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          padding: 10px 12px;
          background: #f9fafb;
          overflow: hidden;
        "
      >
        <p
          style="
            font-size: 8px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: #9ca3af;
            margin: 0 0 4px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          "
        >
          {{ getMetricLabel(key) }}
        </p>
        <p
          style="
            font-size: 15px;
            font-weight: 900;
            color: #111;
            margin: 0;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          "
        >
          {{ formatMetric(key, val) }}
        </p>
      </div>
    </div>

    <div
      style="
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
        margin-bottom: 20px;
        break-inside: avoid;
      "
    >
      <div>
        <p
          style="
            font-size: 9px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: #111;
            margin: 0 0 8px;
          "
        >
          Evolução de Receita
        </p>
        <div
          style="
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: 12px;
            display: flex;
            align-items: flex-end;
            justify-content: space-between;
            height: 140px;
            gap: 4px;
            background: #f9fafb;
          "
        >
          <div
            v-if="!revenueData || revenueData.length === 0"
            style="
              width: 100%;
              text-align: center;
              font-size: 10px;
              color: #9ca3af;
              align-self: center;
            "
          >
            Sem dados.
          </div>
          <div
            v-else
            v-for="(data, i) in revenueData"
            :key="i"
            style="
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: flex-end;
              flex: 1;
              height: 100%;
              min-width: 0;
            "
          >
            <span
              style="
                font-size: 6px;
                font-weight: 700;
                color: #374151;
                margin-bottom: 2px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                max-width: 100%;
                text-align: center;
              "
            >
              {{
                data.value >= 1000
                  ? (data.value / 1000).toFixed(1) + "k"
                  : data.value
              }}
            </span>
            <div
              style="
                width: 100%;
                background: #10b981;
                border-radius: 3px 3px 0 0;
              "
              :style="{
                height: `${(data.value / maxRev()) * 90}%`,
                minHeight: '3px',
              }"
            ></div>
            <span
              style="
                font-size: 6px;
                font-weight: 900;
                color: #9ca3af;
                text-transform: uppercase;
                margin-top: 4px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                max-width: 100%;
                text-align: center;
              "
            >
              {{ data.label.substring(0, 3) }}
            </span>
          </div>
        </div>
        <p
          style="
            font-size: 9px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: #111;
            margin: 8px 8px;
          "
        >
          Fluxo por Hora
        </p>
        <div
          style="
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: 10px;
            display: flex;
            align-items: flex-end;
            justify-content: space-between;
            height: 100px;
            gap: 3px;
            background: #fafafa;
          "
        >
          <div
            v-if="!peakHours || peakHours.length === 0"
            style="
              width: 100%;
              text-align: center;
              font-size: 9px;
              color: #9ca3af;
              align-self: center;
            "
          >
            Sem picos de fluxo.
          </div>
          <div
            v-else
            v-for="h in peakHours"
            :key="h.hora"
            style="
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: flex-end;
              flex: 1;
              height: 100%;
              min-width: 0;
            "
          >
            <div
              :style="{
                height: `${h.fluxo}%`,
                minHeight: '3px',
                background: '#f97316',
                width: '100%',
                borderRadius: '2px 2px 0 0',
              }"
            ></div>
            <span
              style="
                font-size: 6px;
                font-weight: 900;
                color: #9ca3af;
                margin-top: 3px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                max-width: 100%;
                text-align: center;
              "
            >
              {{ h.hora }}
            </span>
          </div>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 10px">
        <div
          style="
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: 12px;
            background: #fff;
          "
        >
          <p
            style="
              font-size: 8px;
              font-weight: 900;
              text-transform: uppercase;
              letter-spacing: 0.08em;
              color: #111;
              margin: 0 0 8px;
            "
          >
            Canais de Venda
          </p>
          <div
            v-if="!salesByChannel || salesByChannel.length === 0"
            style="font-size: 9px; color: #9ca3af; font-weight: 600"
          >
            Sem vendas registradas.
          </div>
          <div
            v-else
            v-for="channel in salesByChannel"
            :key="channel.name"
            style="margin-bottom: 6px"
          >
            <div
              style="
                display: flex;
                justify-content: space-between;
                font-size: 8px;
                margin-bottom: 3px;
              "
            >
              <span
                style="
                  color: #374151;
                  font-weight: 700;
                  white-space: nowrap;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  padding-right: 6px;
                "
              >
                {{ channel.name }}
              </span>
              <span style="font-weight: 900; color: #111; white-space: nowrap"
                >{{ channel.value }}%</span
              >
            </div>
            <div
              style="
                width: 100%;
                background: #e5e7eb;
                height: 5px;
                border-radius: 9999px;
                overflow: hidden;
              "
            >
              <div
                :style="{
                  width: channel.value + '%',
                  height: '100%',
                  borderRadius: '9999px',
                  background: channel.name.includes('Auto')
                    ? '#3b82f6'
                    : channel.name.includes('Caixa')
                      ? '#9ca3af'
                      : '#10b981',
                }"
              ></div>
            </div>
          </div>
        </div>

        <div
          style="
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: 12px;
            background: #fff;
            flex: 1;
          "
        >
          <p
            style="
              font-size: 8px;
              font-weight: 900;
              text-transform: uppercase;
              letter-spacing: 0.08em;
              color: #111;
              margin: 0 0 8px;
            "
          >
            Métodos de Recebimento
          </p>
          <div
            v-if="!paymentMethods || paymentMethods.length === 0"
            style="font-size: 9px; color: #9ca3af; font-weight: 600"
          >
            Sem pagamentos.
          </div>
          <div
            v-else
            v-for="method in paymentMethods"
            :key="method.name"
            style="margin-bottom: 6px"
          >
            <div
              style="
                display: flex;
                justify-content: space-between;
                font-size: 8px;
                margin-bottom: 3px;
              "
            >
              <span
                style="
                  color: #374151;
                  font-weight: 700;
                  white-space: nowrap;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  padding-right: 6px;
                "
              >
                {{ method.name }}
              </span>
              <span style="font-weight: 900; color: #111; white-space: nowrap"
                >{{ method.value }}%</span
              >
            </div>
            <div
              style="
                width: 100%;
                background: #e5e7eb;
                height: 5px;
                border-radius: 9999px;
                overflow: hidden;
              "
            >
              <div
                :style="{
                  width: method.value + '%',
                  height: '100%',
                  borderRadius: '9999px',
                  background: method.name.includes('Pix')
                    ? '#10b981'
                    : method.name.includes('Crédito')
                      ? '#3b82f6'
                      : '#818cf8',
                }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      style="
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
        margin-bottom: 20px;
        break-inside: avoid;
      "
    >
      <div>
        <p
          style="
            font-size: 9px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: #111;
            margin: 0 0 8px;
          "
        >
          Dados Operacionais
        </p>

        <div
          style="
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: 12px;
            margin-bottom: 8px;
            background: #fff;
          "
        >
          <p
            style="
              font-size: 8px;
              font-weight: 900;
              text-transform: uppercase;
              letter-spacing: 0.06em;
              color: #6b7280;
              margin: 0 0 8px;
            "
          >
            Top Staff (Vendas)
          </p>
          <div
            v-if="!topWaiters || topWaiters.length === 0"
            style="font-size: 9px; color: #9ca3af; font-weight: 600"
          >
            Sem dados de staff.
          </div>
          <div
            v-else
            v-for="(waiter, index) in topWaiters"
            :key="waiter.id"
            style="
              display: flex;
              justify-content: space-between;
              align-items: center;
              font-size: 9px;
              padding: 4px 0;
              border-bottom: 1px solid #f3f4f6;
            "
          >
            <span
              style="
                font-weight: 700;
                color: #374151;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                padding-right: 6px;
              "
            >
              {{ index + 1 }}. {{ waiter.name }}
              <span style="font-size: 8px; color: #9ca3af; font-weight: 400"
                >({{ waiter.orders }} ped.)</span
              >
            </span>
            <span style="font-weight: 900; color: #111; white-space: nowrap">{{
              formatCurrency(waiter.revenue)
            }}</span>
          </div>
        </div>
      </div>

      <div>
        <p
          style="
            font-size: 9px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: #111;
            margin: 0 0 8px;
          "
        >
          Auditoria de Perdas
        </p>
        <div
          style="
            border: 1px solid #fca5a5;
            border-radius: 12px;
            padding: 14px;
            background: #fff5f5;
            min-height: 160px;
          "
        >
          <p
            style="
              font-size: 9px;
              font-weight: 900;
              color: #991b1b;
              text-transform: uppercase;
              letter-spacing: 0.06em;
              margin: 0 0 10px;
              padding-bottom: 6px;
              border-bottom: 1px solid #fca5a5;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            "
          >
            Total Projetado: {{ financialImpact }}
          </p>
          <div
            v-if="!cancellations || cancellations.length === 0"
            style="
              font-size: 9px;
              color: #9ca3af;
              font-weight: 600;
              text-align: center;
              margin-top: 20px;
            "
          >
            Nenhuma perda registrada.
          </div>
          <div
            v-else
            v-for="item in cancellations"
            :key="item.motivo"
            style="margin-bottom: 8px"
          >
            <div
              style="
                display: flex;
                justify-content: space-between;
                font-size: 8px;
                font-weight: 700;
                color: #374151;
                margin-bottom: 3px;
              "
            >
              <span
                style="
                  white-space: nowrap;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  padding-right: 6px;
                "
              >
                {{ item.motivo }}
              </span>
              <span style="white-space: nowrap; font-weight: 900"
                >{{ item.count }} un.</span
              >
            </div>
            <div
              style="
                width: 100%;
                background: #fecaca;
                height: 5px;
                border-radius: 9999px;
                overflow: hidden;
              "
            >
              <div
                :style="{
                  width: `${totalCancellationsCount ? (item.count / totalCancellationsCount) * 100 : 0}%`,
                  height: '100%',
                  background: '#ef4444',
                  borderRadius: '9999px',
                }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div style="break-before: page; padding-top: 16px; padding-bottom: 20px">
      <div
        style="
          border-bottom: 2px solid #111;
          padding-bottom: 8px;
          margin-bottom: 14px;
        "
      >
        <p
          style="
            font-size: 13px;
            font-weight: 900;
            color: #111;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            margin: 0;
          "
        >
          Desempenho de Produtos
        </p>
        <p
          style="
            font-size: 8px;
            color: #6b7280;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.06em;
            margin: 3px 0 0;
          "
        >
          Detalhamento de vendas, categorias e faturamento por item do cardápio
        </p>
      </div>

      <div
        v-if="!topProducts || topProducts.length === 0"
        style="
          text-align: center;
          color: #9ca3af;
          font-weight: 700;
          font-size: 11px;
          margin-top: 30px;
        "
      >
        Sem produtos vendidos neste período.
      </div>

      <table
        v-else
        style="width: 100%; border-collapse: collapse; font-size: 9px"
      >
        <thead>
          <tr style="background: #f3f4f6">
            <th
              style="
                padding: 7px 10px;
                text-align: left;
                font-size: 8px;
                font-weight: 900;
                color: #6b7280;
                text-transform: uppercase;
                letter-spacing: 0.07em;
                border-bottom: 2px solid #e5e7eb;
              "
            >
              Produto
            </th>
            <th
              style="
                padding: 7px 10px;
                text-align: left;
                font-size: 8px;
                font-weight: 900;
                color: #6b7280;
                text-transform: uppercase;
                letter-spacing: 0.07em;
                border-bottom: 2px solid #e5e7eb;
              "
            >
              Categoria
            </th>
            <th
              style="
                padding: 7px 10px;
                text-align: center;
                font-size: 8px;
                font-weight: 900;
                color: #6b7280;
                text-transform: uppercase;
                letter-spacing: 0.07em;
                border-bottom: 2px solid #e5e7eb;
              "
            >
              Vendas
            </th>
            <th
              style="
                padding: 7px 10px;
                text-align: right;
                font-size: 8px;
                font-weight: 900;
                color: #6b7280;
                text-transform: uppercase;
                letter-spacing: 0.07em;
                border-bottom: 2px solid #e5e7eb;
              "
            >
              Faturamento
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(produto, i) in topProducts"
            :key="produto.nome"
            :style="{ background: i % 2 === 0 ? '#ffffff' : '#f9fafb' }"
          >
            <td
              style="
                padding: 6px 10px;
                font-weight: 700;
                color: #111;
                max-width: 130px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                border-bottom: 1px solid #f3f4f6;
              "
            >
              {{ produto.nome }}
            </td>
            <td
              style="
                padding: 6px 10px;
                color: #6b7280;
                font-weight: 500;
                border-bottom: 1px solid #f3f4f6;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              "
            >
              {{ produto.categoria }}
            </td>
            <td
              style="
                padding: 6px 10px;
                text-align: center;
                font-weight: 900;
                color: #111;
                border-bottom: 1px solid #f3f4f6;
              "
            >
              {{ produto.qtd }}
            </td>
            <td
              style="
                padding: 6px 10px;
                text-align: right;
                font-weight: 900;
                color: #059669;
                border-bottom: 1px solid #f3f4f6;
                white-space: nowrap;
              "
            >
              {{ formatCurrency(produto.receita) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div style="break-before: page; padding-top: 16px; padding-bottom: 20px">
      <div
        style="
          border-bottom: 2px solid #111;
          padding-bottom: 8px;
          margin-bottom: 14px;
        "
      >
        <p
          style="
            font-size: 13px;
            font-weight: 900;
            color: #111;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            margin: 0;
          "
        >
          Uso de Cupons de Desconto
        </p>
        <p
          style="
            font-size: 8px;
            color: #6b7280;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.06em;
            margin: 3px 0 0;
          "
        >
          Número de compras realizadas com cada cupom no período
        </p>
      </div>

      <div
        v-if="!couponUsage || couponUsage.length === 0"
        style="
          text-align: center;
          color: #9ca3af;
          font-weight: 700;
          font-size: 11px;
          margin-top: 30px;
        "
      >
        Nenhum cupom utilizado neste período.
      </div>

      <div
        v-else
        style="
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 16px;
          background: #fff;
        "
      >
        <div
          v-for="coupon in couponUsage"
          :key="coupon.code"
          style="margin-bottom: 12px"
        >
          <div
            style="
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 4px;
            "
          >
            <div style="display: flex; align-items: center; gap: 10px">
              <span
                style="
                  font-size: 10px;
                  font-weight: 900;
                  color: #111;
                  font-family: monospace;
                  letter-spacing: 0.1em;
                "
              >
                {{ coupon.code }}
              </span>
              <span style="font-size: 8px; font-weight: 700; color: #9ca3af">
                {{
                  coupon.type === "percent"
                    ? coupon.discount + "%"
                    : "R$ " + coupon.discount
                }}
                off
              </span>
            </div>
            <span
              style="
                font-size: 10px;
                font-weight: 900;
                color: #059669;
                white-space: nowrap;
              "
            >
              {{ coupon.uses }} usos
            </span>
          </div>
          <div
            style="
              width: 100%;
              background: #e5e7eb;
              height: 10px;
              border-radius: 9999px;
              overflow: hidden;
            "
          >
            <div
              :style="{
                width: `${(coupon.uses / maxCoupon()) * 100}%`,
                height: '100%',
                background: '#10b981',
                borderRadius: '9999px',
              }"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
  @media screen {
    .report-print-root {
      display: none;
    }
  }

  @media print {
    body * {
      visibility: hidden;
    }

    .report-print-root,
    .report-print-root * {
      visibility: visible;
    }

    .report-print-root {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      background: white !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    @page {
      size: A4;
      margin: 10mm 14mm;
    }
  }
</style>
