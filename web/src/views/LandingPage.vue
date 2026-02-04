<script setup>
import { useRouter } from 'vue-router';
// Importação de ícones Lucide
import { User, Mail, Instagram, Phone, Menu } from 'lucide-vue-next';

const router = useRouter();

// URLs de Assets (Certifique-se que estas URLs existam na sua pasta public/assets)
const BG_WAVES_URL = '/assets/bg-waves.png';
const MOCKUP_TOTEM_URL = '/assets/image 3.png';
const MOCKUP_CHARTS_URL = '/assets/image 8.png';
const MOCKUP_KDS_URL = '/assets/image 9.png'; 

// Funções de Navegação
const navigateToPlans = () => {
  router.push('/planos');
};
const navigateToLogin = () => {
  router.push('/login');
};

const COLOR_PRIMARY = 'text-[#00ff6a]'; 
const COLOR_TEXT = 'text-[#eaeaea]'; 
</script>

<template>
  <div class="min-h-screen bg-black font-inter relative overflow-hidden">
    
    <!-- Imagem de Fundo (Ondas) -->
    <div 
      class="absolute inset-0 z-0 opacity-10 md:opacity-15" 
      :style="{ backgroundImage: `url(${BG_WAVES_URL})` }"
      style="background-size: cover; background-position: center;"
    ></div>
    <!-- Overlay Escuro -->
    <div class="absolute inset-0 z-10 bg-black/70"></div>
    
    <!-- 1. HEADER/Navegação -->
    <header class="relative z-20 flex justify-between items-center p-6 md:p-10 border-b border-gray-800">
      <div class="text-4xl font-bold" :class="COLOR_PRIMARY">FoodSystem</div>
      
      <!-- Navegação Desktop -->
      <nav class="hidden lg:flex space-x-12 text-xl font-bold" :class="COLOR_TEXT">
        <a href="#sobre" class="hover:text-white transition-colors">Sobre</a>
        <a href="#planos" @click.prevent="navigateToPlans" class="hover:text-white transition-colors cursor-pointer">Planos</a>
        <a href="#contato" class="hover:text-white transition-colors">Contato</a>
        <a @click.prevent="navigateToLogin" class="flex items-center space-x-2 hover:text-white transition-colors cursor-pointer">
          <span>Login</span>
          <User :color="COLOR_TEXT.replace('text-', '#')" :size="24" />
        </a>
      </nav>
      
      <!-- Menu Hambúrguer para Mobile -->
      <button class="lg:hidden p-2 rounded-md hover:bg-gray-800 transition-colors">
        <Menu class="w-8 h-8" :color="COLOR_TEXT.replace('text-', '#')" />
      </button>
    </header>

    <!-- Conteúdo Principal -->
    <main class="relative z-20 pt-16 pb-24 md:pt-32 px-6">
      
      <!-- Seção 1: HERO - LAYOUT INVERTIDO (AUMENTADO) -->
      <section class="max-w-7xl mx-auto flex flex-col lg:flex-row items-center lg:justify-between mb-40">
        
        <!-- Bloco 1: Mockup do Totem (ESQUERDA - AUMENTADO) -->
        <div class="lg:w-1/2 order-1 lg:order-1 flex justify-center lg:justify-start mb-12 lg:mb-0">
            <img :src="MOCKUP_TOTEM_URL" 
                 alt="Mockup do Totem de Autoatendimento"
                 class="w-[350px] md:w-[550px] h-auto rounded-3xl shadow-2xl object-cover" 
                 onerror="this.onerror=null;this.src='https://placehold.co/550x800/333/999?text=Totem+Mockup';" 
            />
        </div>
        
        <!-- Bloco 2: Textos e Call to Action (DIREITA - AUMENTADO) -->
        <div class="lg:w-1/2 order-2 lg:order-2 mt-12 lg:mt-0 text-center lg:text-left lg:pl-10">
          <div class="text-6xl font-bold mb-4" :class="COLOR_PRIMARY">
            FoodSystem
          </div>
          
          <h1 class="text-5xl md:text-7xl font-bold mb-8 leading-tight" :class="COLOR_TEXT">
            Personalize a experiência do seu restaurante
          </h1>
          
          <p class="text-xl md:text-2xl font-regular leading-relaxed mb-12" :class="COLOR_TEXT">
            Bem-vindo ao FoodSystem. Nossa plataforma é a 
            <strong class="font-bold">solução ideal</strong> para <strong class="font-bold">restaurantes</strong> que querem <strong class="font-bold">modernizar</strong> sua operação e <strong class="font-bold">aumentar as vendas.</strong>
          </p>
          
          <button 
            @click="navigateToPlans"
            class="bg-[#00a444] text-white font-bold py-4 px-12 rounded-full text-xl shadow-lg transition-all hover:bg-[#00d431] transform hover:scale-105"
          >
            Ver Planos e Começar
          </button>
        </div>
      </section>

      <!-- Seção 2: ESTATÍSTICAS -->
      <section class="max-w-7xl mx-auto mb-40 text-center">
        <h2 class="text-4xl font-bold mb-16" :class="COLOR_TEXT">Nossos Resultados Falam por Nós</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-12">
            
            <!-- Cliente Ativos -->
            <div class="p-8 rounded-xl bg-white/5 backdrop-blur-sm border border-gray-700">
                <div class="text-7xl font-bold mb-2" :class="COLOR_TEXT">Mais de 10000</div>
                <div class="text-3xl font-bold" :class="COLOR_TEXT">Clientes ativos</div>
            </div>
            
            <!-- Avaliações Positivas -->
            <div class="p-8 rounded-xl bg-white/5 backdrop-blur-sm border border-gray-700">
                <div class="text-7xl font-bold mb-2" :class="COLOR_TEXT">Mais de 7000</div>
                <div class="text-3xl font-bold" :class="COLOR_TEXT">Avaliações positivas</div>
            </div>
            
            <!-- Desconto -->
            <div class="p-8 rounded-xl bg-white/5 backdrop-blur-sm border border-gray-700">
                <div class="text-7xl font-bold mb-2" :class="COLOR_TEXT">Até 60%</div>
                <p class="text-3xl font-bold" :class="COLOR_TEXT">
                    De desconto para novos usuários
                </p>
            </div>
        </div>
      </section>

      <!-- Seção 3: SOBRE e FUNCIONALIDADES (Mockups DIMINUIDOS) -->
      <section id="sobre" class="max-w-7xl mx-auto mb-40 text-left">
        
        <h2 class="text-4xl font-bold mb-12 text-center" :class="COLOR_TEXT">
          Otimize seu restaurante e aumente as vendas
        </h2>

        <!-- Texto Central -->
        <div class="max-w-4xl mx-auto text-lg leading-relaxed text-gray-400 mb-16">
          <p class="mb-4">
            Nosso sistema é mais do que apenas um menu online; é uma 
            <strong class="font-bold text-white">plataforma completa para a gestão do seu restaurante.</strong>
            Com ele, você ganha eficiência, agilidade e lucratividade.
          </p>
          <p class="mb-4">
            <strong class="font-bold text-white">Reduza erros e otimize o tempo:</strong> Os pedidos feitos nos 
            <strong class="font-bold text-white">totens, tablets ou no caixa</strong> são enviados diretamente e sem erros para a cozinha, eliminando a confusão de comandas de papel. 
          </p>
          <p>
            <strong class="font-bold text-white">Tenha total controle:</strong> Altere preços, adicione ou remova produtos e personalize o cardápio em tempo real, de forma simples e rápida.
          </p>
        </div>

        <!-- Imagens de Funcionalidades (KDS e Relatórios) - DIMINUIDOS AQUI -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 max-w-4xl mx-auto">
            
            <!-- Soluções Rápidas (Mockup KDS) -->
            <div class="text-center">
                <h3 class="text-2xl font-bold mb-4" :class="COLOR_TEXT">Soluções Rápidas</h3>
                <img :src="MOCKUP_KDS_URL" 
                     alt="Mockup de Pedidos Prontos (KDS)"
                     class="w-full h-auto rounded-xl shadow-xl border border-gray-700 max-w-md mx-auto"
                     onerror="this.onerror=null;this.src='https://placehold.co/400x280/1A1A1A/00ff6a?text=Pedidos+Prontos+Mockup';" 
                />
            </div>

            <!-- Relatórios de Desempenho (Mockup Charts) -->
            <div class="text-center">
                <h3 class="text-2xl font-bold mb-4" :class="COLOR_TEXT">Relatórios de Desempenho</h3>
                <img :src="MOCKUP_CHARTS_URL" 
                     alt="Mockup de Gráficos e Relatórios"
                     class="w-full h-auto rounded-xl shadow-xl border border-gray-700 max-w-md mx-auto"
                     onerror="this.onerror=null;this.src='https://placehold.co/400x280/1A1A1A/00ff6a?text=Gráficos+e+Estatísticas';" 
                />
            </div>
        </div>
        
      </section>
      
      <!-- Seção 4: Contato -->
      <section id="contato" class="max-w-4xl mx-auto text-center">
        <h2 class="text-4xl font-bold mb-10" :class="COLOR_TEXT">Fale Conosco</h2>
        
        <div class="bg-[#1A1A1A] p-8 rounded-xl shadow-xl border border-gray-700">
            <h3 class="text-2xl font-semibold mb-6" :class="COLOR_PRIMARY">Envie uma mensagem</h3>
            <form class="space-y-4">
                <input type="text" placeholder="Seu Nome" class="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-700 placeholder-gray-500" />
                <input type="email" placeholder="Seu Email" class="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-700 placeholder-gray-500" />
                <textarea placeholder="Sua Mensagem" rows="4" class="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-700 placeholder-gray-500"></textarea>
                <button type="submit" class="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors">
                    Enviar
                </button>
            </form>
        </div>

        <div class="flex justify-center space-x-12 mt-12" :class="COLOR_TEXT">
            <a href="#" class="hover:text-[#00ff6a] transition-colors"><Instagram :size="32" /></a>
            <a href="#" class="hover:text-[#00ff6a] transition-colors"><Phone :size="32" /></a>
            <a href="#" class="hover:text-[#00ff6a] transition-colors"><Mail :size="32" /></a>
        </div>
      </section>

    </main>
  </div>
</template>