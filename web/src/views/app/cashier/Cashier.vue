<script setup>
import { ref, computed, watch } from 'vue';
import { useComandaStore } from '@/stores/comandaManagement';
import { useClosedComandaStore } from '@/stores/closedComandas';
import { useKitchenStore } from '@/stores/kitchen';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import { PERMISSIONS } from '@/utils/permissions';

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
    const change = received - due;
    if (change > 0) {
        showAlert(`Troco: R$ ${change.toFixed(2)}. Entregue conforme composição exibida.`);
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

<template>
    <div class="p-6 text-gray-800">
        <h1 class="text-2xl font-bold mb-6">Caixa - Comandas Abertas</h1>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="comanda in comandaStore.comandas" :key="comanda.id"
                class="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-lg transition"
                @click="openDetails(comanda)">
                <div class="flex justify-between items-center">
                    <span class="font-semibold">Comanda #{{ comanda.id }}</span>
                    <span class="text-green-600 font-bold">R$ {{ comanda.total.toFixed(2) }}</span>
                </div>
                <div class="text-sm text-gray-600 mt-2">
                    {{ comanda.orders.length }} pedido(s)
                </div>
            </div>
        </div>

        <div v-if="showDetails" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div class="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6">
                <h2 class="text-xl font-bold mb-4">Comanda #{{ selectedComanda.id }}</h2>

                <!-- Pedidos com status -->
                <div class="space-y-4">
                    <div v-for="order in ordersWithStatus" :key="order.id" class="border rounded p-4">
                        <div class="flex justify-between items-center mb-2">
                            <span class="font-semibold">Pedido #{{ order.id }}</span>
                            <span :class="{
                                'text-yellow-600': order.status === 'pending',
                                'text-blue-600': order.status === 'preparing',
                                'text-green-600': order.status === 'ready'
                            }">
                                {{ order.status === 'pending' ? 'Aguardando' : order.status === 'preparing' ?
                                    'Preparando' : 'Pronto' }}
                            </span>
                        </div>
                        <div class="text-sm">
                            <div v-for="item in order.items" :key="item.name" class="flex justify-between">
                                <span>{{ item.amount }}x {{ item.name }}</span>
                                <span>R$ {{ (item.price || 0).toFixed(2) }}</span>
                            </div>
                        </div>
                        <div class="text-right font-medium mt-2">
                            Total do pedido: R$ {{ order.price.toFixed(2) }}
                        </div>
                    </div>
                </div>

                <div class="mt-6 border-t pt-4">
                    <div class="flex justify-between text-lg">
                        <span>Subtotal:</span>
                        <span>R$ {{ subtotal.toFixed(2) }}</span>
                    </div>

                    <div class="mt-4">
                        <label class="block text-sm font-medium mb-1">Desconto</label>
                        <div class="flex gap-2">
                            <select v-model="discountType" class="border rounded px-2 py-1">
                                <option value="percent">Percentual (%)</option>
                                <option value="fixed">Valor fixo (R$)</option>
                            </select>
                            <input type="number" v-model.number="discountValue" min="0"
                                :max="discountType === 'percent' ? 100 : subtotal"
                                class="border rounded px-2 py-1 w-32" />
                        </div>
                    </div>

                    <div class="flex justify-between text-xl font-bold mt-4">
                        <span>Total com desconto:</span>
                        <span>R$ {{ totalWithDiscount.toFixed(2) }}</span>
                    </div>
                </div>

                <div class="mt-6 border-t pt-4">
                    <h3 class="font-semibold mb-2">Pagamento</h3>
                    <div class="mb-3 flex items-center gap-4">
                        <label class="inline-flex items-center">
                            <input type="checkbox" v-model="splitPayment" class="mr-2" />
                            Dividir pagamento
                        </label>
                        <div v-if="splitPayment" class="flex items-center gap-2">
                            <span class="text-sm">Nº de divisões:</span>
                            <input type="number" v-model.number="numberOfPeople" min="1"
                                class="border rounded px-2 py-1 w-20" />
                            <button @click="distributeEqually"
                                class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm">
                                Dividir igualmente
                            </button>
                        </div>
                    </div>

                    <div v-if="!splitPayment" class="mb-4">
                        <label class="block text-sm mb-1">Forma de pagamento</label>
                        <select v-model="paymentSplits[0].type" class="border rounded px-2 py-1 w-full">
                            <option>Dinheiro</option>
                            <option>Pix</option>
                            <option>Cartão</option>
                        </select>
                        <p class="text-sm text-gray-500 mt-1">Valor: R$ {{ totalWithDiscount.toFixed(2) }}</p>
                    </div>

                    <div v-else class="space-y-3">
                        <div v-for="(method, idx) in paymentSplits" :key="idx" class="flex gap-2 items-center">
                            <select v-model="method.type" class="border rounded px-2 py-1 flex-1">
                                <option>Dinheiro</option>
                                <option>Pix</option>
                                <option>Cartão</option>
                            </select>
                            <input type="text" :value="formatCurrency(method.amount)" @input="applyMask($event, method)"
                                class="border rounded px-2 py-1 w-32 text-right" placeholder="0,00" />
                            <button v-if="paymentSplits.length > 1" @click="removePaymentSplit(idx)"
                                class="text-red-500 hover:text-red-700" title="Remover">
                                ✕
                            </button>
                        </div>
                        <button @click="addPaymentSplit" class="text-sm text-blue-500 hover:text-blue-700">
                            + Adicionar outra forma
                        </button>
                        <div class="text-sm text-gray-600">
                            Total informado: R$ {{ formatCurrency(totalPayments) }}
                            <span v-if="Math.abs(totalPayments - totalWithDiscount) > 0.01" class="text-red-500 ml-2">
                                (diferença de R$ {{ formatCurrency(totalWithDiscount - totalPayments) }})
                            </span>
                        </div>
                    </div>
                </div>

                <div class="mt-6 flex justify-end gap-2">
                    <button @click="closeDetails" class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
                        Cancelar
                    </button>
                    <button @click="handleFinalize"
                        class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                        Finalizar Comanda
                    </button>
                </div>
            </div>
        </div>

        <div v-if="showRulesModal"
            class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div class="bg-white rounded-lg p-6 max-w-md w-full">
                <h3 class="text-lg font-semibold mb-4">Atenção</h3>
                <p class="mb-6">{{ rulesModalMessage }}</p>
                <div class="flex justify-end gap-2">
                    <button @click="confirmRules(false)" class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
                        Não
                    </button>
                    <button @click="confirmRules(true)"
                        class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                        Sim
                    </button>
                </div>
            </div>
        </div>

        <div v-if="paymentFlowActive"
            class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div class="bg-white rounded-lg p-6 max-w-lg w-full">
                <h3 class="text-lg font-semibold mb-4">
                    Pagamento ({{ currentPaymentIndex + 1 }} de {{ pendingPayments.length }})
                </h3>

                <div class="mb-4">
                    <p><strong>Método:</strong> {{ pendingPayments[currentPaymentIndex]?.type }}</p>
                    <p><strong>Valor a pagar:</strong> R$ {{ pendingPayments[currentPaymentIndex]?.amount.toFixed(2) }}
                    </p>
                </div>

                <div v-if="pendingPayments[currentPaymentIndex]?.type === 'Dinheiro'">
                    <label class="block text-sm font-medium mb-1">Valor recebido em dinheiro</label>
                    <input type="number" v-model.number="cashReceivedForCurrent" min="0" step="0.01"
                        class="border rounded px-2 py-1 w-full mb-2" placeholder="R$ 0,00"
                        @input="updateChangeBreakdown" />

                    <div v-if="cashReceivedForCurrent >= pendingPayments[currentPaymentIndex]?.amount" class="mt-4">
                        <p class="font-medium">Troco a ser entregue:</p>
                        <ul class="text-sm">
                            <li v-for="item in changeBreakdownList" :key="item.value">
                                {{ item.count }} x {{ item.label }}
                            </li>
                        </ul>
                        <p class="text-sm text-gray-600 mt-1">
                            Total troco: R$ {{ (cashReceivedForCurrent -
                                pendingPayments[currentPaymentIndex]?.amount).toFixed(2) }}
                        </p>
                    </div>
                </div>

                <div class="flex justify-end gap-2 mt-6">
                    <button @click="cancelPaymentFlow" class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
                        Cancelar
                    </button>
                    <button v-if="pendingPayments[currentPaymentIndex]?.type === 'Dinheiro'" @click="confirmCashPayment"
                        class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                        Confirmar Pagamento em Dinheiro
                    </button>
                </div>
            </div>
        </div>

        <div v-if="showConfirmNonCashModal"
            class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div class="bg-white rounded-lg p-6 max-w-md w-full">
                <h3 class="text-lg font-semibold mb-4">Confirmar Pagamento</h3>
                <p class="mb-6">
                    Deseja iniciar o pagamento via <strong>{{ pendingNonCashPayment?.type }}</strong> no valor de
                    <strong>R$ {{ pendingNonCashPayment?.amount.toFixed(2) }}</strong>?
                </p>
                <div class="flex justify-end gap-2">
                    <button @click="cancelNonCashPayment" class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
                        Cancelar
                    </button>
                    <button @click="confirmNonCashPayment"
                        class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                        Confirmar
                    </button>
                </div>
            </div>
        </div>

        <div v-if="showAlertModal"
            class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div class="bg-white rounded-lg p-6 max-w-md w-full">
                <h3 class="text-lg font-semibold mb-4">Aviso</h3>
                <p class="mb-6">{{ alertMessage }}</p>
                <div class="flex justify-end">
                    <button @click="showAlertModal = false"
                        class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                        OK
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>