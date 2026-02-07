<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { User, Menu, X } from 'lucide-vue-next';

import imgOndas from '@/assets/ondas.png';
import imgTotem from '@/assets/totem.png'; 
import imgGraficos from '@/assets/graficos.png';
import imgInterface from '@/assets/pedidos.png'; 

const router = useRouter();
const isMenuOpen = ref(false);

const navigateToPlans = () => { router.push('/planos'); };
const navigateToLogin = () => { router.push('/login'); };
const toggleMenu = () => { isMenuOpen.value = !isMenuOpen.value; };
</script>

<template>
  <div class="min-h-screen bg-black font-inter relative overflow-hidden">
    
    <div 
      class="absolute left-0 w-full z-0 pointer-events-none opacity-90 lg:top-[30%]"
      :style="{ backgroundImage: `url(${imgOndas})` }"
      style="
        height: 60vh; 
        top: 13%;
        background-size: 100% 100%; 
        background-repeat: no-repeat;
      "
    ></div>

    <div 
      class="absolute bottom-0 left-0 w-full z-0 pointer-events-none opacity-80"
      :style="{ backgroundImage: `url(${imgOndas})` }"
      style="
        height: 50vh; 
        background-size: 100% 100%; 
        background-repeat: no-repeat;
        transform: scaleX(-1); /* Inversão apenas horizontal */
      "
    ></div>

    <div class="relative z-10">
      
      <header class="flex justify-between items-center p-6 lg:px-0 lg:py-6 max-w-[1200px] mx-auto">
        
        <div class="flex-1 flex justify-start">
          <div class="hidden lg:block text-2xl font-bold text-[#00D26A]">PedidoFácil</div>
          <button @click="toggleMenu" class="lg:hidden p-1">
            <component :is="isMenuOpen ? X : Menu" class="w-8 h-8 text-[#00D26A]" />
          </button>
        </div>
        
        <div class="flex-[2] flex justify-center items-center">
          <nav class="hidden lg:flex space-x-10 text-base font-bold text-white">
            <a href="#sobre" class="hover:text-[#00D26A] transition-colors">Sobre</a>
            <a href="#planos" @click.prevent="navigateToPlans" class="hover:text-[#00D26A] transition-colors cursor-pointer">Planos</a>
            <a href="#contato" class="hover:text-[#00D26A] transition-colors">Contato</a>
          </nav>
          <div class="lg:hidden text-2xl font-bold text-[#00D26A]">PedidoFácil</div>
        </div>
        
        <div class="flex-1 flex justify-end">
          <a @click.prevent="navigateToLogin" class="flex items-center space-x-2 text-white font-semibold cursor-pointer hover:text-[#00D26A]">
            <span>Login</span>
            <User class="text-white" :size="20" />
          </a>
        </div>
      </header>

      <div v-if="isMenuOpen" class="lg:hidden bg-[#050F0D] border-b border-[#111] p-5 absolute w-full z-50">
        <a href="#sobre" @click="isMenuOpen = false" class="block py-4 border-b border-[#1A1A1A] text-white text-lg font-bold text-center">Sobre nós</a>
        <a href="#planos" @click="isMenuOpen = false" class="block py-4 border-b border-[#1A1A1A] text-white text-lg font-bold text-center">Planos</a>
        <a href="#contato" @click="isMenuOpen = false" class="block py-4 text-white text-lg font-bold text-center">Contato</a>
      </div>

      <main class="flex flex-col items-center pb-20">
        
        <section class="w-full max-w-[1200px] px-5 lg:px-0 pt-8 lg:pt-20 pb-20 flex flex-col lg:flex-row items-center justify-between gap-4 lg:gap-12">
          
          <div class="flex justify-center items-center flex-none lg:flex-1">
             <img :src="imgTotem" 
                  alt="Totem"
                  class="w-[130px] lg:w-[480px] h-auto object-contain transition-transform duration-500 hover:scale-105" 
             />
          </div>
          
          <div class="flex-1 flex flex-col items-start text-left w-full mt-8 lg:mt-0">
            <span class="text-[#00D26A] font-bold mb-1 lg:mb-2 text-lg lg:text-[54px] lg:leading-tight">PedidoFácil</span>
            
            <h1 class="text-white font-extrabold mb-8 text-2xl lg:text-[60px] lg:leading-[68px] text-left">
              Personalize a experiência do seu restaurante
            </h1>
            
            <p class="text-white mb-12 text-xs lg:text-[22px] lg:leading-[34px] max-w-full lg:max-w-[650px] text-left">
              Bem-vindo ao FoodSystem. Nossa plataforma é a <strong class="text-white">solução ideal</strong> para <strong class="text-white">restaurantes</strong> que querem <strong class="text-white">modernizar</strong> sua operação e <strong class="text-white">aumentar as vendas</strong>. Com ela, você tem acesso a <strong class="text-white">layouts prontos</strong> e <strong class="text-white">personalizáveis</strong> para criar seu <strong class="text-white">espaço digital completo</strong>.
            </p>
            
            <div class="flex flex-col lg:flex-row gap-3 w-full lg:w-auto">
              <button class="bg-[#00D26A] text-black font-bold py-3 lg:py-[18px] px-9 rounded-xl text-sm lg:text-lg hover:brightness-110 transition-all shadow-lg text-center">
                Começar agora
              </button>
            </div>
          </div>
        </section>

        <section class="w-full max-w-[1200px] px-5 lg:px-0 py-16 flex flex-col lg:flex-row justify-around items-center gap-12 lg:gap-0">
            <div class="flex flex-col items-center text-center">
              <span class="text-white text-lg font-bold mb-1">Diversos</span>
              <span class="text-white text-[56px] font-extrabold mb-2 leading-tight">Benefícios</span>
              <span class="text-white text-xl font-medium max-w-[250px]">Para Aproveitar</span>
            </div>
            
            <div class="flex flex-col items-center text-center">
              <span class="text-white text-lg font-bold mb-1">Sistema com</span>
              <span class="text-white text-[56px] font-extrabold mb-2 leading-tight">24h</span>
              <span class="text-white text-xl font-medium max-w-[250px]">de Monitoramento e suporte online</span>
            </div>
            
            <div class="flex flex-col items-center text-center">
              <span class="text-white text-lg font-bold mb-1">Até</span>
              <span class="text-white text-[56px] font-extrabold mb-2 leading-tight">50%</span>
              <span class="text-white text-xl font-medium max-w-[250px]">De desconto para novos usuários</span>
            </div>
        </section>

        <section class="w-full max-w-[1200px] px-5 lg:px-0 py-20 text-center">
          <h2 class="text-white text-[42px] font-bold mb-10 leading-tight">
            Otimize seu restaurante e aumente as vendas
          </h2>

          <p class="text-white text-xl leading-[30px] mb-10 max-w-[950px] mx-auto">
             Nosso sistema é mais do que apenas um menu online; é uma <strong class="text-white">plataforma completa para a gestão do seu restaurante</strong>. Com ele, você ganha eficiência, agilidade e lucratividade.
          </p>

          <div class="flex flex-col lg:flex-row gap-16 mt-5">
            <div class="flex-1">
              <p class="text-white text-xl leading-[30px]">
                <strong class="text-white text-[22px]">Reduza erros e otimize o tempo: </strong>
                Os pedidos feitos nos <strong class="text-white">totens, tablets ou no caixa</strong> são enviados diretamente e sem erros para a cozinha, eliminando a confusão de comandas de papel.
              </p>
            </div>
            <div class="flex-1">
              <p class="text-white text-xl leading-[30px]">
                <strong class="text-white text-[22px]">Tenha total controle: </strong>
                Altere preços, adicione ou remova produtos e personalize o cardápio em tempo real, de forma <strong class="text-white">simples e rápida</strong>.
              </p>
            </div>
          </div>
        </section>

        <section class="w-full max-w-[1200px] px-5 lg:px-0 py-20">
          <div class="flex flex-col lg:flex-row gap-12">
            
            <div class="flex-1 group">
               <h3 class="text-white text-[32px] font-bold mb-8 text-center group-hover:text-[#00D26A] transition-colors">Soluções Rápidas</h3>
               <div class="h-[300px] lg:h-[400px] w-full flex items-center justify-center rounded-xl bg-black/40 border border-transparent group-hover:border-[#00D26A]/30 transition-all shadow-2xl overflow-hidden">
                 <img :src="imgInterface" class="h-full w-full object-contain hover:scale-105 transition-transform duration-500" />
               </div>
            </div>

            <div class="flex-1 group">
               <h3 class="text-white text-[32px] font-bold mb-8 text-center group-hover:text-[#00D26A] transition-colors">Relatórios de Desempenho</h3>
               <div class="h-[300px] lg:h-[400px] w-full flex items-center justify-center rounded-xl bg-black/40 border border-transparent group-hover:border-[#00D26A]/30 transition-all shadow-2xl overflow-hidden">
                 <img :src="imgGraficos" class="h-full w-full object-contain hover:scale-105 transition-transform duration-500" />
               </div>
            </div>

          </div>
        </section>
        
        <section id="contato" class="w-full max-w-[650px] px-5 lg:px-0 mt-16 mb-24 text-center">
          <h2 class="text-white text-[42px] font-bold mb-12">Contato</h2>
          
          <div class="bg-white rounded-3xl p-8 lg:p-10 shadow-xl">
              <form class="flex flex-col text-left">
                  
                  <label class="text-[#333] font-bold text-lg mb-2 mt-2">Nome</label>
                  <input type="text" placeholder="Seu nome" class="bg-[#F5F5F5] border border-[#E0E0E0] rounded-xl p-4 text-lg text-[#333] placeholder-[#999] focus:outline-none focus:border-[#00D26A]" />

                  <label class="text-[#333] font-bold text-lg mb-2 mt-5">Email</label>
                  <input type="email" placeholder="Seu email" class="bg-[#F5F5F5] border border-[#E0E0E0] rounded-xl p-4 text-lg text-[#333] placeholder-[#999] focus:outline-none focus:border-[#00D26A]" />

                  <label class="text-[#333] font-bold text-lg mb-2 mt-5">Mensagem</label>
                  <textarea rows="5" placeholder="Sua mensagem" class="bg-[#F5F5F5] border border-[#E0E0E0] rounded-xl p-4 text-lg text-[#333] placeholder-[#999] focus:outline-none focus:border-[#00D26A] resize-none"></textarea>

                  <button type="submit" class="bg-[#333] text-white font-bold text-[22px] py-5 rounded-xl mt-12 hover:bg-black transition-colors shadow-lg">
                      Enviar
                  </button>
              </form>
          </div>
        </section>

      </main>
    </div>
  </div>
</template>