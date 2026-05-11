<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useSubscriptionStore } from '@/stores/subscriptions';
import { request } from '@/services/api.js';
import { planApi } from '@/services/planApi';
import { User, Menu, X, Check } from 'lucide-vue-next';

import imgLogo from '@/assets/light-logo.png'; 
import imgOndas from '@/assets/ondas.png';
import imgTotem from '@/assets/totem.png'; 
import imgGraficos from '@/assets/graficos.png';
import imgInterface from '@/assets/pedidos.png'; 

const router = useRouter();
const isMenuOpen = ref(false);
const subscriptionStore = useSubscriptionStore();
const planPrices = computed(() => subscriptionStore.planPrices);

const plans = ref([]);

function normalizeFrequency(frequency) {
  const f = String(frequency ?? '').trim().toLowerCase();
  if (['anual', '12', 'annual', 'yearly'].includes(f)) return 'anual';
  if (['months', '1', 'mensal', 'monthly', 'month'].includes(f)) return 'mensal';
  return f;
}

function parsedFeatures(features) {
  if (!features) return [];
  try { return JSON.parse(features); }
  catch { return features.split(',').map(f => f.trim()).filter(Boolean); }
}

const annualPlan = computed(() => plans.value.find(p => normalizeFrequency(p.frequency) === 'anual') ?? null);
const monthlyPlan = computed(() => plans.value.find(p => normalizeFrequency(p.frequency) === 'mensal') ?? null);

onMounted(async () => {
  try { plans.value = await planApi.list(); } catch (_) {}
});

const form = ref({
  nome: '',
  email: '',
  mensagem: ''
});

const isSending = ref(false);
const feedback = ref({ show: false, message: '', type: '' });

const navigateToLogin = () => { router.push('/login'); };
const toggleMenu = () => { isMenuOpen.value = !isMenuOpen.value; };
const navigateToRegister = () => { router.push('/register'); };

const scrollToSection = (sectionId) => {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
    isMenuOpen.value = false; 
  }
};

