<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { ArrowLeft, CheckCircle, HelpCircle, Palette } from 'lucide-vue-next';

const router = useRouter();
const authStore = useAuthStore();

const isLoading = ref(false);

// Simulação de valores padrão
const defaultColors = {
    Cor_Fundo: '#0060A9',
    Cor_Botoes: '#009DFF',
    Cor_Categorias: '#009DFF'
};

// Dados do Formulário
const corFundo = ref(defaultColors.Cor_Fundo);
const corBotoes = ref(defaultColors.Cor_Botoes);
const corCategorias = ref(defaultColors.Cor_Categorias);
const formasConsumo = ref([]);
const observacoesPermitidas = ref(true);

// Funções
const savePersonalization = () => {
    isLoading.value = true;
    
    // LÓGICA DE BYPASS: Simula a chamada e sucesso no frontend
    
    // 1. Marca o passo 'menu' como concluído na Auth Store
    authStore.setConfigStepComplete('menu'); 
    
    // 2. Redireciona para o Dashboard
    router.push('/app/dashboard');
};
</script>

<template>
  <main class="max-w-4xl mx-auto py-12 px-4">
    
    <div class="flex items-center mb-8">
        <button @click="router.back()" class="p-2 text-gray-500 hover:text-gray-800 transition-colors mr-4">
            <ArrowLeft :size="30" />
        </button>
        <h1 class="text-3xl font-bold text-gray-800 flex items-center">
          Personalize seu Cardápio!
          <!-- Ícone de Check se o passo estiver completo -->
          <CheckCircle v-if="authStore.configStatus.menu" :size="24" class="text-green-500 ml-4" />
        </h1>
    </div>

      <form @submit.prevent="savePersonalization" class="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
          
          <!-- Coluna 1: Personalização de Cores -->
          <div>
            <h2 class="text-2xl font-bold text-gray-800 mb-6">Cardápio</h2>
            
            <div class="mb-6">
              <label for="fundo" class="block text-gray-600 font-semibold mb-2">Cor de fundo:</label>
              <div class="flex items-center">
                  <input type="color" v-model="corFundo" class="w-10 h-10 p-0 border-none mr-3" />
                  <input type="text" id="fundo" v-model="corFundo"
                         placeholder="#0060A9" required maxlength="7"
                         class="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500" />
                  <HelpCircle :size="18" class="text-gray-400 ml-2 cursor-pointer" title="Cor principal do cardápio" />
              </div>
            </div>

            <div class="mb-6">
              <label for="botoes" class="block text-gray-600 font-semibold mb-2">Cor dos botões:</label>
              <div class="flex items-center">
                  <input type="color" v-model="corBotoes" class="w-10 h-10 p-0 border-none mr-3" />
                  <input type="text" id="botoes" v-model="corBotoes"
                         placeholder="#009DFF" required maxlength="7"
                         class="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500" />
              </div>
            </div>

            <div class="mb-6">
              <label for="categorias" class="block text-gray-600 font-semibold mb-2">Cor das categorias:</label>
              <div class="flex items-center">
                  <input type="color" v-model="corCategorias" class="w-10 h-10 p-0 border-none mr-3" />
                  <input type="text" id="categorias" v-model="corCategorias"
                         placeholder="#009DFF" required maxlength="7"
                         class="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500" />
                  <HelpCircle :size="18" class="text-gray-400 ml-2 cursor-pointer" title="Cor dos botões de categoria no menu" />
              </div>
            </div>
            
            <div class="mt-8 p-4 bg-gray-100 rounded-lg">
                <h3 class="font-bold text-gray-800 mb-3 flex items-center"><Palette :size="20" class="mr-2 text-blue-600" /> Exemplo de Personalização</h3>
                <div class="flex justify-center p-2 rounded-lg" :style="{ backgroundColor: corFundo, color: corBotoes }">
                    <span class="text-sm font-semibold">Exemplo de Título</span>
                </div>
            </div>
          </div>

          <!-- Coluna 2: Configurações de Pedido -->
          <div>
            <h2 class="text-2xl font-bold text-gray-800 mb-6">Pedido</h2>

            <div class="mb-8">
              <p class="block text-gray-600 font-semibold mb-3">Formas de Consumo:</p>
              <div class="flex items-center mb-2">
                <input type="checkbox" id="viagem" value="Para viagem" v-model="formasConsumo"
                       class="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                <label for="viagem" class="ml-3 text-gray-700">Para viagem</label>
              </div>
              <div class="flex items-center mb-2">
                <input type="checkbox" id="local" value="Comer no local" v-model="formasConsumo"
                       class="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                <label for="local" class="ml-3 text-gray-700">Comer no local</label>
              </div>
            </div>

            <div class="mb-6">
              <p class="block text-gray-600 font-semibold mb-3">Observações no pedido:</p>
              <div class="flex items-center mb-2">
                <input type="radio" id="permitir_obs" :value="true" v-model="observacoesPermitidas"
                       class="h-5 w-5 text-blue-600 border-gray-300 focus:ring-blue-500" />
                <label for="permitir_obs" class="ml-3 text-gray-700">Permitir observações nos Pedidos</label>
              </div>
              <div class="flex items-center mb-2">
                <input type="radio" id="nao_permitir_obs" :value="false" v-model="observacoesPermitidas"
                       class="h-5 w-5 text-blue-600 border-gray-300 focus:ring-blue-500" />
                <label for="nao_permitir_obs" class="ml-3 text-gray-700">Não permitir observações nos Pedidos</label>
              </div>
            </div>
          </div>
        </div>

        <!-- Botão de Ação -->
        <div class="mt-8 pt-6 border-t border-gray-200">
          <button type="submit" :disabled="isLoading"
                  class="py-3 px-8 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400">
            {{ isLoading ? 'Salvando...' : 'Salvar Personalização' }}
          </button>
        </div>
      </form>
    </main>
</template>