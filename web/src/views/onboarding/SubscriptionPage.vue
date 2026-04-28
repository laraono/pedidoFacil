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

let mp = null;
let cardPaymentBrickController = null;

const selectPlan = async (plan) => {
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
    
    if (!selectedPlan.value) {
        console.error("No selected plan");
        return;
    }
    
        const container = document.getElementById("cardPaymentBrick_container");
        
        if (container) {
            try {
                container.innerHTML = '';
                
                const settings = {
                    initialization: {
                        amount: parseFloat(selectedPlan.value.price) * 12,
                    },
                    customization: {
                        visual: {
                            style: {
                                theme: 'default'
                            }
                        },
                        paymentMethods: {
                            minInstallments: 2,
                            maxInstallments: 12,
                        },
                    },
                    callbacks: {
                        onReady: () => {
                        },
                        onSubmit: async (formData, additionalData) => {
                            try {
                                serverError.value = null;

                                const submitData = {
                                    preapproval_plan_id: planId.value,
                                    type: "online",
                                    total_amount: String(formData.transaction_amount), 
                                    external_reference: v4(), // identificador da origem da transação.
                                    processing_mode: "automatic",
                                    transactions: {
                                        payments: [
                                            {
                                                amount: String(formData.transaction_amount), // deve ser uma string com formato 00.00 
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

                                console.log(submitData.payer.identification)

                               // await subscriptionApi.post(submitData, planId.value);
                                router.push("/app/dashboard");
                            } catch (err) {
                                console.error("Payment error:", err);
                                error.value = "Payment failed";
                                serverError.value = err.message || "Erro ao registrar o estabelecimento. Tente novamente.";
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
    
    await renderCardPaymentBrick();
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
    
    try {
        await loadMercadoPago();
        mp = new window.MercadoPago('APP_USR-639449eb-f800-4563-9304-f64989497a7a');
        console.log("MercadoPago ready");
        
        if (planId.value && plans.value.length > 0) {
            const plan = plans.value.find(p => p.id === savedPlanId);
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
});
</script>

<template>
    <div class="min-h-screen bg-page font-inter flex flex-col">
        <LandingHeader />
        <transition
            enter-active-class="transition duration-300"
            enter-from-class="opacity-0 -translate-y-2"
            enter-to-class="opacity-100 translate-y-0"
        >
            <div
                v-if="serverError"
                class="mb-6 p-4 bg-danger-light border border-danger rounded text-danger font-bold text-sm text-left"
            >
                {{ serverError }}
            </div>
        </transition>
        
        <div v-if="planId == 0" class="flex flex-wrap justify-center gap-6 items-center">
            <div v-for="plan in plans" :key="plan.id" 
                 class="flex-none bg-white px-6 py-10 rounded-xl border border-[#E0E0E0] flex flex-col items-center hover:border-primary/40 transition-all w-full max-w-[320px] hover:shadow-lg cursor-pointer"
                 @click="selectPlan(plan)">
                <h3 class="text-[#212121] text-2xl font-black mb-3 tracking-tight">
                    {{ plan.name }}
                </h3>

                <div class="text-[#212121] text-4xl lg:text-5xl font-black mb-1 tracking-tighter">
                    R${{ plan.price }}<span class="text-lg font-medium text-[#757575] tracking-normal">/mês</span>
                </div>

                <div class="w-full h-px bg-[#E0E0E0] my-6"></div>

                <div class="flex flex-col gap-4 mb-8 w-full px-2 text-left">
                    <div class="flex items-center gap-3 text-[#616161] text-sm font-semibold">
                        <Check class="text-primary w-5 h-5 flex-shrink-0" stroke-width="3" />
                        {{ plan.frequency ? plan.frequency.toUpperCase() : 'MENSAL' }}
                    </div>
                </div>

                <button class="bg-primary text-white font-bold py-3.5 px-6 rounded-lg w-full hover:bg-primary-dark transition-all mt-auto text-sm uppercase tracking-wider active:scale-95">
                    Escolha o seu plano
                </button>
            </div>
        </div>

        <div v-else>
            <div class="mb-4">
                <button @click="goBack" class="text-gray-600 underline hover:text-gray-800">
                    ← Back to plans
                </button>
            </div>
            
            <div class="bg-white rounded-lg shadow-md p-6">
                <h2 class="text-2xl font-bold mb-2">{{ selectedPlan?.name }}</h2>
                <p class="text-3xl font-bold text-primary mb-6">R${{ selectedPlan?.price }}/mês</p>
                
                <div id="cardPaymentBrick_container" style="min-height: 450px; width: 100%;"></div>
            </div>
        </div>
    </div>
</template>