const submitContato = async () => {
  isSending.value = true;
  feedback.value.show = false;

  try {
    const response = await request('/contato', {
      method: 'POST',
      body: JSON.stringify(form.value)
    });

    feedback.value = { 
      show: true, 
      message: response?.message || 'Mensagem enviada com sucesso!', 
      type: 'success' 
    };
    
    form.value = { nome: '', email: '', mensagem: '' };
    
  } catch (error) {
    const errorMsg = error.data?.errors?.[0]?.mensagem || error.data?.error || 'Erro ao enviar mensagem.';
    feedback.value = { 
      show: true, 
      message: errorMsg, 
      type: 'error' 
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
      style="background-size: 100% 100%; background-repeat: no-repeat;"
    ></div>

    <div 
      class="absolute bottom-0 left-0 w-full z-0 pointer-events-none opacity-80 h-[12vh] lg:h-[50vh]"
      :style="{ backgroundImage: `url(${imgOndas})` }"
      style="background-size: 100% 100%; background-repeat: no-repeat; transform: scaleX(-1);"
    ></div>

    <div class="relative z-10">
      
      <header class="flex justify-between items-center px-5 py-4 lg:px-0 lg:py-8 max-w-[1200px] mx-auto relative">
        <div class="flex-1 flex justify-start items-center">
          <img :src="imgLogo" alt="Logo PedidoFácil" class="h-9 lg:h-32 w-auto object-contain" />
          <button @click="toggleMenu" class="lg:hidden p-1 ml-auto z-50 relative">
            <component :is="isMenuOpen ? X : Menu" class="w-7 h-7 text-accent" />
          </button>
        </div>
        
        <div class="flex-[2] flex justify-center items-center hidden lg:flex">
          <nav class="space-x-10 text-lg font-bold text-[#212121]">
            <a @click.prevent="scrollToSection('sobre')" href="#sobre" class="hover:text-accent transition-colors cursor-pointer">Sobre</a>
            <a @click.prevent="scrollToSection('planos')" href="#planos" class="hover:text-accent transition-colors cursor-pointer">Planos</a>
            <a @click.prevent="scrollToSection('contato')" href="#contato" class="hover:text-accent transition-colors cursor-pointer">Contato</a>
          </nav>
        </div>
        
        <div class="flex-1 flex justify-end hidden lg:flex items-center gap-4">
          <a @click.prevent="navigateToRegister" class="px-4 py-2 bg-primary text-white font-bold rounded text-sm hover:bg-primary-dark transition-colors cursor-pointer">
            Cadastrar
          </a>
          <a @click.prevent="navigateToLogin" class="flex items-center space-x-2 text-[#212121] font-semibold text-lg cursor-pointer hover:text-accent group">
            <span>Login</span>
            <User class="text-[#212121] group-hover:text-accent transition-colors" :size="24" />
          </a>
        </div>
      </header>

      <div v-if="isMenuOpen" class="lg:hidden bg-white border-b border-[#E0E0E0] p-5 absolute top-[60px] left-0 w-full z-40 shadow-2xl">
        <a href="#sobre" @click.prevent="scrollToSection('sobre')" class="block py-4 border-b border-[#E0E0E0] text-[#212121] text-base font-bold text-center">Sobre nós</a>
        <a href="#planos" @click.prevent="scrollToSection('planos')" class="block py-4 border-b border-[#E0E0E0] text-[#212121] text-base font-bold text-center">Planos</a>
        <a href="#contato" @click.prevent="scrollToSection('contato')" class="block py-4 border-b border-[#E0E0E0] text-[#212121] text-base font-bold text-center">Contato</a>
        <a @click="navigateToRegister" class="block py-4 border-b border-[#E0E0E0] text-primary text-base font-bold text-center cursor-pointer">
          Cadastrar
        </a>
        <a @click="navigateToLogin" class="block py-4 text-accent text-base font-bold text-center flex justify-center items-center gap-2 cursor-pointer hover:bg-primary-dark/10 rounded mt-2 transition-all">
          <User :size="18" /> Login
        </a>
      </div>

      <main class="flex flex-col items-center pb-20">
        <section class="w-full max-w-[1200px] px-4 pt-10 pb-12 lg:px-0 lg:pt-20 lg:pb-20 flex flex-row items-start lg:items-center justify-between gap-4 lg:gap-16">
          <div class="flex justify-center items-start lg:items-center flex-none w-[45%] lg:flex-1 order-1 lg:order-1">
             <img :src="imgTotem" alt="Totem" class="w-full lg:w-[480px] h-auto object-contain transition-transform duration-500 hover:scale-105" />
          </div>
          <div class="flex-1 flex flex-col items-start text-left w-[55%] lg:w-full order-2 lg:order-2">
            <img :src="imgLogo" alt="Logo" class="h-10 lg:h-48 w-auto mb-5 lg:mb-10 object-contain" />
            <h1 class="text-[#212121] font-extrabold mb-4 lg:mb-8 text-lg lg:text-[60px] leading-tight lg:leading-[1.1]">
              Personalize a experiência do seu restaurante
            </h1>
            <p class="text-[#212121] mb-6 lg:mb-12 text-[15px] lg:text-[22px] leading-relaxed lg:leading-[34px] max-w-full lg:max-w-[650px]">
              Bem-vindo ao PedidoFácil. Nossa plataforma é a <strong class="text-[#212121]">solução ideal</strong> para <strong class="text-[#212121]">restaurantes</strong> que querem <strong class="text-[#212121]">modernizar</strong> sua operação e <strong class="text-[#212121]">aumentar as vendas</strong>.
            </p>
            <div class="flex flex-col lg:flex-row gap-3 w-full lg:w-auto">
              <button @click="scrollToSection('planos')" class="bg-primary text-white font-extrabold py-2 px-5 lg:py-5 lg:px-14 rounded lg:rounded text-xs lg:text-xl hover:bg-primary-dark transition-all shadow-xl shadow-primary/20 w-auto transform hover:-translate-y-1 active:scale-95">
                Conheça nossos planos
              </button>
            </div>
          </div>
        </section>

        <section class="w-full max-w-[1200px] px-5 lg:px-0 py-16 flex flex-col lg:flex-row justify-around items-center gap-12 lg:gap-0 bg-white rounded border border-[#E0E0E0] mx-5 lg:mx-0 shadow-2xl">
            <div class="flex flex-col items-center text-center">
              <span class="text-[#757575] text-lg font-bold mb-1 uppercase tracking-widest">Diversos</span>
              <span class="text-accent text-[56px] font-black mb-2 leading-tight">Benefícios</span>
              <span class="text-[#212121] text-xl font-medium max-w-[250px]">Para Aproveitar</span>
            </div>
            <div class="hidden lg:block w-px h-24 bg-gray-100"></div>
            <div class="flex flex-col items-center text-center">
              <span class="text-[#757575] text-lg font-bold mb-1 uppercase tracking-widest">Maior</span>
              <span class="text-accent text-[56px] font-black mb-2 leading-tight">Praticidade</span>
              <span class="text-[#212121] text-xl font-medium max-w-[250px]">Com os pedidos</span>
            </div>
            <div class="hidden lg:block w-px h-24 bg-gray-100"></div>
            <div class="flex flex-col items-center text-center">
              <span class="text-[#757575] text-lg font-bold mb-1 uppercase tracking-widest">Gestão</span>
              <span class="text-accent text-[56px] font-black mb-2 leading-tight">Fácil</span>
              <span class="text-[#212121] text-xl font-medium max-w-[250px]">De onde você estiver</span>
            </div>
        </section>

        <section id="sobre" class="w-full max-w-[1200px] px-5 lg:px-0 py-24 text-center">
          <h2 class="text-[#212121] text-3xl lg:text-[42px] font-bold mb-10 leading-tight tracking-tight">
            Otimize seu restaurante e aumente as vendas
          </h2>
          <div class="text-[#757575] text-lg lg:text-xl leading-[30px] mb-16 max-w-[800px] mx-auto space-y-6">
            <p>Uma <strong class="text-accent">plataforma completa para a gestão do seu restaurante</strong>.</p>
          </div>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-[850px] mx-auto">
            <div class="w-full bg-white py-12 px-8 rounded border border-[#E0E0E0] hover:border-accent/40 transition-all duration-500 group flex flex-col items-center h-full hover:shadow-2xl hover:shadow-primary/5">
              <h3 class="text-accent text-2xl lg:text-3xl font-bold mb-6 group-hover:scale-105 transition-transform">
                Reduza erros e otimize o tempo
              </h3>
              <p class="text-[#757575] text-base lg:text-lg leading-relaxed flex-grow mb-8">
                Os pedidos feitos nos <strong class="text-[#212121]">totens, tablets ou no caixa</strong> são enviados diretamente e sem erros para a cozinha, eliminando a confusão de comandas de papel.
              </p>
              <div class="p-4 bg-gray-50 rounded group-hover:bg-primary-dark/10 transition-colors mt-auto shadow-inner">
                 <Check class="w-8 h-8 text-accent" stroke-width="3" />
              </div>
            </div>
            <div class="w-full bg-white py-12 px-8 rounded border border-[#E0E0E0] hover:border-accent/40 transition-all duration-500 group flex flex-col items-center h-full hover:shadow-2xl hover:shadow-primary/5">
              <h3 class="text-accent text-2xl lg:text-3xl font-bold mb-6 group-hover:scale-105 transition-transform">
                Tenha total controle
              </h3>
              <p class="text-[#757575] text-base lg:text-lg leading-relaxed flex-grow mb-8">
                Altere preços, adicione ou remova produtos e personalize o cardápio em tempo real, de forma <strong class="text-[#212121]">simples e rápida</strong>, direto do painel administrativo.
              </p>
              <div class="p-4 bg-gray-50 rounded group-hover:bg-primary-dark/10 transition-colors mt-auto shadow-inner">
                 <Check class="w-8 h-8 text-accent" stroke-width="3" />
              </div>
            </div>
          </div>
        </section>

        <section class="w-full max-w-[1200px] px-5 lg:px-0 py-20">
          <div class="flex flex-col lg:flex-row gap-16 items-center">
            <div class="flex-1 group w-full">
               <h3 class="text-[#212121] text-2xl lg:text-[32px] font-bold mb-8 text-center group-hover:text-accent transition-colors tracking-tight">Soluções Rápidas</h3>
               <div class="w-full flex items-center justify-center rounded bg-white border border-[#E0E0E0] p-4 md:p-8 overflow-hidden shadow-2xl">
                 <img :src="imgInterface" class="w-full h-auto object-contain hover:scale-105 transition-transform duration-500 max-h-[400px]" />
               </div>
            </div>
            <div class="flex-1 group w-full">
               <h3 class="text-[#212121] text-2xl lg:text-[32px] font-bold mb-8 text-center group-hover:text-accent transition-colors tracking-tight">Relatórios de Desempenho</h3>
               <div class="w-full flex items-center justify-center rounded bg-white border border-[#E0E0E0] p-4 md:p-8 overflow-hidden shadow-2xl">
                 <img :src="imgGraficos" class="w-full h-auto object-contain hover:scale-105 transition-transform duration-500 max-h-[400px]" />
               </div>
            </div>
          </div>
        </section>

        <section id="planos" class="w-full max-w-[1000px] px-5 lg:px-0 py-24 text-center">
           <h2 class="text-[#212121] text-3xl lg:text-[42px] font-bold mb-16 tracking-tight">Escolha seu plano</h2>
           <div class="flex flex-col lg:flex-row gap-8 justify-center items-stretch">

              <!-- Plano Mensal -->
              <div class="flex-1 bg-white px-8 py-12 rounded border border-[#E0E0E0] flex flex-col items-center hover:border-primary/30 transition-all max-w-md mx-auto w-full hover:shadow-md">
                 <h3 class="text-[#212121] text-3xl font-black mb-4">{{ monthlyPlan?.name ?? 'Mensal' }}</h3>
                 <div class="text-[#212121] text-5xl lg:text-6xl font-black mb-1 tracking-tighter">
                   {{ monthlyPlan ? Number(monthlyPlan.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : `R$${planPrices.monthly.toFixed(2).replace('.',',')}` }}<span class="text-xl font-normal text-[#757575] tracking-normal">/mês</span>
                 </div>
                 <p class="text-xs text-[#757575] mb-2">cobrado mensalmente</p>
                 <div class="w-full h-px bg-[#E0E0E0] my-8"></div>
                 <div class="flex flex-col gap-5 mb-10 w-full px-2 text-left">
                    <template v-if="parsedFeatures(monthlyPlan?.features).length">
                      <div v-for="feat in parsedFeatures(monthlyPlan?.features)" :key="feat" class="flex items-center gap-4 text-[#757575] font-medium">
                        <Check class="text-primary w-5 h-5 flex-shrink-0" stroke-width="3" /> {{ feat }}
                      </div>
                    </template>
                    <template v-else>
                      <div class="flex items-center gap-4 text-[#757575] font-medium"><Check class="text-primary w-5 h-5 flex-shrink-0" stroke-width="3" /> Suporte ao Usuário</div>
                      <div class="flex items-center gap-4 text-[#757575] font-medium"><Check class="text-primary w-5 h-5 flex-shrink-0" stroke-width="3" /> Relatórios de Desempenho</div>
                      <div class="flex items-center gap-4 text-[#757575] font-medium"><Check class="text-primary w-5 h-5 flex-shrink-0" stroke-width="3" /> Automação do Sistema</div>
                    </template>
                 </div>
                 <button @click="navigateToRegister" class="bg-primary text-white font-black py-4 px-12 rounded w-full hover:bg-primary-dark transition-colors mt-auto text-base active:scale-95">
                    Contratar Mensal
                 </button>
              </div>

              <!-- Plano Anual -->
              <div class="flex-1 bg-primary-light px-8 py-12 rounded border-2 border-primary/30 flex flex-col items-center hover:border-primary/60 transition-all max-w-md mx-auto w-full hover:shadow-lg relative">
                 <div class="absolute top-0 right-0 bg-primary text-white font-black text-[10px] px-4 py-2 rounded uppercase tracking-wider">RECOMENDADO</div>
                 <h3 class="text-primary text-3xl font-black mb-4">{{ annualPlan?.name ?? 'Anual' }}</h3>
                 <div class="text-[#212121] text-5xl lg:text-6xl font-black mb-1 tracking-tighter">
                   {{ annualPlan ? Number(annualPlan.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : `R$${planPrices.annual.toFixed(2).replace('.',',')}` }}<span class="text-xl font-normal text-[#757575] tracking-normal">/mês</span>
                 </div>
                 <p class="text-xs text-primary font-bold mb-2">
                   Preço total anual: {{ annualPlan ? Number(annualPlan.price * 12).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : `R$${(planPrices.annual * 12).toFixed(2).replace('.',',')}` }}
                 </p>
                 <p class="text-xs text-[#757575] mb-1">Parcele em até 12× no cartão</p>
                 <div class="w-full h-px bg-primary/20 my-8"></div>
                 <div class="flex flex-col gap-5 mb-10 w-full px-2 text-left">
                    <template v-if="parsedFeatures(annualPlan?.features).length">
                      <div v-for="feat in parsedFeatures(annualPlan?.features)" :key="feat" class="flex items-center gap-4 text-[#757575] font-medium">
                        <Check class="text-primary w-5 h-5 flex-shrink-0" stroke-width="3" /> {{ feat }}
                      </div>
                    </template>
                    <template v-else>
                      <div class="flex items-center gap-4 text-[#757575] font-medium"><Check class="text-primary w-5 h-5 flex-shrink-0" stroke-width="3" /> Suporte ao Usuário</div>
                      <div class="flex items-center gap-4 text-[#757575] font-medium"><Check class="text-primary w-5 h-5 flex-shrink-0" stroke-width="3" /> Relatórios de Desempenho</div>
                      <div class="flex items-center gap-4 text-[#757575] font-medium"><Check class="text-primary w-5 h-5 flex-shrink-0" stroke-width="3" /> Automação do Sistema</div>
                      <div class="flex items-center gap-4 text-[#212121] font-bold"><Check class="text-primary w-5 h-5 flex-shrink-0" stroke-width="3" /> Maior Estabilidade</div>
                    </template>
                 </div>
                 <button @click="navigateToRegister" class="bg-primary text-white font-black py-4 px-12 rounded w-full hover:bg-primary-dark transition-colors mt-auto text-base shadow-md shadow-primary/20 active:scale-95">
                    Contratar Anual
                 </button>
              </div>

           </div>
        </section>
        
        <section id="contato" class="w-full max-w-[700px] px-5 lg:px-0 mt-20 mb-32 text-center">
          <h2 class="text-[#212121] text-3xl lg:text-[42px] font-bold mb-12 tracking-tight">Fale Conosco</h2>
          <div class="bg-white rounded p-8 lg:p-14 shadow-2xl border border-[#E0E0E0]">
              <form class="flex flex-col text-left" @submit.prevent="submitContato">
                  <h3 class="text-accent text-xs font-black mb-10 text-center uppercase tracking-[0.2em]">Envie uma mensagem</h3>
                  <div v-if="feedback.show" :class="feedback.type === 'success' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'" class="p-4 rounded border mb-6 text-sm font-bold text-center">
                    {{ feedback.message }}
                  </div>
                  <label class="text-[#757575] text-[10px] font-black ml-2 mb-2 uppercase tracking-widest">Seu Nome</label>
                  <input v-model="form.nome" type="text" required maxlength="100" placeholder="Ex: João Silva" class="bg-gray-50 border border-[#E0E0E0] rounded p-5 text-[#212121] mb-6 focus:outline-none focus:border-primary/50 transition-all font-medium" />
                  <label class="text-[#757575] text-[10px] font-black ml-2 mb-2 uppercase tracking-widest">Seu Email</label>
                  <input v-model="form.email" type="email" required maxlength="255" placeholder="Ex: contato@email.com" class="bg-gray-50 border border-[#E0E0E0] rounded p-5 text-[#212121] mb-6 focus:outline-none focus:border-primary/50 transition-all font-medium" />
                  <label class="text-[#757575] text-[10px] font-black ml-2 mb-2 uppercase tracking-widest">Mensagem</label>
                  <textarea v-model="form.mensagem" rows="4" required maxlength="1000" placeholder="Como podemos ajudar?" class="bg-gray-50 border border-[#E0E0E0] rounded p-5 text-[#212121] mb-10 focus:outline-none focus:border-primary/50 resize-none transition-all font-medium"></textarea>
                  <button type="submit" :disabled="isSending" class="bg-primary text-white font-black text-xl py-5 rounded hover:bg-primary-dark transition-all shadow-xl shadow-primary/20 active:scale-95 disabled:opacity-50">
                      {{ isSending ? 'Enviando...' : 'Enviar Mensagem' }}
                  </button>
              </form>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>