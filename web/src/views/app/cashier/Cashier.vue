<template>
  <div class="h-screen bg-gray-50 flex flex-col font-inter overflow-hidden">
    
    <header class="h-16 md:h-20 bg-header-kitchen border-b border-black/20 flex items-center justify-between px-4 md:px-8 shadow-md z-20 shrink-0 bg-slate-900">
      <div class="flex items-center gap-3 md:gap-4">
        <div class="bg-brand-green p-1.5 md:p-2 rounded-xl text-black shadow-lg shadow-brand-green/30">
             <Monitor :size="20" class="md:w-6 md:h-6" />
        </div>
        <h1 class="text-white/90 font-bold text-lg hidden sm:block">Caixa de Operações</h1>
      </div>
    </header>

    <main class="flex-grow flex flex-col p-4 md:p-6 overflow-hidden pb-6">
      <section class="flex-1 flex flex-col min-w-0 bg-gray-100/50 rounded-2xl md:rounded-[2rem] border border-gray-200/60 shadow-inner overflow-hidden">
        
        <header class="p-4 md:p-5 flex justify-between items-center bg-gray-100/50 backdrop-blur-sm z-10 border-b border-gray-200/50">
          <div class="flex items-center gap-3">
             <div class="w-2 md:w-3 h-6 md:h-8 bg-blue-500 rounded-full"></div>
             <h2 class="font-extrabold text-gray-700 text-base md:text-lg uppercase tracking-wide">Comandas Abertas</h2>
          </div>
          <span class="bg-blue-500 text-white font-bold px-3 py-1 rounded-full text-sm shadow-sm shadow-blue-200">
            {{ comandaStore.comandas.length }}
          </span>
        </header>

        <div class="flex-grow p-4 md:p-6 overflow-y-auto custom-scrollbar">
            
            <div v-if="comandaStore.comandas.length === 0" class="flex flex-col items-center justify-center h-full text-gray-400 opacity-60 min-h-[200px]">
                <FileText :size="48" class="mb-2" />
                <p class="font-medium">Nenhuma comanda aberta no momento.</p>
            </div>

            <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                <div v-for="comanda in comandaStore.comandas" :key="comanda.id"
                    class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 cursor-pointer hover:shadow-md hover:border-blue-200 transition-all group"
                    @click="openDetails(comanda)">
                    
                    <div class="flex justify-between items-center mb-3">
                        <span class="font-extrabold text-gray-800 text-lg group-hover:text-blue-600 transition-colors">Comanda #{{ comanda.id }}</span>
                        <span class="text-green-600 font-bold bg-green-50 px-2 py-1 rounded-lg">R$ {{ comanda.total.toFixed(2) }}</span>
                    </div>
                    
                    <div class="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 p-2 rounded-lg border border-gray-100">
                        <Receipt :size="16" />
                        {{ comanda.orders.length }} pedido(s) vinculados
                    </div>
                </div>
            </div>

        </div>
      </section>
    </main>

    <div v-if="showDetails" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-[2rem] w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            
            <div class="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <div class="flex items-center gap-3">
                    <div class="bg-blue-100 p-2 rounded-xl text-blue-600">
                        <Receipt :size="24" />
                    </div>
                    <h2 class="text-2xl font-extrabold text-gray-800">Comanda #{{ selectedComanda.id }}</h2>
                </div>
                <button @click="closeDetails" class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors">
                    <X :size="24" />
                </button>
            </div>

            <div class="p-6 overflow-y-auto custom-scrollbar">
                
                <h3 class="font-bold text-gray-700 mb-4 uppercase tracking-wide text-sm">Resumo de Pedidos</h3>
                <div class="space-y-4">
                    <div v-for="order in ordersWithStatus" :key="order.id" class="border border-gray-100 rounded-2xl p-4 bg-gray-50/50">
                        <div class="flex justify-between items-center mb-3">
                            <span class="font-bold text-gray-700">Pedido #{{ order.id }}</span>
                            <span class="px-3 py-1 rounded-full text-xs font-bold" :class="{
                                'bg-yellow-100 text-yellow-700': order.status === 'pending',
                                'bg-blue-100 text-blue-700': order.status === 'preparing',
                                'bg-green-100 text-green-700': order.status === 'ready'
                            }">
                                {{ order.status === 'pending' ? 'Aguardando' : order.status === 'preparing' ? 'Preparando' : 'Pronto' }}
                            </span>
                        </div>
                        <div class="text-sm space-y-1">
                            <div v-for="item in order.items" :key="item.name" class="flex justify-between text-gray-600">
                                <span>{{ item.amount }}x {{ item.name }}</span>
                                <span class="font-medium">R$ {{ (item.price || 0).toFixed(2) }}</span>
                            </div>
                        </div>
                        <div class="text-right font-bold text-gray-800 mt-3 pt-3 border-t border-gray-200 border-dashed">
                            Total: R$ {{ order.price.toFixed(2) }}
                        </div>
                    </div>
                </div>

                <div class="mt-8 border border-gray-100 rounded-2xl p-5 bg-white shadow-sm">
                    <div class="flex justify-between text-lg font-semibold text-gray-700">
                        <span>Subtotal:</span>
                        <span>R$ {{ subtotal.toFixed(2) }}</span>
                    </div>

                    <div class="mt-5 p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <label class="block text-sm font-bold text-gray-700 mb-2">Aplicar Desconto</label>
                        <div class="flex gap-3">
                            <select v-model="discountType" class="border-gray-300 rounded-xl px-3 py-2 bg-white flex-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all">
                                <option value="percent">Percentual (%)</option>
                                <option value="fixed">Valor fixo (R$)</option>
                            </select>
                            <input type="number" v-model.number="discountValue" min="0"
                                :max="discountType === 'percent' ? 100 : subtotal"
                                class="border-gray-300 rounded-xl px-3 py-2 bg-white w-32 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-center font-medium" />
                        </div>
                    </div>

                    <div class="flex justify-between text-2xl font-extrabold text-brand-green mt-5">
                        <span>Total a Pagar:</span>
                        <span>R$ {{ totalWithDiscount.toFixed(2) }}</span>
                    </div>
                </div>

                <div class="mt-8">
                    <h3 class="font-bold text-gray-700 mb-4 uppercase tracking-wide text-sm">Configuração de Pagamento</h3>
                    
                    <div class="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm">
                        <div class="mb-5 flex items-center gap-4">
                            <label class="inline-flex items-center cursor-pointer">
                                <input type="checkbox" v-model="splitPayment" class="mr-3 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                <span class="font-medium text-gray-700">Dividir pagamento</span>
                            </label>
                            
                            <div v-if="splitPayment" class="flex items-center gap-3 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                <span class="text-sm font-medium text-gray-600">Pessoas:</span>
                                <input type="number" v-model.number="numberOfPeople" min="1" class="border-gray-300 rounded-md px-2 py-1 w-16 text-center outline-none focus:ring-2 focus:ring-blue-500" />
                                <button @click="distributeEqually" class="px-3 py-1.5 bg-blue-100 text-blue-700 font-semibold rounded-md hover:bg-blue-200 text-sm transition-colors">
                                    Distribuir
                                </button>
                            </div>
                        </div>

                        <div v-if="!splitPayment" class="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <label class="block text-sm font-bold text-gray-700 mb-2">Método de pagamento</label>
                            <select v-model="paymentSplits[0].type" class="border-gray-300 rounded-xl px-4 py-2.5 w-full bg-white outline-none focus:ring-2 focus:ring-blue-500">
                                <option>Dinheiro</option>
                                <option>Pix</option>
                                <option>Cartão</option>
                            </select>
                        </div>

                        <div v-else class="space-y-3">
                            <div v-for="(method, idx) in paymentSplits" :key="idx" class="flex gap-3 items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
                                <span class="font-bold text-gray-400 w-6">{{ idx + 1 }}.</span>
                                <select v-model="method.type" class="border-gray-300 rounded-lg px-3 py-2 flex-1 bg-white outline-none focus:ring-2 focus:ring-blue-500">
                                    <option>Dinheiro</option>
                                    <option>Pix</option>
                                    <option>Cartão</option>
                                </select>
                                <div class="relative w-32">
                                    <span class="absolute left-3 top-2.5 text-gray-500 text-sm font-medium">R$</span>
                                    <input type="text" :value="formatCurrency(method.amount)" @input="applyMask($event, method)"
                                        class="border-gray-300 rounded-lg pl-8 pr-3 py-2 w-full text-right font-medium outline-none focus:ring-2 focus:ring-blue-500" placeholder="0,00" />
                                </div>
                                <button v-if="paymentSplits.length > 1" @click="removePaymentSplit(idx)" class="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Remover">
                                    <X :size="20" />
                                </button>
                            </div>
                            
                            <div class="pt-2 flex justify-between items-center">
                                <button @click="addPaymentSplit" class="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors">
                                    + Adicionar divisão
                                </button>
                                <div class="text-sm font-medium text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                    Total: R$ {{ formatCurrency(totalPayments) }}
                                    <span v-if="Math.abs(totalPayments - totalWithDiscount) > 0.01" class="text-red-500 font-bold ml-2">
                                        (Falta R$ {{ formatCurrency(Math.abs(totalWithDiscount - totalPayments)) }})
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="p-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-[2rem]">
                <button @click="closeDetails" class="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-colors shadow-sm">
                    Cancelar
                </button>
                <button @click="handleFinalize" class="px-6 py-2.5 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition-colors shadow-md shadow-green-500/30 flex items-center gap-2">
                    <CheckCircle :size="18" /> Prosseguir
                </button>
            </div>
        </div>
    </div>

    <div v-if="showRulesModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
        <div class="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl flex flex-col items-center text-center">
            <div class="w-16 h-16 bg-yellow-100 text-yellow-500 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle :size="32" />
            </div>
            <h3 class="text-xl font-extrabold text-gray-800 mb-2">Atenção</h3>
            <p class="text-gray-600 mb-8">{{ rulesModalMessage }}</p>
            <div class="flex gap-3 w-full">
                <button @click="confirmRules(false)" class="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors">
                    Não, Voltar
                </button>
                <button @click="confirmRules(true)" class="flex-1 py-3 bg-yellow-500 text-white font-bold rounded-xl hover:bg-yellow-600 transition-colors shadow-md shadow-yellow-500/30">
                    Sim, Continuar
                </button>
            </div>
        </div>
    </div>

    <div v-if="paymentFlowActive" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
        <div class="bg-white rounded-[2rem] p-8 max-w-lg w-full shadow-2xl border border-gray-100">
            <h3 class="text-xl font-extrabold text-gray-800 mb-2">
                Pagamento <span class="text-blue-500">{{ currentPaymentIndex + 1 }}</span> de {{ pendingPayments.length }}
            </h3>
            
            <div class="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-100 flex justify-between items-center">
                <span class="font-bold text-gray-700 flex items-center gap-2">
                    <Monitor v-if="pendingPayments[currentPaymentIndex]?.type !== 'Din'" :size="18" class="text-blue-500"/>
                    {{ pendingPayments[currentPaymentIndex]?.type }}
                </span>
                <span class="text-xl font-extrabold text-blue-700">
                    R$ {{ pendingPayments[currentPaymentIndex]?.amount.toFixed(2) }}
                </span>
            </div>

            <div v-if="pendingPayments[currentPaymentIndex]?.type === 'Dinheiro'">
                <label class="block text-sm font-bold text-gray-700 mb-2">Valor recebido do cliente</label>
                <div class="relative mb-4">
                    <span class="absolute left-4 top-3 text-gray-500 font-bold">R$</span>
                    <input type="number" v-model.number="cashReceivedForCurrent" min="0" step="0.01"
                        class="border-2 border-gray-200 rounded-xl pl-10 pr-4 py-3 w-full text-lg font-bold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all" 
                        placeholder="0.00"
                        @input="updateChangeBreakdown" />
                </div>

                <div v-if="cashReceivedForCurrent >= pendingPayments[currentPaymentIndex]?.amount" class="mt-4 bg-green-50 p-4 rounded-xl border border-green-100">
                    <p class="font-bold text-green-800 mb-2">Troco Sugerido:</p>
                    <p class="text-2xl font-extrabold text-green-600 mb-3">
                        R$ {{ (cashReceivedForCurrent - pendingPayments[currentPaymentIndex]?.amount).toFixed(2) }}
                    </p>
                    <ul class="text-sm space-y-1">
                        <li v-for="item in changeBreakdownList" :key="item.value" class="flex items-center gap-2 font-medium text-green-700">
                            <span class="bg-green-200 px-2 py-0.5 rounded-md">{{ item.count }}x</span> {{ item.label }}
                        </li>
                    </ul>
                </div>
            </div>

            <div class="flex justify-end gap-3 mt-8">
                <button @click="cancelPaymentFlow" class="px-5 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors">
                    Cancelar
                </button>
                <button v-if="pendingPayments[currentPaymentIndex]?.type === 'Dinheiro'" @click="confirmCashPayment" class="px-5 py-3 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition-colors shadow-md shadow-green-500/30 flex items-center gap-2">
                    <CheckCircle :size="18" /> Confirmar
                </button>
            </div>
        </div>
    </div>

    <div v-if="showConfirmNonCashModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[70]">
        <div class="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center">
            <div class="w-16 h-16 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Receipt :size="32" />
            </div>
            <h3 class="text-xl font-extrabold text-gray-800 mb-2">Aguardando Pagamento</h3>
            <p class="text-gray-600 mb-6">
                Confirme se o pagamento via <strong class="text-gray-800">{{ pendingNonCashPayment?.type }}</strong> no valor de
                <strong class="text-gray-800">R$ {{ pendingNonCashPayment?.amount.toFixed(2) }}</strong> foi aprovado na maquininha.
            </p>
            <div class="flex flex-col gap-2">
                <button @click="confirmNonCashPayment" class="w-full py-3 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition-colors shadow-md shadow-green-500/30">
                    Pagamento Aprovado
                </button>
                <button @click="cancelNonCashPayment" class="w-full py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors">
                    Cancelar / Deu Erro
                </button>
            </div>
        </div>
    </div>

    <div v-if="showAlertModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[80]">
        <div class="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center">
            <h3 class="text-xl font-extrabold text-gray-800 mb-2">Aviso</h3>
            <p class="text-gray-600 mb-6">{{ alertMessage }}</p>
            <button @click="showAlertModal = false" class="w-full py-3 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition-colors shadow-md shadow-blue-500/30">
                Entendido
            </button>
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useComandaStore } from '@/stores/comandaManagement';
import { useClosedComandaStore } from '@/stores/closedComandas';
import { useKitchenStore } from '@/stores/kitchen';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import { PERMISSIONS } from '@/utils/permissions';

// Importação de ícones estilo Lucide (mesma biblioteca usada no KitchenTerminal)
import { Monitor, Receipt, AlertTriangle, FileText, CheckCircle, X } from 'lucide-vue-next';

const comandaStore = useComandaStore();
const closedComandaStore = useClosedComandaStore();
const kitchenStore = useKitchenStore();
const authStore = useAuthStore();
const router = useRouter();

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

function formatCurrency(value) {
    if (value === null || value === undefined) return '';
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

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
    event.target.value = formatCurrency(method.amount);
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
</style>