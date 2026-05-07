<script setup>
import { loadMercadoPago } from "@mercadopago/sdk-js";
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { useSubscriptionStore } from '@/stores/subscriptions';
import { subscriptionApi } from "@/services/subscriptionApi";
import {planApi} from '@/services/planApi'
import { useRouter } from "vue-router";
import { Check } from 'lucide-vue-next';
import LandingHeader from "@/components/LandingHeader.vue";
import {v4} from 'uuid'

const plans = ref([]); 

const subscriptionStore = useSubscriptionStore();
const planId = ref(0);
const selectedPlan = ref(null);
const router = useRouter();
const showPayment = ref(false);
const error = ref(null);
const serverError = ref(null);
const isSubmitting = ref(false);

let mp = null;
let cardPaymentBrickController = null;

const selectPlan = async (plan) => {
    serverError.value = null;
    error.value = null;
    console.log("Selecting plan:", plan);
    
    if (cardPaymentBrickController) {
        try {
            await cardPaymentBrickController.unmount();
        } catch(e) {}
        cardPaymentBrickController = null;
    }
    
    selectedPlan.value = plan;
    planId.value = plan.id;
    showPayment.value = true;
    
    await nextTick();
    
    requestAnimationFrame(() => {
        renderCardPaymentBrick();
    });
};

const renderCardPaymentBrick = async () => {
    
    if (!selectedPlan.value || !mp) {
        console.error("No selected plan or MP not initialized");
        return;
    }

    const amount = parseFloat(selectedPlan.value.price) * 12;
    if (!amount || isNaN(amount)) {
        error.value = "Valor do plano inválido.";
        return;
    }

        const container = document.getElementById("cardPaymentBrick_container");

        if (container) {
            try {
                container.innerHTML = '';

                const settings = {
                    initialization: {
                        amount,
                    },
                    customization: {
                        visual: {
                            style: {
                                theme: 'default'
                            }
                        },
                        paymentMethods: {
                            minInstallments: 12,
                            maxInstallments: 12,
                        },
                    },
                    callbacks: {
                        onReady: () => {
                        },
                        onSubmit: async (formData, additionalData) => {
                            try {
                                serverError.value = null;
                                isSubmitting.value = true;

                                const submitData = {
                                    preapproval_plan_id: planId.value,
                                    type: "online",
                                    total_amount: String(formData.transaction_amount), 
                                    external_reference: v4(), 
                                    processing_mode: "automatic",
                                    transactions: {
                                        payments: [
                                            {
                                                amount: String(formData.transaction_amount), 
                                                payment_method: {
                                                    id: formData.payment_method_id,
                                                    type: additionalData.paymentTypeId,
                                                    token: formData.token,
                                                    installments: formData.installments,
                                                },
                                            },
                                        ],
                                    },
                                    payer: {
                                        email: formData.payer.email,
                                        identification: formData.payer.identification,
                                    }
                                };

                               await subscriptionApi.post(submitData, planId.value);
                                router.push("/app/dashboard");
                            } catch (err) {
                                error.value = "Payment failed";
                                serverError.value = err || "Erro ao registrar o estabelecimento. Tente novamente.";
                            } finally {
                                isSubmitting.value = false;
                            }
                        },
                        onError: (error) => {
                            console.error("Brick error:", error);
                            error.value = "Payment system error";
                        },
                    },
                };
                
                cardPaymentBrickController = await mp.bricks().create(
                    "cardPayment",
                    "cardPaymentBrick_container",
                    settings
                );
                return true;
            } catch (err) {
                console.error("Render error:", err);
                error.value = err.message;
                return false;
            }
        } else {
            console.error("Container never found");
            error.value = "Payment form failed to load";
        }
};

const goBack = () => {
    showPayment.value = false;
    planId.value = 0;
    selectedPlan.value = null;
    error.value = null;
    
    if (cardPaymentBrickController) {
        cardPaymentBrickController.unmount();
        cardPaymentBrickController = null;
    }
};

onMounted(async () => {
    plans.value = await planApi.list()
    planId.value = subscriptionStore.getPlanToBeSubscribed() ?? 0

    console.log('PLANID', planId.value)
    
    try {
        await loadMercadoPago();
        mp = new window.MercadoPago('APP_USR-639449eb-f800-4563-9304-f64989497a7a');
        console.log("MercadoPago ready");
        
        if (planId.value && plans.value.length > 0) {
            const plan = plans.value.find(p => p.id === planId.value);
            if (plan) {
                await selectPlan(plan);
            }
        }
    } catch (err) {
        console.error("Init error:", err);
        error.value = "Failed to load payment system";
    }
});

onUnmounted(() => {
    if (cardPaymentBrickController) {
        cardPaymentBrickController.unmount();
    }
    subscriptionStore.setPlanToBeSubscribed(0)
});
</script>

<template>
    <div class="min-h-screen bg-page font-inter flex flex-col p-4">
        <LandingHeader />

        <div v-if="planId == 0" class="flex flex-wrap justify-center gap-6 items-center mt-10">
            <div v-for="plan in plans" :key="plan.id" 
                 class="flex-none bg-white px-6 py-10 rounded-xl border border-[#E0E0E0] flex flex-col items-center hover:border-primary/40 transition-all w-full max-w-[320px] hover:shadow-lg cursor-pointer"
                 @click="selectPlan(plan)">
                <h3 class="text-[#212121] text-2xl font-black mb-3">{{ plan.name }}</h3>
                <div class="text-[#212121] text-4xl lg:text-5xl font-black mb-1">
                    R${{ plan.price }}<span class="text-lg font-medium text-[#757575]">/mês</span>
                </div>
                <button class="bg-primary text-white font-bold py-3.5 px-6 rounded-lg w-full mt-6 uppercase tracking-wider">
                    Escolha o seu plano
                </button>
            </div>
        </div>

        <div v-else class="max-w-2xl mx-auto w-full mt-10">
            <button @click="goBack" class="mb-6 flex items-center text-gray-500 hover:text-primary transition-colors font-medium">
                <span class="mr-2">←</span> Voltar para planos
            </button>
            
            <div class="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                <div class="p-8 bg-gray-50 border-b border-gray-100">
                    <h2 class="text-2xl font-black text-gray-800">{{ selectedPlan?.name }}</h2>
                    <p class="text-gray-500">Total anual: <span class="font-bold text-primary text-xl">R${{ selectedPlan?.price * 12 }}</span></p>
                </div>

                <div class="p-8">
                    <transition
                        enter-active-class="transition duration-300 ease-out"
                        enter-from-class="transform scale-95 opacity-0"
                        enter-to-class="transform scale-100 opacity-100"
                    >
                        <div v-if="serverError" class="mb-8 p-6 bg-red-50 border-l-4 border-red-500 rounded-r-lg flex flex-col gap-3">
                            <div class="flex items-center gap-3">
                                <span class="bg-red-500 text-white rounded-full p-1 text-xs">✕</span>
                                <h4 class="font-bold text-red-800 text-lg">Erro no Pagamento</h4>
                            </div>
                            <p class="text-red-700 font-medium">{{ serverError }}</p>
                            <p class="text-sm text-red-600/80">Por favor, verifique os dados do cartão ou o saldo e tente novamente.</p>
                        </div>
                    </transition>

                    <div v-show="!isSubmitting" id="cardPaymentBrick_container"></div>
                    
                    <div v-if="isSubmitting" class="py-20 flex flex-col items-center justify-center">
                        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        <p class="mt-4 text-gray-600 font-medium">Processando seu pagamento...</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>