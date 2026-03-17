<template>
  <SubscriptionGuard featureName="O Caixa">
  <div class="h-screen bg-black flex flex-col font-inter overflow-hidden text-white">

    <header class="h-16 md:h-20 bg-zinc-900 border-b border-white/10 flex items-center justify-between px-6 md:px-8 shadow-2xl z-20 shrink-0">
      <div class="flex items-center gap-4">
        <div class="bg-brand-green p-2 rounded-xl text-black shadow-lg shadow-brand-green/20">
          <Monitor :size="20" class="md:w-6 md:h-6" />
        </div>
        <div>
          <h1 class="text-white font-black text-lg tracking-tight leading-none uppercase">Caixa de Operações</h1>
          <p class="text-gray-500 text-[10px] uppercase font-black tracking-widest mt-1">Terminal de Liquidação</p>
        </div>
      </div>
    </header>

    <main class="flex-grow flex flex-col p-4 md:p-8 overflow-hidden bg-black">
      <section class="flex-1 flex flex-col min-w-0 bg-zinc-900/50 rounded-[2.5rem] border border-white/10 shadow-inner overflow-hidden">
        <header class="p-6 md:px-8 flex justify-between items-center bg-white/5 backdrop-blur-md z-10 border-b border-white/5">
          <div class="flex items-center gap-3">
            <div class="w-2 h-6 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
            <h2 class="font-black text-white text-base md:text-lg uppercase tracking-widest">Comandas Ativas</h2>
          </div>
          <span class="bg-blue-600 text-white font-black px-4 py-1 rounded-full text-xs shadow-lg border border-blue-400/30">
            {{ comandaStore.comandas.length }}
          </span>
        </header>

        <div class="flex-grow p-6 md:p-8 overflow-y-auto custom-scrollbar">
          <div v-if="comandaStore.comandas.length === 0" class="flex flex-col items-center justify-center h-full text-gray-600 opacity-40 min-h-[200px]">
            <FileText :size="48" class="mb-4" />
            <p class="font-black uppercase tracking-widest text-sm">Nenhuma comanda ativa</p>
          </div>
          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <div v-for="comanda in comandaStore.comandas" :key="comanda.id"
              class="bg-white/5 rounded-[2rem] border border-white/5 p-6 cursor-pointer hover:border-blue-500/50 hover:bg-white/[0.08] transition-all group"
              @click="openDetails(comanda)">
              <div class="flex justify-between items-start mb-4">
                <div>
                  <span class="text-gray-500 text-[10px] font-black uppercase tracking-widest block mb-1">Comanda</span>
                  <span class="font-black text-white text-xl tracking-tighter group-hover:text-blue-400 transition-colors">{{ comanda.label || '#' + comanda.id }}</span>
                </div>
                <span class="text-brand-green font-black text-lg tracking-tighter">R$ {{ comanda.total.toFixed(2) }}</span>
              </div>
              <div class="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-black/40 p-3 rounded-xl border border-white/5">
                <Receipt :size="14" class="text-blue-500" />
                {{ comanda.orders.length }} pedidos vinculados
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <div v-if="showDetails" class="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 z-50">
      <div class="bg-zinc-900 border border-white/10 rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        <div class="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02] shrink-0">
          <div class="flex items-center gap-4">
            <div class="bg-blue-500/10 p-3 rounded-2xl text-blue-500 border border-blue-500/20">
              <Receipt :size="24" />
            </div>
            <div>
              <h2 class="text-2xl font-black text-white uppercase tracking-tighter">{{ selectedComanda.label || 'Comanda #' + selectedComanda.id }}</h2>
              <p class="text-gray-500 text-[10px] font-black uppercase tracking-widest">Processamento Financeiro</p>
            </div>
          </div>
          <button @click="closeDetails" class="p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-full transition-all">
            <X :size="24" />
          </button>
        </div>

        <div class="p-8 overflow-y-auto custom-scrollbar bg-zinc-900">
          <h3 class="font-black text-gray-500 mb-6 uppercase tracking-[0.2em] text-[10px]">Detalhamento de Consumo</h3>

          <!-- Alerta de pedidos pendentes -->
          <div v-if="hasPending" class="mb-4 flex items-start gap-3 p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/30">
            <AlertTriangle :size="18" class="text-yellow-400 shrink-0 mt-0.5" />
            <div>
              <p class="text-yellow-300 font-black text-xs uppercase tracking-widest">Pedidos aguardando preparo</p>
              <p class="text-yellow-400/80 text-xs mt-1">Um ou mais itens ainda não foram enviados para a cozinha. Será necessário cancelá-los para finalizar.</p>
            </div>
          </div>

          <div class="space-y-4">
            <div v-for="order in ordersWithStatus" :key="order.id"
              class="rounded-3xl p-6"
              :class="order.status === 'pending'
                ? 'border border-yellow-500/30 bg-yellow-500/5'
                : 'border border-white/5 bg-white/[0.03]'">
              <div class="flex justify-between items-center mb-4">
                <span class="font-black text-white text-sm uppercase tracking-widest">Pedido #{{ order.id }}</span>
                <span class="px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border"
                  :class="{'border-yellow-500/30 bg-yellow-500/10 text-yellow-500': order.status === 'pending',
                           'border-blue-500/30 bg-blue-500/10 text-blue-500': order.status === 'preparing',
                           'border-brand-green/30 bg-brand-green/10 text-brand-green': order.status === 'ready'}">
                  {{ order.status === 'pending' ? 'Aguardando' : order.status === 'preparing' ? 'Preparando' : 'Pronto' }}
                </span>
              </div>
              <div class="space-y-2 mb-4">
                <div v-for="item in order.items" :key="item.name" class="flex justify-between text-xs font-bold text-gray-400">
                  <span>{{ item.amount }}x {{ item.name }}</span>
                  <span class="text-gray-300">R$ {{ (item.price || 0).toFixed(2) }}</span>
                </div>
              </div>
              <div class="text-right font-black text-white text-sm mt-3 pt-3 border-t border-white/5 border-dashed">
                Total Pedido: <span class="text-blue-400 ml-2">R$ {{ order.price.toFixed(2) }}</span>
              </div>
            </div>
          </div>

          <div class="mt-10 border border-white/10 rounded-3xl p-8 bg-black/40 shadow-inner">
            <div class="flex justify-between text-sm font-black text-gray-400 uppercase tracking-widest">
              <span>Subtotal da Conta:</span>
              <span class="text-white">R$ {{ subtotal.toFixed(2) }}</span>
            </div>
            <div class="mt-6 p-6 bg-white/[0.03] rounded-2xl border border-white/5">
              <label class="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Aplicar Ajuste/Desconto</label>
              <div class="flex gap-4">
                <select v-model="discountType" class="bg-zinc-800 border border-white/10 rounded-xl px-4 py-3 text-xs font-black uppercase text-white outline-none focus:ring-2 focus:ring-blue-500 flex-1">
                  <option value="percent">Percentual (%)</option>
                  <option value="fixed">Valor fixo (R$)</option>
                </select>
                <div class="relative">
                  <input
                    :value="discountRaw"
                    @input="onDiscountInput"
                    inputmode="numeric"
                    :placeholder="discountType === 'percent' ? '0' : '0,00'"
                    class="bg-zinc-800 border border-white/10 rounded-xl px-4 py-3 text-lg font-black text-center text-brand-green w-32 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span class="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-black text-gray-500 pointer-events-none">
                    {{ discountType === 'percent' ? '%' : 'R$' }}
                  </span>
                </div>
              </div>
            </div>
            <div class="flex justify-between items-end mt-8">
              <span class="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Total Final</span>
              <span class="text-4xl font-black text-brand-green tracking-tighter drop-shadow-[0_0_15px_rgba(0,255,159,0.3)]">
                R$ {{ totalWithDiscount.toFixed(2) }}
              </span>
            </div>
          </div>

          <div class="mt-10">
            <h3 class="font-black text-gray-500 mb-6 uppercase tracking-[0.2em] text-[10px]">Método de Liquidação</h3>
            <div class="bg-white/[0.02] border border-white/5 p-8 rounded-[2rem]">
              <div class="mb-6 flex items-center gap-6 flex-wrap">
                <label class="flex items-center cursor-pointer">
                  <div class="relative">
                    <input type="checkbox" v-model="splitPayment" class="sr-only" />
                    <div class="w-12 h-6 bg-zinc-700 rounded-full transition-colors" :class="{'bg-blue-600': splitPayment}"></div>
                    <div class="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform" :class="{'translate-x-6': splitPayment}"></div>
                  </div>
                  <span class="ml-3 font-black text-xs uppercase text-gray-400 tracking-widest">Dividir Pagamento</span>
                </label>
                <div v-if="splitPayment" class="flex items-center gap-4 bg-black/40 px-4 py-2 rounded-xl border border-white/10">
                  <span class="text-[10px] font-black text-gray-500 uppercase">Pessoas:</span>
                  <input type="number" v-model.number="numberOfPeople" min="2" max="20"
                    class="bg-transparent text-white font-black w-12 text-center outline-none" />
                  <button @click="distributeEqually" class="px-4 py-1.5 bg-blue-600 text-white text-[10px] font-black uppercase rounded-lg hover:bg-blue-500 transition-colors">
                    Calcular
                  </button>
                </div>
              </div>

              <div v-if="!splitPayment" class="flex gap-3 flex-wrap">
                <button v-for="method in ['Dinheiro', 'Cartão Débito', 'Cartão Crédito', 'PIX']" :key="method"
                  @click="paymentSplits[0].type = method"
                  class="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all border"
                  :class="paymentSplits[0]?.type === method
                    ? 'bg-brand-green text-black border-brand-green'
                    : 'bg-white/5 text-gray-400 border-white/10 hover:border-white/20 hover:text-white'">
                  {{ method }}
                </button>
              </div>

              <div v-else class="space-y-4">
                <div v-for="(split, idx) in paymentSplits" :key="idx" class="flex flex-col gap-2">
                  <div class="flex gap-3 items-center p-4 rounded-2xl border transition-all"
                    :class="!split.amount || split.amount <= 0 ? 'bg-red-500/5 border-red-500/30' : 'bg-black/20 border-white/5'">
                    <select v-model="split.type"
                      class="bg-zinc-800 border border-white/10 rounded-xl px-3 py-2 text-xs font-black text-white outline-none flex-1">
                      <option v-for="m in ['Dinheiro', 'Cartão Débito', 'Cartão Crédito', 'PIX']" :key="m">{{ m }}</option>
                    </select>
                    <input type="text" :value="utils.formatCurrency(split.amount)"
                      @input="applyMask($event, split)"
                      class="bg-zinc-800 border border-white/10 rounded-xl px-3 py-2 text-sm font-black text-brand-green text-right w-32 outline-none" />
                    <button v-if="paymentSplits.length > 1" @click="removePaymentSplit(idx)"
                      class="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-all">
                      <X :size="16" />
                    </button>
                  </div>
                  <p v-if="split.amount <= 0" class="text-red-400 text-[10px] font-bold ml-4 flex items-center gap-1 uppercase tracking-widest">
                    <AlertCircle :size="10" /> Valor obrigatório
                  </p>
                </div>
                
                <button @click="addPaymentSplit"
                  class="w-full py-3 border border-dashed border-white/10 rounded-2xl text-gray-500 text-xs font-black uppercase tracking-widest hover:border-white/20 hover:text-gray-300 transition-all">
                  + Adicionar método
                </button>

                <div class="flex justify-between text-xs font-black pt-2 border-t border-white/5"
                  :class="Math.abs(totalPayments - totalWithDiscount) > 0.01 ? 'text-red-400' : 'text-brand-green'">
                  <span class="uppercase tracking-widest">Distribuído:</span>
                  <span>R$ {{ totalPayments.toFixed(2) }} / R$ {{ totalWithDiscount.toFixed(2) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="p-8 border-t border-white/5 bg-black/20 flex flex-col gap-6 shrink-0">
          
          <div v-if="isFinalizeDisabled && splitPayment" 
            class="flex items-center gap-4 p-4 rounded-2xl border animate-pulse bg-red-500/10 border-red-500/30">
            <div class="p-2 bg-red-500/20 rounded-lg text-red-500">
              <AlertTriangle :size="20" />
            </div>
            <div class="flex-grow">
              <p class="text-xs font-black uppercase tracking-widest text-white">Pagamento Bloqueado</p>
              <p class="text-[11px] font-bold text-gray-400">
                <span v-if="paymentSplits.some(s => !s.amount || s.amount <= 0)">Existem pessoas com valor R$ 0,00 na divisão.</span>
                <span v-else-if="totalPayments < totalWithDiscount">
                  Faltam <span class="text-red-400 font-black">R$ {{ (totalWithDiscount - totalPayments).toFixed(2) }}</span> para atingir o total.
                </span>
                <span v-else-if="totalPayments > totalWithDiscount">
                  O valor excede em <span class="text-red-400 font-black">R$ {{ (totalPayments - totalWithDiscount).toFixed(2) }}</span> o total da conta.
                </span>
              </p>
            </div>
          </div>

          <div class="flex justify-between gap-4">
            <button @click="closeDetails" class="px-8 py-3 bg-transparent border border-white/10 text-gray-400 font-black uppercase tracking-widest text-xs rounded-xl hover:bg-white/5 transition-all">
              Cancelar
            </button>
            <button @click="handleFinalize" :disabled="isFinalizeDisabled"
              class="flex-grow sm:flex-none px-12 py-3 bg-brand-green text-black font-black uppercase tracking-widest text-xs rounded-xl hover:bg-green-400 transition-all shadow-lg shadow-brand-green/20 flex items-center justify-center gap-3 disabled:opacity-20 disabled:grayscale disabled:cursor-not-allowed">
              <CheckCircle :size="18" /> {{ isFinalizeDisabled ? 'Pagamento Inválido' : 'Confirmar Pagamento' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showRulesModal" class="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-[110]">
      <div class="bg-zinc-900 border border-white/10 rounded-[2rem] p-8 w-full max-w-md shadow-2xl">
        <div class="flex items-start gap-4 mb-6">
          <div class="p-3 rounded-2xl border shrink-0"
            :class="pendingCancel ? 'bg-red-500/10 border-red-500/20' : 'bg-yellow-500/10 border-yellow-500/20'">
            <AlertTriangle :size="22" :class="pendingCancel ? 'text-red-400' : 'text-yellow-500'" />
          </div>
          <div>
            <p class="text-white font-bold text-sm leading-relaxed">{{ rulesModalMessage }}</p>
          </div>
        </div>

        <!-- Motivo de cancelamento (só quando pendingCancel) -->
        <div v-if="pendingCancel" class="mb-6">
          <label class="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">
            Motivo do Cancelamento <span class="text-red-400">*</span>
          </label>
          <select
            v-model="cancelReason"
            class="w-full bg-zinc-800 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white outline-none focus:border-red-500/40 transition-all cursor-pointer"
          >
            <option value="" disabled>Selecione o motivo...</option>
            <option value="Demora no preparo">Demora no preparo</option>
            <option value="Pedido errado / Erro do Garçom">Pedido errado / Erro do Garçom</option>
            <option value="Desistência / Cliente foi embora">Desistência / Cliente foi embora</option>
          </select>
        </div>

        <div class="flex gap-3">
          <button @click="confirmRules(false)" class="flex-1 px-6 py-3 bg-white/5 border border-white/10 text-gray-400 font-black uppercase tracking-widest text-xs rounded-xl hover:bg-white/10 transition-all">
            Voltar
          </button>
          <button @click="confirmRules(true)"
            :disabled="pendingCancel && !cancelReason.trim()"
            class="flex-1 px-6 py-3 font-black uppercase tracking-widest text-xs rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            :class="pendingCancel ? 'bg-red-500 text-white hover:bg-red-400' : 'bg-brand-green text-black hover:bg-green-400'">
            {{ pendingCancel ? 'Cancelar Pedidos' : 'Confirmar' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="paymentFlowActive" class="fixed inset-0 backdrop-blur-xl flex items-center justify-center p-4 z-[120]">
      <div class="bg-zinc-900 border border-white/10 rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden">
        <div class="p-8 border-b border-white/5 bg-white/[0.02]">
          <div class="flex items-center justify-between mb-2">
            <span class="text-[10px] font-black text-gray-500 uppercase tracking-widest">
              Pagamento {{ currentPaymentIndex + 1 }} de {{ pendingPayments.length }}
            </span>
            <div class="flex gap-1">
              <div v-for="i in pendingPayments.length" :key="i"
                class="w-8 h-1.5 rounded-full transition-all"
                :class="i - 1 <= currentPaymentIndex ? 'bg-brand-green' : 'bg-white/10'"></div>
            </div>
          </div>
          <h2 class="text-2xl font-black text-white">{{ pendingPayments[currentPaymentIndex]?.type }}</h2>
          <p class="text-brand-green font-black text-3xl mt-1">
            R$ {{ (pendingPayments[currentPaymentIndex]?.amount || 0).toFixed(2) }}
          </p>
        </div>
        <div class="p-8">
          <template v-if="pendingPayments[currentPaymentIndex]?.type === 'Dinheiro'">
            <div class="space-y-4">
              <div class="space-y-1.5">
                <label class="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Valor Recebido</label>
                <input type="number" v-model.number="cashReceivedForCurrent" min="0" step="0.01"
                  class="w-full py-4 px-4 rounded-2xl border bg-white/5 border-white/10 text-white text-xl font-black text-right focus:border-brand-green/50 focus:outline-none transition-all"
                  @input="updateChangeBreakdown" />
              </div>
              <div v-if="cashReceivedForCurrent >= (pendingPayments[currentPaymentIndex]?.amount || 0)"
                class="p-6 bg-brand-green/10 border border-brand-green/20 rounded-2xl">
                <div class="flex justify-between items-center mb-3">
                  <span class="text-xs font-black text-gray-400 uppercase tracking-widest">Troco</span>
                  <span class="text-2xl font-black text-brand-green">
                    R$ {{ (cashReceivedForCurrent - (pendingPayments[currentPaymentIndex]?.amount || 0)).toFixed(2) }}
                  </span>
                </div>
                <div v-if="changeBreakdownList.length > 0" class="space-y-1.5">
                  <p class="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Detalhamento:</p>
                  <div v-for="item in changeBreakdownList" :key="item.label" class="flex justify-between text-xs font-bold text-white">
                    <span class="text-gray-400">{{ item.label }}</span>
                    <span>× {{ item.count }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="mt-8 flex gap-3">
              <button @click="cancelPaymentFlow" class="flex-1 py-3 bg-white/5 border border-white/10 text-gray-400 font-black uppercase text-xs rounded-xl hover:bg-white/10 transition-all">
                Cancelar
              </button>
              <button @click="confirmCashPayment"
                :disabled="cashReceivedForCurrent < (pendingPayments[currentPaymentIndex]?.amount || 0)"
                class="flex-1 py-3 bg-brand-green text-black font-black uppercase text-xs rounded-xl hover:bg-green-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                Confirmar
              </button>
            </div>
          </template>
          <template v-else>
            <div class="p-6 bg-white/[0.03] border border-white/5 rounded-2xl text-center mb-8">
              <p class="text-gray-400 font-bold text-sm mb-2">Confirmar recebimento via</p>
              <p class="text-white font-black text-xl">{{ pendingPayments[currentPaymentIndex]?.type }}</p>
              <p class="text-brand-green font-black text-3xl mt-2">
                R$ {{ (pendingPayments[currentPaymentIndex]?.amount || 0).toFixed(2) }}
              </p>
            </div>
            <div class="flex gap-3">
              <button @click="cancelPaymentFlow" class="flex-1 py-3 bg-white/5 border border-white/10 text-gray-400 font-black uppercase text-xs rounded-xl hover:bg-white/10 transition-all">
                Cancelar
              </button>
              <button @click="confirmNonCashPayment"
                class="flex-1 py-3 bg-brand-green text-black font-black uppercase text-xs rounded-xl hover:bg-green-400 transition-all flex items-center justify-center gap-2">
                <CheckCircle :size="16" /> Recebido
              </button>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
  </SubscriptionGuard>
</template>

<script setup>
import SubscriptionGuard from '@/components/SubscriptionGuard.vue';
import { ref, computed, watch } from 'vue';
import { useComandaStore } from '@/stores/comandaManagement';
import { useClosedComandaStore } from '@/stores/closedComandas';
import { useKitchenStore } from '@/stores/kitchen';
import { useToast } from '@/composables/useToast';
import { useUtils } from '@/composables/useUtils.js';
import { Monitor, Receipt, AlertTriangle, FileText, CheckCircle, X, AlertCircle } from 'lucide-vue-next';

const comandaStore = useComandaStore();
const closedComandaStore = useClosedComandaStore();
const kitchenStore = useKitchenStore();
const utils = useUtils();
const { showToast } = useToast();

const denominations = [
  { label: 'R$ 200', value: 200 }, { label: 'R$ 100', value: 100 },
  { label: 'R$ 50', value: 50 }, { label: 'R$ 20', value: 20 },
  { label: 'R$ 10', value: 10 }, { label: 'R$ 5', value: 5 },
  { label: 'R$ 2', value: 2 }, { label: 'R$ 1', value: 1 },
  { label: 'R$ 0,50', value: 0.5 }, { label: 'R$ 0,25', value: 0.25 },
  { label: 'R$ 0,10', value: 0.1 }, { label: 'R$ 0,05', value: 0.05 },
];

const selectedComanda = ref(null);
const showDetails = ref(false);
const discountType = ref('percent');
const discountValue = ref(0);
const discountRaw = ref('');

const applyDiscountMask = (raw) => {
  let val = String(raw).replace(/[^\d,]/g, '');
  const commaIdx = val.indexOf(',');
  if (commaIdx !== -1) {
    val = val.slice(0, commaIdx + 1) + val.slice(commaIdx + 1).replace(/,/g, '');
    val = val.slice(0, commaIdx + 3);
  }
  const parts = val.split(',');
  parts[0] = parts[0].replace(/^0+(\d)/, '$1');
  return parts.join(',');
};

const onDiscountInput = (e) => {
  if (discountType.value === 'percent') {
    const digits = e.target.value.replace(/\D/g, '');
    const num = Math.min(100, parseInt(digits, 10) || 0);
    discountValue.value = num;
    discountRaw.value = num === 0 ? '' : String(num);
  } else {
    const masked = applyDiscountMask(e.target.value);
    discountRaw.value = masked;
    discountValue.value = parseFloat(masked.replace(',', '.')) || 0;
  }
};
const paymentSplits = ref([{ type: 'Dinheiro', amount: 0 }]);
const splitPayment = ref(false);
const numberOfPeople = ref(1);
const showRulesModal = ref(false);
const rulesModalMessage = ref('');
const pendingCancel = ref(false);
const cancelReason = ref('');
const paymentFlowActive = ref(false);
const pendingPayments = ref([]);
const currentPaymentIndex = ref(0);
const cashReceivedForCurrent = ref(0);
const currentChangeBreakdown = ref({});

const ordersWithStatus = computed(() => {
  if (!selectedComanda.value) return [];
  return selectedComanda.value.orders.map(order => {
    const kitchenOrder = kitchenStore.orders.find(o => o.id === order.id);
    return { ...order, status: kitchenOrder ? kitchenOrder.status : 'ready' };
  });
});

const hasPreparing = computed(() => ordersWithStatus.value.some(o => o.status === 'preparing'));
const hasPending = computed(() => ordersWithStatus.value.some(o => o.status === 'pending'));
const subtotal = computed(() => selectedComanda.value?.total || 0);

const totalWithDiscount = computed(() => {
  const sub = subtotal.value;
  if (!discountValue.value) return sub;
  if (discountType.value === 'percent') return sub * (1 - discountValue.value / 100);
  return Math.max(0, sub - discountValue.value);
});

const totalPayments = computed(() => paymentSplits.value.reduce((sum, s) => sum + (s.amount || 0), 0));

// Validação centralizada para o botão de confirmação
const isFinalizeDisabled = computed(() => {
  if (splitPayment.value) {
    const hasZero = paymentSplits.value.some(s => !s.amount || s.amount <= 0);
    const totalMismatch = Math.abs(totalPayments.value - totalWithDiscount.value) > 0.01;
    return hasZero || totalMismatch;
  }
  return totalWithDiscount.value <= 0;
});

watch(discountType, () => { discountValue.value = 0; discountRaw.value = ''; });

watch(numberOfPeople, (newVal) => {
  const num = Math.max(2, newVal);
  if (num !== newVal) numberOfPeople.value = num;
  const currentLength = paymentSplits.value.length;
  if (currentLength < num) {
    for (let i = currentLength; i < num; i++) paymentSplits.value.push({ type: 'Dinheiro', amount: 0 });
  } else if (currentLength > num) {
    paymentSplits.value.splice(num);
  }
});

function distributeEqually() {
  const num = numberOfPeople.value;
  const total = totalWithDiscount.value;
  const each = Math.floor((total / num) * 100) / 100;
  paymentSplits.value = Array.from({ length: num }, (_, i) => ({
    type: 'Dinheiro',
    amount: i === 0 ? total - each * (num - 1) : each,
  }));
}

function updateChangeBreakdown() {
  const current = pendingPayments.value[currentPaymentIndex.value];
  const received = cashReceivedForCurrent.value;
  if (received >= current.amount) {
    const change = received - current.amount;
    const breakdown = {};
    let remainingCents = Math.round(change * 100);
    for (const denom of denominations) {
      const denomCents = Math.round(denom.value * 100);
      if (remainingCents >= denomCents) {
        const count = Math.floor(remainingCents / denomCents);
        breakdown[denom.label] = count;
        remainingCents -= count * denomCents;
      }
    }
    currentChangeBreakdown.value = breakdown;
  } else {
    currentChangeBreakdown.value = {};
  }
}

const changeBreakdownList = computed(() =>
  Object.entries(currentChangeBreakdown.value).map(([label, count]) => ({ label, count }))
);

function openDetails(comanda) {
  selectedComanda.value = comanda;
  discountType.value = 'percent';
  discountValue.value = 0;
  splitPayment.value = false;
  numberOfPeople.value = 2;
  paymentSplits.value = [{ type: 'Dinheiro', amount: 0 }];
  showDetails.value = true;
}

function closeDetails() { showDetails.value = false; selectedComanda.value = null; }
function addPaymentSplit() { paymentSplits.value.push({ type: 'Dinheiro', amount: 0 }); }
function removePaymentSplit(index) { paymentSplits.value.splice(index, 1); }

function handleFinalize() {
  if (isFinalizeDisabled.value) return;

  if (hasPreparing.value) {
    rulesModalMessage.value = 'Existem pedidos em preparo. Eles serão cobrados mesmo assim. Deseja continuar?';
    pendingCancel.value = false;
    cancelReason.value = '';
    showRulesModal.value = true;
  } else if (hasPending.value) {
    rulesModalMessage.value = 'Existem pedidos aguardando preparo na cozinha. Para cancelá-los, informe o motivo abaixo.';
    pendingCancel.value = true;
    cancelReason.value = '';
    showRulesModal.value = true;
  } else {
    startPaymentFlow();
  }
}

function confirmRules(confirm) {
  if (!confirm) { showRulesModal.value = false; return; }
  if (pendingCancel.value) {
    if (!cancelReason.value.trim()) return;
    const pendingOrders = ordersWithStatus.value.filter(o => o.status === 'pending');
    pendingOrders.forEach(order => {
      kitchenStore.finishOrder(order.id);
      selectedComanda.value.orders = selectedComanda.value.orders.filter(o => o.id !== order.id);
    });
    selectedComanda.value.total = selectedComanda.value.orders.reduce((sum, o) => sum + o.price, 0);
  }
  showRulesModal.value = false;
  startPaymentFlow();
}

function startPaymentFlow() {
  if (!splitPayment.value) {
    paymentSplits.value[0].amount = totalWithDiscount.value;
  } else {
    if (isFinalizeDisabled.value) {
      showToast('A divisão de pagamento é inválida.', 'error');
      return;
    }
  }

  pendingPayments.value = paymentSplits.value.filter(m => m.amount > 0);
  currentPaymentIndex.value = 0;
  cashReceivedForCurrent.value = 0;
  paymentFlowActive.value = true;
  showDetails.value = false;
  processCurrentPayment();
}

function processCurrentPayment() {
  const current = pendingPayments.value[currentPaymentIndex.value];
  if (current.type === 'Dinheiro') {
    cashReceivedForCurrent.value = current.amount;
    updateChangeBreakdown();
  }
}

function confirmNonCashPayment() { nextPayment(); }

function confirmCashPayment() {
  const current = pendingPayments.value[currentPaymentIndex.value];
  if (cashReceivedForCurrent.value < current.amount) {
    showToast('Valor recebido insuficiente.', 'error');
    return;
  }
  nextPayment();
}

function nextPayment() {
  if (currentPaymentIndex.value < pendingPayments.value.length - 1) {
    currentPaymentIndex.value++;
    processCurrentPayment();
  } else {
    finishPaymentFlow();
  }
}

function finishPaymentFlow() {
  const closedComanda = {
    ...selectedComanda.value,
    closedAt: new Date().toISOString(),
    status: 'FINALIZADO',
    paymentDetails: { discountType: discountType.value, discountValue: discountValue.value, payments: pendingPayments.value },
  };
  closedComandaStore.addClosedComanda(closedComanda);
  comandaStore.removeComanda(selectedComanda.value.id);
  paymentFlowActive.value = false;
  closeDetails();
  showToast('Comanda finalizada com sucesso!', 'success');
}

function cancelPaymentFlow() {
  paymentFlowActive.value = false;
  showDetails.value = true;
}

function applyMask(event, method) {
  let value = event.target.value.replace(/\D/g, '');
  if (value === '') value = '0';
  method.amount = parseInt(value, 10) / 100;
  event.target.value = utils.formatCurrency(method.amount);
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
</style>