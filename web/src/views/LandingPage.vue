<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { User, Menu, X, Check } from 'lucide-vue-next';

import imgLogo from '@/assets/logo.png'; 
import imgOndas from '@/assets/ondas.png';
import imgTotem from '@/assets/totem.png'; 
import imgGraficos from '@/assets/graficos.png';
import imgInterface from '@/assets/pedidos.png'; 

const router = useRouter();
const isMenuOpen = ref(false);

const navigateToLogin = () => { router.push('/login'); };
const toggleMenu = () => { isMenuOpen.value = !isMenuOpen.value; };

const navigateToRegister = () => {
  router.push('/register'); 
};

const scrollToPlans = () => {
  const element = document.getElementById('planos');
  if (element) element.scrollIntoView({ behavior: 'smooth' });
};
</script>

<template>
  <div class="min-h-screen bg-black font-inter relative overflow-hidden">
    
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
            <component :is="isMenuOpen ? X : Menu" class="w-7 h-7 text-[#00D26A]" />
          </button>
        </div>
        
        <div class="flex-[2] flex justify-center items-center hidden lg:flex">
          <nav class="space-x-10 text-lg font-bold text-white">
            <a href="#sobre" class="hover:text-[#00D26A] transition-colors">Sobre</a>
            <a href="#planos" class="hover:text-[#00D26A] transition-colors cursor-pointer">Planos</a>
            <a href="#contato" class="hover:text-[#00D26A] transition-colors">Contato</a>
          </nav>
        </div>
        
        <div class="flex-1 flex justify-end hidden lg:flex">
          <a @click.prevent="navigateToLogin" class="flex items-center space-x-2 text-white font-semibold text-lg cursor-pointer hover:text-[#00D26A]">
            <span>Login</span>
            <User class="text-white" :size="24" />
          </a>
        </div>
      </header>

      <div v-if="isMenuOpen" class="lg:hidden bg-[#050F0D]/95 backdrop-blur-md border-b border-[#111] p-5 absolute top-[60px] left-0 w-full z-40 shadow-2xl">
        <a href="#sobre" @click="isMenuOpen = false" class="block py-4 border-b border-[#1A1A1A] text-white text-base font-bold text-center">Sobre nós</a>
        <a href="#planos" @click="isMenuOpen = false; scrollToPlans()" class="block py-4 border-b border-[#1A1A1A] text-white text-base font-bold text-center">Planos</a>
        <a href="#contato" @click="isMenuOpen = false" class="block py-4 border-b border-[#1A1A1A] text-white text-base font-bold text-center">Contato</a>
         <a @click="navigateToLogin" class="block py-4 text-[#00D26A] text-base font-bold text-center flex justify-center items-center gap-2 cursor-pointer hover:bg-[#00D26A]/10 rounded-lg mt-2">
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
            <p class="text-gray-200 mb-6 lg:mb-12 text-[11px] lg:text-[22px] leading-normal lg:leading-[34px] max-w-full lg:max-w-[650px]">
              Bem-vindo ao PedidoFácil. Nossa plataforma é a <strong class="text-[#00D26A]">solução ideal</strong> para <strong class="text-white">restaurantes</strong> que querem <strong class="text-white">modernizar</strong> sua operação e <strong class="text-[#00D26A]">aumentar as vendas</strong>.
            </p>
            
            <div class="flex flex-col lg:flex-row gap-3 w-full lg:w-auto">
              <button @click="scrollToPlans" class="bg-[#00D26A] text-black font-bold py-2 px-5 lg:py-4 lg:px-12 rounded-lg lg:rounded-xl text-xs lg:text-lg hover:bg-[#00b058] transition-all shadow-[0_0_20px_rgba(0,210,106,0.3)] w-auto transform hover:-translate-y-1">
                Ver Planos e Começar
              </button>
            </div>
          </div>
        </section>

        <section class="w-full max-w-[1200px] px-5 lg:px-0 py-16 flex flex-col lg:flex-row justify-around items-center gap-12 lg:gap-0 bg-white/5 rounded-3xl backdrop-blur-sm border border-white/10 mx-5 lg:mx-0">
            <div class="flex flex-col items-center text-center">
              <span class="text-gray-400 text-lg font-bold mb-1">Diversos</span>
              <span class="text-[#00D26A] text-[56px] font-extrabold mb-2 leading-tight">Benefícios</span>
              <span class="text-white text-xl font-medium max-w-[250px]">Para Aproveitar</span>
            </div>
            <div class="hidden lg:block w-px h-24 bg-gray-700"></div>
            <div class="flex flex-col items-center text-center">
              <span class="text-gray-400 text-lg font-bold mb-1">Maior</span>
              <span class="text-[#00D26A] text-[56px] font-extrabold mb-2 leading-tight">Praticidade</span>
              <span class="text-white text-xl font-medium max-w-[250px]">Com os pedidos</span>
            </div>
            <div class="hidden lg:block w-px h-24 bg-gray-700"></div>
            <div class="flex flex-col items-center text-center">
              <span class="text-gray-400 text-lg font-bold mb-1">Gestão</span>
              <span class="text-[#00D26A] text-[56px] font-extrabold mb-2 leading-tight">Fácil</span>
              <span class="text-white text-xl font-medium max-w-[250px]">De onde você estiver</span>
            </div>
        </section>

        <section id="sobre" class="w-full max-w-[1200px] px-5 lg:px-0 py-24 text-center">
          <h2 class="text-white text-3xl lg:text-[42px] font-bold mb-10 leading-tight">
            Otimize seu restaurante e aumente as vendas
          </h2>

          <div class="text-gray-300 text-lg lg:text-xl leading-[30px] mb-16 max-w-[800px] mx-auto space-y-6">
            <p>Uma <strong class="text-[#00D26A]">plataforma completa para a gestão do seu restaurante</strong>.</p>
          </div>

          <div class="flex flex-col lg:flex-row gap-8 justify-center items-stretch mt-5">
            
            <div class="flex-1 bg-[#111] py-12 px-6 rounded-3xl border border-gray-800 hover:border-[#00D26A] transition-all duration-300 group max-w-[320px] mx-auto flex flex-col items-center h-full hover:shadow-[0_0_30px_rgba(0,210,106,0.1)]">
              <h3 class="text-[#00D26A] text-2xl lg:text-3xl font-bold mb-6 group-hover:scale-105 transition-transform">
                Reduza erros e otimize o tempo
              </h3>
              <p class="text-white text-base lg:text-lg leading-relaxed flex-grow mb-8">
                Os pedidos feitos nos <strong class="font-bold">totens, tablets ou no caixa</strong> são enviados diretamente e sem erros para a cozinha, eliminando a confusão de comandas de papel.
              </p>
              <div class="p-4 bg-gray-900 rounded-full group-hover:bg-[#00D26A]/10 transition-colors mt-auto">
                 <Check class="w-8 h-8 text-[#00D26A]" />
              </div>
            </div>

            <div class="flex-1 bg-[#111] py-12 px-6 rounded-3xl border border-gray-800 hover:border-[#00D26A] transition-all duration-300 group max-w-[320px] mx-auto flex flex-col items-center h-full hover:shadow-[0_0_30px_rgba(0,210,106,0.1)]">
              <h3 class="text-[#00D26A] text-2xl lg:text-3xl font-bold mb-6 group-hover:scale-105 transition-transform">
                Tenha total controle
              </h3>
              <p class="text-white text-base lg:text-lg leading-relaxed flex-grow mb-8">
                Altere preços, adicione ou remova produtos e personalize o cardápio em tempo real, de forma <strong class="font-bold">simples e rápida</strong>, direto do painel administrativo.
              </p>
              <div class="p-4 bg-gray-900 rounded-full group-hover:bg-[#00D26A]/10 transition-colors mt-auto">
                 <Check class="w-8 h-8 text-[#00D26A]" />
              </div>
            </div>

          </div>
        </section>

        <section class="w-full max-w-[1200px] px-5 lg:px-0 py-20">
          <div class="flex flex-col lg:flex-row gap-16 items-center">
            <div class="flex-1 group w-full">
               <h3 class="text-white text-2xl lg:text-[32px] font-bold mb-8 text-center group-hover:text-[#00D26A] transition-colors">Soluções Rápidas</h3>
               <div class="w-full flex items-center justify-center rounded-xl bg-transparent overflow-hidden">
                 <img :src="imgInterface" class="w-full h-auto object-contain hover:scale-105 transition-transform duration-500 max-h-[400px]" />
               </div>
            </div>
            <div class="flex-1 group w-full">
               <h3 class="text-white text-2xl lg:text-[32px] font-bold mb-8 text-center group-hover:text-[#00D26A] transition-colors">Relatórios de Desempenho</h3>
               <div class="w-full flex items-center justify-center rounded-xl bg-transparent overflow-hidden">
                 <img :src="imgGraficos" class="w-full h-auto object-contain hover:scale-105 transition-transform duration-500 max-h-[400px]" />
               </div>
            </div>
          </div>
        </section>

        <section id="planos" class="w-full max-w-[1000px] px-5 lg:px-0 py-24 text-center">
           <h2 class="text-white text-3xl lg:text-[42px] font-bold mb-16">Escolha seu plano</h2>
           
           <div class="flex flex-col lg:flex-row gap-8 justify-center items-stretch">
              
              <div class="flex-1 bg-[#111] px-8 py-12 rounded-[32px] border border-gray-800 flex flex-col items-center hover:border-[#00D26A] transition-all max-w-md mx-auto w-full h-full hover:shadow-[0_0_40px_rgba(0,0,0,0.5)]">
                 <h3 class="text-[#00D26A] text-3xl font-bold mb-4">Mensal</h3>
                 <div class="text-white text-5xl lg:text-6xl font-bold mb-2">R$79,90<span class="text-xl font-normal text-gray-500">/mês</span></div>
                 
                 <div class="w-full h-px bg-gray-800 my-8"></div>

                 <div class="flex flex-col gap-5 mb-10 w-full px-2 text-left">
                    <div class="flex items-center gap-4 text-gray-300"><Check class="text-[#00D26A] w-6 h-6 flex-shrink-0" /> Suporte ao Usuário</div>
                    <div class="flex items-center gap-4 text-gray-300"><Check class="text-[#00D26A] w-6 h-6 flex-shrink-0" /> Relatórios de Desempenho</div>
                    <div class="flex items-center gap-4 text-gray-300"><Check class="text-[#00D26A] w-6 h-6 flex-shrink-0" /> Automação do Sistema</div>
                    
                    <div class="flex items-center gap-4 text-transparent opacity-0 select-none">
                      <Check class="w-6 h-6 flex-shrink-0" /> Maior Estabilidade
                    </div>
                 </div>

                 <button @click="navigateToRegister" class="bg-white text-black font-extrabold py-5 px-12 rounded-xl w-full hover:bg-gray-200 transition-colors mt-auto text-lg">
                    Confirmar
                 </button>
              </div>

              <div class="flex-1 bg-[#111] px-8 py-12 rounded-[32px] border-2 border-[#00D26A]/30 flex flex-col items-center hover:border-[#00D26A] transition-all max-w-md mx-auto w-full h-full hover:shadow-[0_0_40px_rgba(0,210,106,0.1)] relative">
                 
                 <div class="absolute top-0 right-0 bg-[#00D26A] text-black font-bold text-xs px-4 py-2 rounded-bl-xl rounded-tr-[30px]">RECOMENDADO</div>

                 <h3 class="text-[#00D26A] text-3xl font-bold mb-4">Anual</h3>
                 <div class="text-white text-5xl lg:text-6xl font-bold mb-2">R$49,90<span class="text-xl font-normal text-gray-500">/mês</span></div>
                 
                 <div class="w-full h-px bg-gray-800 my-8"></div>

                 <div class="flex flex-col gap-5 mb-10 w-full px-2 text-left">
                    <div class="flex items-center gap-4 text-gray-300"><Check class="text-[#00D26A] w-6 h-6 flex-shrink-0" /> Suporte ao Usuário</div>
                    <div class="flex items-center gap-4 text-gray-300"><Check class="text-[#00D26A] w-6 h-6 flex-shrink-0" /> Relatórios de Desempenho</div>
                    <div class="flex items-center gap-4 text-gray-300"><Check class="text-[#00D26A] w-6 h-6 flex-shrink-0" /> Automação do Sistema</div>
                    <div class="flex items-center gap-4 text-white font-bold"><Check class="text-[#00D26A] w-6 h-6 flex-shrink-0" /> Maior Estabilidade</div>
                 </div>

                 <button @click="navigateToRegister" class="bg-white text-black font-extrabold py-5 px-12 rounded-xl w-full hover:bg-gray-200 transition-colors mt-auto text-lg">
                    Confirmar
                 </button>
              </div>

           </div>
        </section>
        
        <section id="contato" class="w-full max-w-[650px] px-5 lg:px-0 mt-20 mb-32 text-center">
          <h2 class="text-white text-3xl lg:text-[42px] font-bold mb-12">Fale Conosco</h2>
          
          <div class="bg-[#1A1A1A] rounded-[32px] p-8 lg:p-12 shadow-2xl border border-gray-800">
              <form class="flex flex-col text-left">
                  <h3 class="text-[#00D26A] text-xl font-bold mb-8 text-center uppercase tracking-wider">Envie uma mensagem</h3>
                  
                  <label class="text-gray-400 text-sm font-bold ml-1 mb-2">SEU NOME</label>
                  <input type="text" placeholder="Ex: João Silva" class="bg-[#2C2C2E] border border-gray-700 rounded-xl p-5 text-white placeholder-gray-500 mb-6 focus:outline-none focus:border-[#00D26A] focus:ring-1 focus:ring-[#00D26A] transition-all" />

                  <label class="text-gray-400 text-sm font-bold ml-1 mb-2">SEU EMAIL</label>
                  <input type="email" placeholder="Ex: contato@email.com" class="bg-[#2C2C2E] border border-gray-700 rounded-xl p-5 text-white placeholder-gray-500 mb-6 focus:outline-none focus:border-[#00D26A] focus:ring-1 focus:ring-[#00D26A] transition-all" />

                  <label class="text-gray-400 text-sm font-bold ml-1 mb-2">MENSAGEM</label>
                  <textarea rows="5" placeholder="Como podemos ajudar?" class="bg-[#2C2C2E] border border-gray-700 rounded-xl p-5 text-white placeholder-gray-500 mb-8 focus:outline-none focus:border-[#00D26A] focus:ring-1 focus:ring-[#00D26A] resize-none transition-all"></textarea>

                  <button type="submit" class="bg-[#00D26A] text-white font-extrabold text-xl py-5 rounded-xl hover:bg-[#00b058] transition-all shadow-lg hover:shadow-[0_0_20px_rgba(0,210,106,0.4)]">
                      Enviar
                  </button>
              </form>
          </div>
        </section>

      </main>
    </div>
  </div>
</template>


