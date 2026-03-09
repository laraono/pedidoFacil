<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { ArrowLeft, CheckCircle, HelpCircle, Palette } from 'lucide-vue-next';
import localStorageService from '@/services/localStorageService';

const router = useRouter();
const authStore = useAuthStore();

const isLoading = ref(false);

const corFundo = ref(localStorageService.getBackgroundColors());
const corBotoes = ref(localStorageService.getButtonColors());
const corCategorias = ref(localStorageService.getCategoryColors());
const formasConsumo = ref([]);
const observacoesPermitidas = ref(true);

const savePersonalization = () => {
    console.log("oi")
    isLoading.value = true;
    
    authStore.setConfigStepComplete('menu'); 
    localStorageService.saveBackgroundColors(corFundo.value)
    localStorageService.saveButtonColors(corBotoes.value)
    localStorageService.saveCategoryColors(corCategorias.value)
    
    router.push('/app/dashboard');
};

const setCorFundo = (event) => {
    corFundo.value = event.target.value
}

const setCorBotoes = (event) => {
    corBotoes.value = event.target.value
}

const setCorCategorias = (event) => {
    corCategorias.value = event.target.value
}

</script>

<template>
  <main class="max-w-4xl mx-auto py-12 px-4 font-inter">
    
    <div class="flex items-center mb-8">
        <button @click="router.back()" class="p-2 text-gray-500 hover:text-gray-800 transition-colors mr-4">
            <ArrowLeft :size="30" />
        </button>
        <h1 class="text-3xl font-bold text-gray-800 flex items-center tracking-tight">
          Personalize seu Cardápio!
          <CheckCircle v-if="authStore.configStatus.menu" :size="24" class="text-green-500 ml-4" />
        </h1>
    </div>

      <form @submit.prevent="savePersonalization" class="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
          
          <div>
            <h2 class="text-2xl font-bold text-gray-800 mb-6">Identidade Visual</h2>
            
            <div class="mb-6">
              <label for="fundo" class="block text-gray-600 font-semibold mb-2">Cor de fundo:</label>
              <div class="flex items-center">
                  <input type="color" v-model="corFundo" class="w-10 h-10 p-0 border-none mr-3 cursor-pointer bg-transparent" @click="setCorFundo" />
                  <input type="text" id="fundo" v-model="corFundo"
                         placeholder="#0060A9" required maxlength="7" minlength="4"
                         class="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green text-gray-900 placeholder-gray-400 outline-none transition-all" />
                  <HelpCircle :size="18" class="text-gray-400 ml-2 cursor-pointer" title="Cor principal do cardápio" />
              </div>
            </div>

            <div class="mb-6">
              <label for="botoes" class="block text-gray-600 font-semibold mb-2">Cor dos botões:</label>
              <div class="flex items-center">
                  <input type="color" v-model="corBotoes" class="w-10 h-10 p-0 border-none mr-3 cursor-pointer bg-transparent" @click="setCorBotoes" />
                  <input type="text" id="botoes" v-model="corBotoes"
                         placeholder="#009DFF" required maxlength="7" minlength="4"
                         class="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green text-gray-900 placeholder-gray-400 outline-none transition-all" />
              </div>
            </div>

            <div class="mb-6">
              <label for="categorias" class="block text-gray-600 font-semibold mb-2">Cor das categorias:</label>
              <div class="flex items-center">
                  <input type="color" v-model="corCategorias" class="w-10 h-10 p-0 border-none mr-3 cursor-pointer bg-transparent" @click="setCorCategorias"/>
                  <input type="text" id="categorias" v-model="corCategorias"
                         placeholder="#009DFF" required maxlength="7" minlength="4"
                         class="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green text-gray-900 placeholder-gray-400 outline-none transition-all" />
              </div>
            </div>
            
            <div class="mt-8 p-5 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                <h3 class="font-bold text-gray-700 mb-4 flex items-center text-sm uppercase tracking-wider">
                  <Palette :size="18" class="mr-2 text-brand-green" /> 
                  Prévia do Cardápio
                </h3>
                <div class="flex justify-center p-4 rounded-xl shadow-inner transition-colors duration-300" :style="{ backgroundColor: corFundo }">
                    <button class="px-6 py-2 rounded-lg font-bold shadow-md transition-colors" :style="{ backgroundColor: corBotoes, color: '#fff' }">
                        Comprar Agora
                    </button>
                </div>
            </div>
          </div>

          <div>
            <h2 class="text-2xl font-bold text-gray-800 mb-6">Regras de Negócio</h2>

            <div class="mb-8">
              <p class="block text-gray-600 font-semibold mb-3">Formas de Consumo:</p>
              <div class="flex items-center mb-3 group cursor-pointer">
                <input type="checkbox" id="viagem" value="Para viagem" v-model="formasConsumo"
                       class="h-5 w-5 text-brand-green border-gray-300 rounded focus:ring-brand-green cursor-pointer" />
                <label for="viagem" class="ml-3 text-gray-700 font-medium cursor-pointer group-hover:text-gray-900">Para viagem</label>
              </div>
              <div class="flex items-center mb-3 group cursor-pointer">
                <input type="checkbox" id="local" value="Comer no local" v-model="formasConsumo"
                       class="h-5 w-5 text-brand-green border-gray-300 rounded focus:ring-brand-green cursor-pointer" />
                <label for="local" class="ml-3 text-gray-700 font-medium cursor-pointer group-hover:text-gray-900">Comer no local</label>
              </div>
            </div>

            <div class="mb-6">
              <p class="block text-gray-600 font-semibold mb-3">Observações no pedido:</p>
              <div class="flex items-center mb-3 group cursor-pointer">
                <input type="radio" id="permitir_obs" :value="true" v-model="observacoesPermitidas"
                       class="h-5 w-5 text-brand-green border-gray-300 focus:ring-brand-green cursor-pointer" />
                <label for="permitir_obs" class="ml-3 text-gray-700 font-medium cursor-pointer group-hover:text-gray-900">Permitir observações nos Pedidos</label>
              </div>
              <div class="flex items-center mb-3 group cursor-pointer">
                <input type="radio" id="nao_permitir_obs" :value="false" v-model="observacoesPermitidas"
                       class="h-5 w-5 text-brand-green border-gray-300 focus:ring-brand-green cursor-pointer" />
                <label for="nao_permitir_obs" class="ml-3 text-gray-700 font-medium cursor-pointer group-hover:text-gray-900">Bloquear observações</label>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-10 pt-6 border-t border-gray-100 flex justify-end">
          <button type="submit" :disabled="isLoading"
                  class="py-3 px-10 bg-brand-green text-black font-bold rounded-xl hover:bg-brand-green-hover transition-all active:scale-95 disabled:bg-gray-300 shadow-lg shadow-brand-green/20">
            {{ isLoading ? 'Salvando...' : 'Salvar Personalização' }}
          </button>
        </div>
      </form>
    </main>
</template>