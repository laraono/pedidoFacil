<script setup>
  import { ref, computed, onMounted } from "vue";
  import { useRouter } from "vue-router";
  import { request } from "@/services/api.js";
  import { useFeaturesStore } from "@/stores/features";
  import { storeToRefs } from "pinia";
  import { planApi } from "@/services/planApi";
  import { Check } from "lucide-vue-next";
  import LandingHeader from "@/components/LandingHeader.vue";
  import { monthlyEquivalent } from "@/utils/frequency";
  import { useUtils } from "@/composables/useUtils";
  import { BaseButton, BaseInput, BaseTextArea } from "@/components/ui";

  import imgOndas from "@/assets/ondas.png";
  import imgTablet from "@/assets/imgTablet.png";
  import imgGraficos from "@/assets/graficos.png";
  import imgInterface from "@/assets/pedidos.png";

  const router = useRouter();
  const { formatCurrency, parsedFeatures } = useUtils();
  const { emailEnabled } = storeToRefs(useFeaturesStore());

  const plans = ref([]);


  const annualPlan = computed(
    () => plans.value.find((p) => p.frequency === "anual") ?? null,
  );
  const monthlyPlan = computed(
    () => plans.value.find((p) => p.frequency === "mensal") ?? null,
  );

  const monthlyFeatures = computed(() => parsedFeatures(monthlyPlan.value?.features));
  const annualFeatures = computed(() => parsedFeatures(annualPlan.value?.features));

  onMounted(async () => {
    try {
      plans.value = await planApi.list();
    } catch (_) {}
  });

  const form = ref({
    nome: "",
    email: "",
    mensagem: "",
  });

  const isSending = ref(false);
  const feedback = ref({ show: false, message: "", type: "" });

  const navigateWithPlan = (plan) => {
    if (plan?.id) localStorage.setItem('pendingPlanId', String(plan.id));
    router.push("/register");
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const submitContato = async () => {
    isSending.value = true;
    feedback.value.show = false;

    try {
      const response = await request("/contato", {
        method: "POST",
        body: JSON.stringify(form.value),
      });

      feedback.value = {
        show: true,
        message: response?.message || "Mensagem enviada com sucesso!",
        type: "success",
      };

      form.value = { nome: "", email: "", mensagem: "" };
    } catch (error) {
      const errorMsg =
        error.data?.errors?.[0]?.mensagem ||
        error.data?.error ||
        "Erro ao enviar mensagem.";
      feedback.value = {
        show: true,
        message: errorMsg,
        type: "error",
      };
    } finally {
      isSending.value = false;
    }
  };
</script>

<template>
  <div class="min-h-screen bg-page font-inter relative overflow-hidden">
    <div
      class="absolute left-0 w-full z-0 pointer-events-none opacity-90 top-[5%] h-[12vh] lg:top-[12%] lg:h-[60vh]"
      :style="{ backgroundImage: `url(${imgOndas})` }"
      style="background-size: 100% 100%; background-repeat: no-repeat"
    ></div>

    <div
      class="absolute bottom-0 left-0 w-full z-0 pointer-events-none opacity-80 h-[12vh] lg:h-[50vh]"
      :style="{ backgroundImage: `url(${imgOndas})` }"
      style="
        background-size: 100% 100%;
        background-repeat: no-repeat;
        transform: scaleX(-1);
      "
    ></div>

    <div class="relative z-10">
      <LandingHeader />

      <main class="flex flex-col items-center pb-20">
        <section
          class="w-full max-w-[1200px] px-4 pt-6 pb-12 lg:px-0 lg:pt-20 lg:pb-20 flex flex-col-reverse lg:flex-row items-center justify-between gap-6 lg:gap-10"
        >
          <div
            class="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left w-full"
          >
            <h1
              class="text-[#212121] font-extrabold mb-4 lg:mb-8 text-3xl sm:text-4xl lg:text-[60px] leading-tight lg:leading-[1.1]"
            >
              Chega de comanda de papel
            </h1>
            <p
              class="text-[#212121] mb-6 lg:mb-12 text-base lg:text-[22px] leading-relaxed lg:leading-[34px] max-w-full lg:max-w-[650px]"
            >
              A <strong class="text-[#212121]">solução ideal</strong> para
              <strong class="text-[#212121]">restaurantes</strong> que querem
              <strong class="text-[#212121]">facilidade</strong> de implementar e
              <strong class="text-[#212121]">aumentar as vendas</strong>.
            </p>
            <div class="flex flex-col lg:flex-row gap-3 w-full lg:w-auto">
              <BaseButton
                v-if="plans.length > 0"
                variant="brand"
                class="py-3 px-6 lg:py-5 lg:px-14 text-sm lg:text-xl shadow-xl shadow-primary/20 hover:-translate-y-1"
                @click="scrollToSection('planos')"
              >
                Conheça nossos planos
              </BaseButton>
            </div>
          </div>
          <div
            class="flex justify-center items-center flex-none w-full max-w-[320px] sm:max-w-[380px] lg:max-w-none lg:flex-1"
          >
            <img
              :src="imgTablet"
              alt="Tablet"
              class="w-full lg:w-[480px] h-auto object-contain transition-transform duration-500 hover:scale-105"
            />
          </div>
        </section>

        <section
          class="max-w-[1200px] w-[calc(100%-2.5rem)] lg:w-full mx-auto py-16 flex flex-col lg:flex-row justify-around items-center gap-12 lg:gap-0 bg-white rounded border border-[#E0E0E0] shadow-2xl"
        >
          <div class="flex flex-col items-center text-center">
            <span
              class="text-[#757575] text-lg font-bold mb-1 uppercase tracking-widest"
              >Mais</span
            >
            <span class="text-accent text-[56px] font-black mb-2 leading-tight"
              >Economia</span
            >
            <span class="text-[#212121] text-xl font-medium max-w-[250px]"
              >Utilize os equipamentos que você já tem</span
            >
          </div>
          <div class="hidden lg:block w-px h-24 bg-gray-100"></div>
          <div class="flex flex-col items-center text-center">
            <span
              class="text-[#757575] text-lg font-bold mb-1 uppercase tracking-widest"
              >Maior</span
            >
            <span class="text-accent text-[56px] font-black mb-2 leading-tight"
              >Praticidade</span
            >
            <span class="text-[#212121] text-xl font-medium max-w-[250px]"
              >Se adapta aos fluxos reais do seu serviço</span
            >
          </div>
          <div class="hidden lg:block w-px h-24 bg-gray-100"></div>
          <div class="flex flex-col items-center text-center">
            <span
              class="text-[#757575] text-lg font-bold mb-1 uppercase tracking-widest"
              >Melhor</span
            >
            <span class="text-accent text-[56px] font-black mb-2 leading-tight"
              >Gestão</span
            >
            <span class="text-[#212121] text-xl font-medium max-w-[250px]"
              >Coleta informações para ter estratégias lucrativas</span
            >
          </div>
        </section>

        <section
          id="sobre"
          class="w-full max-w-[1200px] px-5 lg:px-0 py-24 text-center"
        >
          <h2
            class="text-[#212121] text-3xl lg:text-[42px] font-bold mb-10 leading-tight tracking-tight"
          >
            Otimize seu restaurante e aumente as vendas
          </h2>
          <div
            class="text-[#757575] text-lg lg:text-xl leading-[30px] mb-16 max-w-[800px] mx-auto space-y-6"
          >
            <p>
              Uma
              <strong class="text-accent"
                >plataforma completa para a gestão do seu restaurante</strong
              >.
            </p>
          </div>
          <div
            class="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-[850px] mx-auto"
          >
            <div
              class="w-full bg-white py-12 px-8 rounded border border-[#E0E0E0] hover:border-accent/40 transition-all duration-500 group flex flex-col items-center h-full hover:shadow-2xl hover:shadow-primary/5"
            >
              <h3
                class="text-accent text-2xl lg:text-3xl font-bold mb-6 group-hover:scale-105 transition-transform"
              >
                Reduza erros e otimize o tempo
              </h3>
              <p
                class="text-[#757575] text-base lg:text-lg leading-relaxed flex-grow mb-8"
              >
                Os pedidos feitos nos
                <strong class="text-[#212121]"
                  >totens, tablets ou no caixa</strong
                >
                são enviados diretamente e sem erros para a cozinha, eliminando
                a confusão de comandas de papel.
              </p>
              <div
                class="p-4 bg-gray-50 rounded group-hover:bg-primary-dark/10 transition-colors mt-auto shadow-inner"
              >
                <Check class="w-8 h-8 text-accent" stroke-width="3" />
              </div>
            </div>
            <div
              class="w-full bg-white py-12 px-8 rounded border border-[#E0E0E0] hover:border-accent/40 transition-all duration-500 group flex flex-col items-center h-full hover:shadow-2xl hover:shadow-primary/5"
            >
              <h3
                class="text-accent text-2xl lg:text-3xl font-bold mb-6 group-hover:scale-105 transition-transform"
              >
                Tenha total controle
              </h3>
              <p
                class="text-[#757575] text-base lg:text-lg leading-relaxed flex-grow mb-8"
              >
                Altere preços, adicione ou remova produtos e personalize o
                cardápio em tempo real, de forma
                <strong class="text-[#212121]">simples e rápida</strong>, direto
                do painel administrativo.
              </p>
              <div
                class="p-4 bg-gray-50 rounded group-hover:bg-primary-dark/10 transition-colors mt-auto shadow-inner"
              >
                <Check class="w-8 h-8 text-accent" stroke-width="3" />
              </div>
            </div>
          </div>
        </section>

        <section class="w-full max-w-[1200px] px-5 lg:px-0 py-20">
          <div class="flex flex-col lg:flex-row gap-16 items-center">
            <div class="flex-1 group w-full">
              <h3
                class="text-[#212121] text-2xl lg:text-[32px] font-bold mb-8 text-center group-hover:text-accent transition-colors tracking-tight"
              >
                Soluções Rápidas
              </h3>
              <div
                class="w-full flex items-center justify-center rounded bg-white border border-[#E0E0E0] p-4 md:p-8 overflow-hidden shadow-2xl"
              >
                <img
                  :src="imgInterface"
                  class="w-full h-auto object-contain hover:scale-105 transition-transform duration-500 max-h-[400px]"
                />
              </div>
            </div>
            <div class="flex-1 group w-full">
              <h3
                class="text-[#212121] text-2xl lg:text-[32px] font-bold mb-8 text-center group-hover:text-accent transition-colors tracking-tight"
              >
                Relatórios de Desempenho
              </h3>
              <div
                class="w-full flex items-center justify-center rounded bg-white border border-[#E0E0E0] p-4 md:p-8 overflow-hidden shadow-2xl"
              >
                <img
                  :src="imgGraficos"
                  class="w-full h-auto object-contain hover:scale-105 transition-transform duration-500 max-h-[400px]"
                />
              </div>
            </div>
          </div>
        </section>

        <section
          v-if="plans.length > 0"
          id="planos"
          class="w-full max-w-[1000px] px-5 lg:px-0 py-24 text-center"
        >
          <h2
            class="text-[#212121] text-3xl lg:text-[42px] font-bold mb-16 tracking-tight"
          >
            Escolha seu plano
          </h2>
          <div
            class="flex flex-col lg:flex-row gap-8 justify-center items-stretch"
          >
            <div
              v-if="monthlyPlan"
              class="flex-1 bg-white px-8 py-12 rounded border border-[#E0E0E0] flex flex-col items-center hover:border-primary/30 transition-all max-w-md mx-auto w-full hover:shadow-md"
            >
              <h3 class="text-[#212121] text-3xl font-black mb-4">
                {{ monthlyPlan.name }}
              </h3>
              <div
                class="text-[#212121] text-5xl lg:text-6xl font-black mb-1 tracking-tighter"
              >
                {{ formatCurrency(Number(monthlyPlan.price)) }}<span
                  class="text-xl font-normal text-[#757575] tracking-normal"
                  >/mês</span
                >
              </div>
              <p class="text-xs text-[#757575] mb-2">cobrado mensalmente</p>
              <div class="w-full h-px bg-[#E0E0E0] my-8"></div>
              <div class="flex flex-col gap-5 mb-10 w-full px-2 text-left">
                <div
                  v-for="feat in monthlyFeatures"
                  :key="feat"
                  class="flex items-center gap-4 text-[#757575] font-medium"
                >
                  <Check class="text-primary w-5 h-5 flex-shrink-0" stroke-width="3" />
                  {{ feat }}
                </div>
              </div>
              <BaseButton variant="brand" class="w-full mt-auto" @click="navigateWithPlan(monthlyPlan)">
                Contratar Mensal
              </BaseButton>
            </div>

            <div
              v-if="annualPlan"
              class="flex-1 bg-primary-light px-8 py-12 rounded border-2 border-primary/30 flex flex-col items-center hover:border-primary/60 transition-all max-w-md mx-auto w-full hover:shadow-lg relative"
            >
              <div
                class="absolute top-0 right-0 bg-primary text-white font-black text-[10px] px-4 py-2 rounded uppercase tracking-wider"
              >
                RECOMENDADO
              </div>
              <h3 class="text-primary text-3xl font-black mb-4">
                {{ annualPlan.name }}
              </h3>
              <div
                class="text-[#212121] text-5xl lg:text-6xl font-black mb-1 tracking-tighter"
              >
                {{ formatCurrency(monthlyEquivalent(Number(annualPlan.price), 'anual')) }}<span
                  class="text-xl font-normal text-[#757575] tracking-normal"
                  >/mês</span
                >
              </div>
              <p class="text-xs text-primary font-bold mb-2">
                Preço total anual:
                {{ formatCurrency(Number(annualPlan.price)) }}
              </p>
              <p class="text-xs text-[#757575] mb-1">
                Parcele em até 12× no cartão
              </p>
              <div class="w-full h-px bg-primary/20 my-8"></div>
              <div class="flex flex-col gap-5 mb-10 w-full px-2 text-left">
                <div
                  v-for="feat in annualFeatures"
                  :key="feat"
                  class="flex items-center gap-4 text-[#757575] font-medium"
                >
                  <Check class="text-primary w-5 h-5 flex-shrink-0" stroke-width="3" />
                  {{ feat }}
                </div>
              </div>
              <BaseButton variant="brand" class="w-full mt-auto" @click="navigateWithPlan(annualPlan)">
                Contratar Anual
              </BaseButton>
            </div>
          </div>
        </section>

        <section
          v-if="emailEnabled"
          id="contato"
          class="w-full max-w-[700px] px-5 lg:px-0 mt-20 mb-32 text-center"
        >
          <h2
            class="text-[#212121] text-3xl lg:text-[42px] font-bold mb-12 tracking-tight"
          >
            Fale Conosco
          </h2>
          <div
            class="bg-white rounded p-8 lg:p-14 shadow-2xl border border-[#E0E0E0]"
          >
            <form
              class="flex flex-col text-left"
              @submit.prevent="submitContato"
            >
              <h3
                class="text-accent text-xs font-black mb-10 text-center uppercase tracking-[0.2em]"
              >
                Envie uma mensagem
              </h3>
              <div
                v-if="feedback.show"
                :class="
                  feedback.type === 'success'
                    ? 'bg-green-100 text-green-700 border-green-200'
                    : 'bg-red-100 text-red-700 border-red-200'
                "
                class="p-4 rounded border mb-6 text-sm font-bold text-center"
              >
                {{ feedback.message }}
              </div>
              <BaseInput
                v-model="form.nome"
                label="Seu Nome"
                placeholder="Ex: João Silva"
                maxlength="100"
                :dark="false"
                class="mb-6"
              />
              <BaseInput
                v-model="form.email"
                type="email"
                label="Seu Email"
                placeholder="Ex: contato@email.com"
                maxlength="255"
                :dark="false"
                class="mb-6"
              />
              <BaseTextArea
                v-model="form.mensagem"
                label="Mensagem"
                placeholder="Como podemos ajudar?"
                :rows="4"
                class="mb-10"
              />
              <BaseButton
                type="submit"
                variant="brand"
                size="lg"
                :isLoading="isSending"
                class="w-full"
              >
                Enviar Mensagem
              </BaseButton>
            </form>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>
