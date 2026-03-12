<template>
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
                    class="bg-white/5 rounded-[2rem] border border-white/5 p-6 cursor-pointer hover:border-blue-500/50 hover:bg-white/[0.08] transition-all group relative overflow-hidden"
                    @click="openDetails(comanda)">
                    
                    <div class="flex justify-between items-start mb-4">
                        <div>
                          <span class="text-gray-500 text-[10px] font-black uppercase tracking-widest block mb-1">ID</span>
                          <span class="font-black text-white text-xl tracking-tighter group-hover:text-blue-400 transition-colors">#{{ comanda.id }}</span>
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
        <div class="bg-zinc-900 border border-white/10 rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden">
            
            <div class="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                <div class="flex items-center gap-4">
                    <div class="bg-blue-500/10 p-3 rounded-2xl text-blue-500 border border-blue-500/20">
                        <Receipt :size="24" />
                    </div>
                    <div>
                      <h2 class="text-2xl font-black text-white uppercase tracking-tighter">Comanda #{{ selectedComanda.id }}</h2>
                      <p class="text-gray-500 text-[10px] font-black uppercase tracking-widest">Processamento Financeiro</p>
                    </div>
                </div>
                <button @click="closeDetails" class="p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-full transition-all">
                    <X :size="24" />
                </button>
            </div>

            <div class="p-8 overflow-y-auto custom-scrollbar bg-zinc-900">
                <h3 class="font-black text-gray-500 mb-6 uppercase tracking-[0.2em] text-[10px]">Detalhamento de Consumo</h3>
                <div class="space-y-4">
                    <div v-for="order in ordersWithStatus" :key="order.id" class="border border-white/5 rounded-3xl p-6 bg-white/[0.03]">
                        <div class="flex justify-between items-center mb-4">
                            <span class="font-black text-white text-sm uppercase tracking-widest">Pedido #{{ order.id }}</span>
                            <span class="px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border" :class="{
                                'border-yellow-500/30 bg-yellow-500/10 text-yellow-500': order.status === 'pending',
                                'border-blue-500/30 bg-blue-500/10 text-blue-500': order.status === 'preparing',
                                'border-brand-green/30 bg-brand-green/10 text-brand-green': order.status === 'ready'
                            }">
                                {{ order.status === 'pending' ? 'Aguardando' : order.status === 'preparing' ? 'Preparando' : 'Pronto' }}
                            </span>
                        </div>
                        <div class="space-y-2 mb-4">
                            <div v-for="item in order.items" :key="item.name" class="flex justify-between text-xs font-bold text-gray-400">
                                <span class="tracking-wide">{{ item.amount }}x {{ item.name }}</span>
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
                            <select v-model="discountType" class="bg-zinc-800 border-none rounded-xl px-4 py-3 text-xs font-black uppercase text-white outline-none focus:ring-2 focus:ring-blue-500 flex-1">
                                <option value="percent">Percentual (%)</option>
                                <option value="fixed">Valor fixo (R$)</option>
                            </select>
                            <input type="number" v-model.number="discountValue" 
                                class="bg-zinc-800 border-none rounded-xl px-4 py-3 text-lg font-black text-center text-brand-green w-32 outline-none focus:ring-2 focus:ring-blue-500" />
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
                        <div class="mb-6 flex items-center gap-6">
                            <label class="flex items-center cursor-pointer group">
                                <div class="relative">
                                  <input type="checkbox" v-model="splitPayment" class="sr-only" />
                                  <div class="w-12 h-6 bg-zinc-700 rounded-full transition-colors group-hover:bg-zinc-600" :class="{'bg-blue-600': splitPayment}"></div>
                                  <div class="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform" :class="{'translate-x-6': splitPayment}"></div>
                                </div>
                                <span class="ml-3 font-black text-xs uppercase text-gray-400 tracking-widest">Dividir Pagamento</span>
                            </label>
                            
                            <div v-if="splitPayment" class="flex items-center gap-4 bg-black/40 px-4 py-2 rounded-xl border border-white/10">
                                <span class="text-[10px] font-black text-gray-500 uppercase">Pessoas:</span>
                                <input type="number" v-model.number="numberOfPeople" class="bg-transparent text-white font-black w-12 text-center outline-none" />
                                <button @click="distributeEqually" class="px-4 py-1.5 bg-blue-600 text-white text-[10px] font-black uppercase rounded-lg hover:bg-blue-500 transition-colors">
                                    Calcular
                                </button>
                            </div>
                        </div>

                        <div v-if="!splitPayment" class="bg-zinc-800 rounded-2xl p-4">
                            <select v-model="paymentSplits[0].type" class="bg-transparent border-none w-full text-white font-black uppercase tracking-widest text-sm outline-none">
                                <option class="bg-zinc-900">Dinheiro</option>
                                <option class="bg-zinc-900">Pix</option>
                                <option class="bg-zinc-900">Cartão</option>
                            </select>
                        </div>

                        <div v-else class="space-y-4">
                            <div v-for="(method, idx) in paymentSplits" :key="idx" class="flex gap-4 items-center bg-black/40 p-4 rounded-2xl border border-white/5">
                                <span class="font-black text-blue-500 w-6 text-xs">{{ idx + 1 }}.</span>
                                <select v-model="method.type" class="bg-zinc-800 border-none rounded-xl px-4 py-2 text-xs font-black uppercase text-white outline-none flex-1">
                                    <option class="bg-zinc-900">Dinheiro</option>
                                    <option class="bg-zinc-900">Pix</option>
                                    <option class="bg-zinc-900">Cartão</option>
                                </select>
                                <div class="relative w-40">
                                    <span class="absolute left-4 top-2.5 text-brand-green text-[10px] font-black">R$</span>
                                    <input type="text" :value="utils.formatCurrency(method.amount)" @input="applyMask($event, method)"
                                        class="bg-zinc-800 border-none rounded-xl pl-10 pr-4 py-2 w-full text-right font-black text-white outline-none focus:ring-1 focus:ring-brand-green" />
                                </div>
                                <button v-if="paymentSplits.length > 1" @click="removePaymentSplit(idx)" class="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-all">
                                    <X :size="20" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="p-8 border-t border-white/5 bg-white/[0.02] flex justify-end gap-4">
                <button @click="closeDetails" class="px-8 py-3 bg-transparent border border-white/10 text-gray-400 font-black uppercase tracking-widest text-xs rounded-xl hover:bg-white/5 transition-all">
                    Voltar
                </button>
                <button @click="handleFinalize" class="px-8 py-3 bg-brand-green text-black font-black uppercase tracking-widest text-xs rounded-xl hover:bg-green-400 transition-all shadow-lg shadow-brand-green/20 flex items-center gap-3">
                    <CheckCircle :size="18" /> Confirmar Pagamento
                </button>
            </div>
        </div>
    </div>

    </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>
