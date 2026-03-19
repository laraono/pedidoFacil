<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useSubscriptionStore } from '@/stores/subscriptions';
import { User, Menu, X, Check } from 'lucide-vue-next';

import imgLogo from '@/assets/logo.png'; 
import imgOndas from '@/assets/ondas.png';
import imgTotem from '@/assets/totem.png'; 
import imgGraficos from '@/assets/graficos.png';
import imgInterface from '@/assets/pedidos.png'; 

const router = useRouter();
const isMenuOpen = ref(false);
const subscriptionStore = useSubscriptionStore();
const planPrices = computed(() => subscriptionStore.planPrices);

const navigateToLogin = () => { router.push('/login'); };
const toggleMenu = () => { isMenuOpen.value = !isMenuOpen.value; };

const navigateToRegister = () => {
  router.push('/register'); 
};

const scrollToSection = (sectionId) => {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
    isMenuOpen.value = false; 
  }
};
</script>

<template>
  <div class="min-h-screen bg-dark-bg font-inter relative overflow-hidden">
    
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
            <component :is="isMenuOpen ? X : Menu" class="w-7 h-7 text-brand-green" />
          </button>
        </div>
        
        <div class="flex-[2] flex justify-center items-center hidden lg:flex">
          <nav class="space-x-10 text-lg font-bold text-white">
            <a @click.prevent="scrollToSection('sobre')" href="#sobre" class="hover:text-brand-green transition-colors cursor-pointer">Sobre</a>
            <a @click.prevent="scrollToSection('planos')" href="#planos" class="hover:text-brand-green transition-colors cursor-pointer">Planos</a>
            <a @click.prevent="scrollToSection('contato')" href="#contato" class="hover:text-brand-green transition-colors cursor-pointer">Contato</a>
          </nav>
        </div>
        
        <div class="flex-1 flex justify-end hidden lg:flex">
          <a @click.prevent="navigateToLogin" class="flex items-center space-x-2 text-white font-semibold text-lg cursor-pointer hover:text-brand-green group">
            <span>Login</span>
            <User class="text-white group-hover:text-brand-green transition-colors" :size="24" />
          </a>
        </div>
      </header>

      <div v-if="isMenuOpen" class="lg:hidden bg-dark-bg/95 backdrop-blur-md border-b border-white/5 p-5 absolute top-[60px] left-0 w-full z-40 shadow-2xl">
        <a href="#sobre" @click.prevent="scrollToSection('sobre')" class="block py-4 border-b border-white/5 text-white text-base font-bold text-center">Sobre nós</a>
        <a href="#planos" @click.prevent="scrollToSection('planos')" class="block py-4 border-b border-white/5 text-white text-base font-bold text-center">Planos</a>
        <a href="#contato" @click.prevent="scrollToSection('contato')" class="block py-4 border-b border-white/5 text-white text-base font-bold text-center">Contato</a>
         <a @click="navigateToLogin" class="block py-4 text-brand-green text-base font-bold text-center flex justify-center items-center gap-2 cursor-pointer hover:bg-brand-green/10 rounded-lg mt-2 transition-all">
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
            
            <h1 class="text-white font-extrabold mb-4 lg:mb-8 text-lg lg:text-[60px] leading-tight lg:leading-[1.1]">
              Personalize a experiência do seu restaurante
            </h1>
            
            <p class="text-gray-200 mb-6 lg:mb-12 text-[15px] lg:text-[22px] leading-relaxed lg:leading-[34px] max-w-full lg:max-w-[650px]">
              Bem-vindo ao PedidoFácil. Nossa plataforma é a <strong class="text-brand-green">solução ideal</strong> para <strong class="text-white">restaurantes</strong> que querem <strong class="text-white">modernizar</strong> sua operação e <strong class="text-brand-green">aumentar as vendas</strong>.
            </p>
            
            <div class="flex flex-col lg:flex-row gap-3 w-full lg:w-auto">
              <button @click="scrollToSection('planos')" class="bg-brand-green text-black font-extrabold py-2 px-5 lg:py-5 lg:px-14 rounded-lg lg:rounded-2xl text-xs lg:text-xl hover:bg-brand-green-hover transition-all shadow-xl shadow-brand-green/20 w-auto transform hover:-translate-y-1 active:scale-95">
                Ver Planos e Começar
              </button>
              <button @click="scrollToSection('planos')" class="border border-white/20 text-white font-extrabold py-2 px-5 lg:py-5 lg:px-14 rounded-lg lg:rounded-2xl text-xs lg:text-xl hover:bg-white/5 transition-all w-auto">
                Conheça nossos planos
              </button>
            </div>
          </div>
        </section>

        <section class="w-full max-w-[1200px] px-5 lg:px-0 py-16 flex flex-col lg:flex-row justify-around items-center gap-12 lg:gap-0 bg-white/[0.03] rounded-[2.5rem] backdrop-blur-sm border border-white/5 mx-5 lg:mx-0 shadow-2xl">
            <div class="flex flex-col items-center text-center">
              <span class="text-gray-500 text-lg font-bold mb-1 uppercase tracking-widest">Diversos</span>
              <span class="text-brand-green text-[56px] font-black mb-2 leading-tight">Benefícios</span>
              <span class="text-white text-xl font-medium max-w-[250px]">Para Aproveitar</span>
            </div>
            <div class="hidden lg:block w-px h-24 bg-white/10"></div>
            <div class="flex flex-col items-center text-center">
              <span class="text-gray-500 text-lg font-bold mb-1 uppercase tracking-widest">Maior</span>
              <span class="text-brand-green text-[56px] font-black mb-2 leading-tight">Praticidade</span>
              <span class="text-white text-xl font-medium max-w-[250px]">Com os pedidos</span>
            </div>
            <div class="hidden lg:block w-px h-24 bg-white/10"></div>
            <div class="flex flex-col items-center text-center">
              <span class="text-gray-500 text-lg font-bold mb-1 uppercase tracking-widest">Gestão</span>
              <span class="text-brand-green text-[56px] font-black mb-2 leading-tight">Fácil</span>
              <span class="text-white text-xl font-medium max-w-[250px]">De onde você estiver</span>
            </div>
        </section>

        <section id="sobre" class="w-full max-w-[1200px] px-5 lg:px-0 py-24 text-center">
          <h2 class="text-white text-3xl lg:text-[42px] font-bold mb-10 leading-tight tracking-tight">
            Otimize seu restaurante e aumente as vendas
          </h2>

          <div class="text-gray-300 text-lg lg:text-xl leading-[30px] mb-16 max-w-[800px] mx-auto space-y-6">
            <p>Uma <strong class="text-brand-green">plataforma completa para a gestão do seu restaurante</strong>.</p>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-[850px] mx-auto">
            
            <div class="w-full bg-dark-card py-12 px-8 rounded-[2.5rem] border border-white/5 hover:border-brand-green/30 transition-all duration-500 group flex flex-col items-center h-full hover:shadow-2xl hover:shadow-brand-green/5">
              <h3 class="text-brand-green text-2xl lg:text-3xl font-bold mb-6 group-hover:scale-105 transition-transform">
                Reduza erros e otimize o tempo
              </h3>
              <p class="text-gray-300 text-base lg:text-lg leading-relaxed flex-grow mb-8">
                Os pedidos feitos nos <strong class="text-white">totens, tablets ou no caixa</strong> são enviados diretamente e sem erros para a cozinha, eliminando a confusão de comandas de papel.
              </p>
              <div class="p-4 bg-white/5 rounded-full group-hover:bg-brand-green/10 transition-colors mt-auto shadow-inner">
                 <Check class="w-8 h-8 text-brand-green" stroke-width="3" />
              </div>
            </div>

            <div class="w-full bg-dark-card py-12 px-8 rounded-[2.5rem] border border-white/5 hover:border-brand-green/30 transition-all duration-500 group flex flex-col items-center h-full hover:shadow-2xl hover:shadow-brand-green/5">
              <h3 class="text-brand-green text-2xl lg:text-3xl font-bold mb-6 group-hover:scale-105 transition-transform">
                Tenha total controle
              </h3>
              <p class="text-gray-300 text-base lg:text-lg leading-relaxed flex-grow mb-8">
                Altere preços, adicione ou remova produtos e personalize o cardápio em tempo real, de forma <strong class="text-white">simples e rápida</strong>, direto do painel administrativo.
              </p>
              <div class="p-4 bg-white/5 rounded-full group-hover:bg-brand-green/10 transition-colors mt-auto shadow-inner">
                 <Check class="w-8 h-8 text-brand-green" stroke-width="3" />
              </div>
            </div>

          </div>
        </section>

        <section class="w-full max-w-[1200px] px-5 lg:px-0 py-20">
          <div class="flex flex-col lg:flex-row gap-16 items-center">
            <div class="flex-1 group w-full">
               <h3 class="text-white text-2xl lg:text-[32px] font-bold mb-8 text-center group-hover:text-brand-green transition-colors tracking-tight">Soluções Rápidas</h3>
               <div class="w-full flex items-center justify-center rounded-3xl bg-white/[0.02] border border-white/5 p-4 md:p-8 overflow-hidden shadow-2xl">
                 <img :src="imgInterface" class="w-full h-auto object-contain hover:scale-105 transition-transform duration-500 max-h-[400px]" />
               </div>
            </div>
            <div class="flex-1 group w-full">
               <h3 class="text-white text-2xl lg:text-[32px] font-bold mb-8 text-center group-hover:text-brand-green transition-colors tracking-tight">Relatórios de Desempenho</h3>
               <div class="w-full flex items-center justify-center rounded-3xl bg-white/[0.02] border border-white/5 p-4 md:p-8 overflow-hidden shadow-2xl">
                 <img :src="imgGraficos" class="w-full h-auto object-contain hover:scale-105 transition-transform duration-500 max-h-[400px]" />
               </div>
            </div>
          </div>
        </section>

        <section id="planos" class="w-full max-w-[1000px] px-5 lg:px-0 py-24 text-center">
           <h2 class="text-white text-3xl lg:text-[42px] font-bold mb-16 tracking-tight">Escolha seu plano</h2>
           
           <div class="flex flex-col lg:flex-row gap-8 justify-center items-stretch">
              
              <div class="flex-1 bg-dark-card px-8 py-12 rounded-[2.5rem] border border-white/5 flex flex-col items-center hover:border-brand-green/20 transition-all max-w-md mx-auto w-full h-full hover:shadow-2xl">
                 <h3 class="text-brand-green text-3xl font-black mb-4">Mensal</h3>
                 <div class="text-white text-5xl lg:text-6xl font-black mb-2 tracking-tighter">R${{ planPrices.monthly.toFixed(2).replace('.',',') }}<span class="text-xl font-normal text-gray-500 tracking-normal">/mês</span></div>
                 
                 <div class="w-full h-px bg-white/5 my-8"></div>

                 <div class="flex flex-col gap-5 mb-10 w-full px-2 text-left">
                    <div class="flex items-center gap-4 text-gray-300 font-medium"><Check class="text-brand-green w-6 h-6 flex-shrink-0" stroke-width="3" /> Suporte ao Usuário</div>
                    <div class="flex items-center gap-4 text-gray-300 font-medium"><Check class="text-brand-green w-6 h-6 flex-shrink-0" stroke-width="3" /> Relatórios de Desempenho</div>
                    <div class="flex items-center gap-4 text-gray-300 font-medium"><Check class="text-brand-green w-6 h-6 flex-shrink-0" stroke-width="3" /> Automação do Sistema</div>
                    
                    <div class="flex items-center gap-4 text-transparent opacity-0 select-none">
                      <Check class="w-6 h-6 flex-shrink-0" /> Maior Estabilidade
                    </div>
                 </div>

                 <button @click="navigateToRegister" class="bg-white text-black font-black py-5 px-12 rounded-2xl w-full hover:bg-gray-100 transition-colors mt-auto text-lg active:scale-95">
                    Confirmar
                 </button>
              </div>

              <div class="flex-1 bg-dark-card px-8 py-12 rounded-[2.5rem] border-2 border-brand-green/30 flex flex-col items-center hover:border-brand-green transition-all max-w-md mx-auto w-full h-full hover:shadow-2xl hover:shadow-brand-green/10 relative">
                 
                 <div class="absolute top-0 right-0 bg-brand-green text-black font-black text-[10px] px-5 py-2.5 rounded-bl-2xl rounded-tr-[2.5rem] uppercase tracking-wider">RECOMENDADO</div>

                 <h3 class="text-brand-green text-3xl font-black mb-4">Anual</h3>
                 <div class="text-white text-5xl lg:text-6xl font-black mb-2 tracking-tighter">R${{ planPrices.annual.toFixed(2).replace('.',',') }}<span class="text-xl font-normal text-gray-500 tracking-normal">/mês</span></div>
                 
                 <div class="w-full h-px bg-white/5 my-8"></div>

                 <div class="flex flex-col gap-5 mb-10 w-full px-2 text-left">
                    <div class="flex items-center gap-4 text-gray-300 font-medium"><Check class="text-brand-green w-6 h-6 flex-shrink-0" stroke-width="3" /> Suporte ao Usuário</div>
                    <div class="flex items-center gap-4 text-gray-300 font-medium"><Check class="text-brand-green w-6 h-6 flex-shrink-0" stroke-width="3" /> Relatórios de Desempenho</div>
                    <div class="flex items-center gap-4 text-gray-300 font-medium"><Check class="text-brand-green w-6 h-6 flex-shrink-0" stroke-width="3" /> Automação do Sistema</div>
                    <div class="flex items-center gap-4 text-white font-bold"><Check class="text-brand-green w-6 h-6 flex-shrink-0" stroke-width="3" /> Maior Estabilidade</div>
                 </div>

                 <button @click="navigateToRegister" class="bg-white text-black font-black py-5 px-12 rounded-2xl w-full hover:bg-brand-green-hover transition-colors mt-auto text-lg shadow-lg shadow-brand-green/20 active:scale-95">
                    Confirmar
                 </button>
              </div>

           </div>
        </section>
        
        <section id="contato" class="w-full max-w-[700px] px-5 lg:px-0 mt-20 mb-32 text-center">
          <h2 class="text-white text-3xl lg:text-[42px] font-bold mb-12 tracking-tight">Fale Conosco</h2>
          
          <div class="bg-dark-card rounded-[3rem] p-8 lg:p-14 shadow-2xl border border-white/5">
              <form class="flex flex-col text-left" @submit.prevent>
                  <h3 class="text-brand-green text-xs font-black mb-10 text-center uppercase tracking-[0.2em]">Envie uma mensagem</h3>
                  
                  <label class="text-gray-500 text-[10px] font-black ml-2 mb-2 uppercase tracking-widest">Seu Nome</label>
                  <input type="text" required maxlength="100" placeholder="Ex: João Silva" class="bg-white/5 border border-white/10 rounded-2xl p-5 text-white placeholder-gray-600 mb-6 focus:outline-none focus:border-brand-green/50 focus:ring-1 focus:ring-brand-green/50 transition-all font-medium" />

                  <label class="text-gray-500 text-[10px] font-black ml-2 mb-2 uppercase tracking-widest">Seu Email</label>
                  <input type="email" required maxlength="255" placeholder="Ex: contato@email.com" class="bg-white/5 border border-white/10 rounded-2xl p-5 text-white placeholder-gray-600 mb-6 focus:outline-none focus:border-brand-green/50 focus:ring-1 focus:ring-brand-green/50 transition-all font-medium" />

                  <label class="text-gray-500 text-[10px] font-black ml-2 mb-2 uppercase tracking-widest">Mensagem</label>
                  <textarea rows="4" required maxlength="1000" placeholder="Como podemos ajudar?" class="bg-white/5 border border-white/10 rounded-2xl p-5 text-white placeholder-gray-600 mb-10 focus:outline-none focus:border-brand-green/50 focus:ring-1 focus:ring-brand-green/50 resize-none transition-all font-medium"></textarea>

                  <button type="submit" class="bg-brand-green text-black font-black text-xl py-5 rounded-2xl hover:bg-brand-green-hover transition-all shadow-xl shadow-brand-green/20 active:scale-95">
                      Enviar Mensagem
                  </button>
              </form>
          </div>
        </section>

      </main>
    </div>
  </div>
</template>