<script setup>
import { ref, computed, watch } from 'vue';
import { useComandaStore } from '@/stores/comandaManagement';
import { useClosedComandaStore } from '@/stores/closedComandas';
import { useKitchenStore } from '@/stores/kitchen';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import { useUtils } from '@/composables/useUtils.js';
import { PERMISSIONS } from '@/utils/permissions';
import { Monitor, Receipt, AlertTriangle, FileText, CheckCircle, X } from 'lucide-vue-next';

const comandaStore = useComandaStore();
const closedComandaStore = useClosedComandaStore();
const kitchenStore = useKitchenStore();
const authStore = useAuthStore();
const router = useRouter();
const utils = useUtils();


if (!authStore.hasPermission(PERMISSIONS.CAIXA)) {
    router.push('/app/dashboard');
}

const denominations = [
    { value: 200, label: 'R$ 200' },
    { value: 100, label: 'R$ 100' },
    { value: 50, label: 'R$ 50' },
    { value: 20, label: 'R$ 20' },
    { value: 10, label: 'R$ 10' },
    { value: 5, label: 'R$ 5' },
    { value: 2, label: 'R$ 2' },
    { value: 1, label: 'R$ 1' },
    { value: 0.5, label: 'R$ 0,50' },
    { value: 0.25, label: 'R$ 0,25' },
    { value: 0.1, label: 'R$ 0,10' },
    { value: 0.05, label: 'R$ 0,05' },
];

const selectedComanda = ref(null);
const showDetails = ref(false);
const discountType = ref('percent');
const discountValue = ref(0);

const paymentSplits = ref([]);
const splitPayment = ref(false);
const numberOfPeople = ref(1);

const showRulesModal = ref(false);
const rulesModalMessage = ref('');
const pendingCancel = ref(false);
const showAlertModal = ref(false);
const alertMessage = ref('');
const showConfirmNonCashModal = ref(false);
const pendingNonCashPayment = ref(null);

const paymentFlowActive = ref(false);
const pendingPayments = ref([]);
const currentPaymentIndex = ref(0);
const cashReceivedForCurrent = ref(0);
const currentChangeBreakdown = ref({});

const ordersWithStatus = computed(() => {
    if (!selectedComanda.value) return [];
    return selectedComanda.value.orders.map(order => {
        const kitchenOrder = kitchenStore.orders.find(o => o.id === order.id);
        return { ...order, status: kitchenOrder ? kitchenOrder.status : 'unknown' };
    });
});

const hasPreparing = computed(() => {
    return ordersWithStatus.value.some(o => o.status === 'preparing');
});

const hasPending = computed(() => {
    return ordersWithStatus.value.some(o => o.status === 'pending');
});

const subtotal = computed(() => selectedComanda.value?.total || 0);

const totalWithDiscount = computed(() => {
    let total = subtotal.value;
    if (discountValue.value > 0) {
        if (discountType.value === 'percent') {
            total = total * (1 - discountValue.value / 100);
        } else {
            total = Math.max(0, total - discountValue.value);
        }
    }
    return total;
});

const totalPayments = computed(() => {
    return paymentSplits.value.reduce((acc, m) => acc + (m.amount || 0), 0);
});

watch(numberOfPeople, (newVal, oldVal) => {
    if (!splitPayment.value) return;
    const num = Math.max(1, newVal);
    const currentLength = paymentSplits.value.length;
    if (num > currentLength) {
        for (let i = currentLength; i < num; i++) {
            paymentSplits.value.push({ type: 'Dinheiro', amount: 0 });
        }
    } else if (num < currentLength) {
        paymentSplits.value.splice(num, currentLength - num);
    }
}, { immediate: true });

function distributeEqually() {
    const num = numberOfPeople.value;
    if (num < 1) return;
    const total = totalWithDiscount.value;
    const each = Math.floor((total / num) * 100) / 100;
    let remaining = total;
    for (let i = 0; i < num; i++) {
        if (i === num - 1) {
            paymentSplits.value[i].amount = remaining;
        } else {
            paymentSplits.value[i].amount = each;
            remaining -= each;
        }
    }
}

function getChangeBreakdown(change) {
    const breakdown = {};
    let remainingCents = Math.round(change * 100);

    for (const denom of denominations) {
        const denomCents = Math.round(denom.value * 100);

        if (remainingCents >= denomCents) {
            const count = Math.floor(remainingCents / denomCents);
            breakdown[denom.value] = count;
            remainingCents -= count * denomCents;
        } else {
            breakdown[denom.value] = 0;
        }
    }
    return breakdown;
}

const changeBreakdownList = computed(() => {
    const breakdown = currentChangeBreakdown.value;
    if (!breakdown) return [];
    return denominations
        .map(d => ({ ...d, count: breakdown[d.value] || 0 }))
        .filter(item => item.count > 0);
});

function showAlert(message) {
    alertMessage.value = message;
    showAlertModal.value = true;
}

function openDetails(comanda) {
    selectedComanda.value = comanda;
    discountValue.value = 0;
    resetPayment();
    showDetails.value = true;
}

function closeDetails() {
    showDetails.value = false;
    selectedComanda.value = null;
}

function resetPayment() {
    paymentSplits.value = [{ type: 'Dinheiro', amount: 0 }];
    splitPayment.value = false;
    numberOfPeople.value = 1;
}

function addPaymentSplit() {
    paymentSplits.value.push({ type: 'Dinheiro', amount: 0 });
    numberOfPeople.value = paymentSplits.value.length; 
}

function removePaymentSplit(index) {
    if (paymentSplits.value.length > 1) {
        paymentSplits.value.splice(index, 1);
        numberOfPeople.value = paymentSplits.value.length;
    }
}

function handleFinalize() {
    if (hasPreparing.value) {
        rulesModalMessage.value = 'Existem pedidos em preparo. Eles serão cobrados mesmo assim. Deseja continuar?';
        pendingCancel.value = false;
        showRulesModal.value = true;
    } else if (hasPending.value) {
        rulesModalMessage.value = 'Existem pedidos aguardando preparo. Deseja cancelá-los antes de finalizar? (Caso contrário, eles serão cobrados)';
        pendingCancel.value = true;
        showRulesModal.value = true;
    } else {
        startPaymentFlow();
    }
}

function confirmRules(confirm) {
    if (!confirm) {
        showRulesModal.value = false;
        return;
    }

    if (pendingCancel.value) {
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
    }

    pendingPayments.value = paymentSplits.value.filter(m => m.amount > 0);

    if (pendingPayments.value.length === 0) {
        showAlert('Selecione pelo menos um método de pagamento com valor maior que zero.');
        return;
    }

    if (splitPayment.value && Math.abs(totalPayments.value - totalWithDiscount.value) > 0.01) {
        showAlert('A soma dos valores parciais não corresponde ao total da comanda.');
        return;
    }

    currentPaymentIndex.value = 0;
    paymentFlowActive.value = true;
    showDetails.value = false;
    processCurrentPayment();
}

function processCurrentPayment() {
    const current = pendingPayments.value[currentPaymentIndex.value];
    if (current.type === 'Dinheiro') {
        cashReceivedForCurrent.value = current.amount;
        updateChangeBreakdown();
    } else {
        pendingNonCashPayment.value = {
            type: current.type,
            amount: current.amount,
            index: currentPaymentIndex.value
        };
        showConfirmNonCashModal.value = true;
    }
}

function confirmNonCashPayment() {
    showConfirmNonCashModal.value = false;
    nextPayment();
}

function cancelNonCashPayment() {
    showConfirmNonCashModal.value = false;
    pendingNonCashPayment.value = null;
}

function updateChangeBreakdown() {
    const current = pendingPayments.value[currentPaymentIndex.value];
    const due = current.amount;
    const received = cashReceivedForCurrent.value;
    if (received >= due) {
        const change = received - due;
        currentChangeBreakdown.value = getChangeBreakdown(change);
    } else {
        currentChangeBreakdown.value = {};
    }
}

function confirmCashPayment() {
    const current = pendingPayments.value[currentPaymentIndex.value];
    const due = current.amount;
    const received = cashReceivedForCurrent.value;
    if (received < due) {
        showAlert(`Valor recebido (R$ ${received.toFixed(2)}) é menor que o devido (R$ ${due.toFixed(2)}).`);
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
        paymentDetails: {
            discountType: discountType.value,
            discountValue: discountValue.value,
            payments: pendingPayments.value
        }
    };
    closedComandaStore.addClosedComanda(closedComanda);
    comandaStore.removeComanda(selectedComanda.value.id);

    paymentFlowActive.value = false;
    pendingPayments.value = [];
    currentPaymentIndex.value = 0;
    cashReceivedForCurrent.value = 0;
    currentChangeBreakdown.value = {};

    closeDetails();
    showAlert('Comanda fechada com sucesso!');
}

function cancelPaymentFlow() {
    paymentFlowActive.value = false;
    pendingPayments.value = [];
    currentPaymentIndex.value = 0;
    cashReceivedForCurrent.value = 0;
    currentChangeBreakdown.value = {};
    showDetails.value = true;
}

function applyMask(event, method) {
    let value = event.target.value.replace(/\D/g, '');

    if (value === '') value = '0';
    method.amount = parseInt(value, 10) / 100;
    event.target.value = utils.formatCurrency(method.amount);
}
</script>
