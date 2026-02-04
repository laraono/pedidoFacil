<script setup>
import { computed } from 'vue';

const props = defineProps({
  isVisible: {
    type: Boolean,
    required: true
  },
  plan: {
    type: Object,
    default: () => ({ name: '', price: '', description: '' })
  }
});

// O emit é definido aqui para o evento 'confirm'
const emit = defineEmits(['close', 'confirm']);

const formattedPrice = computed(() => {
  if (!props.plan.price) return '';
  return `R$${props.plan.price.replace('.', ',')}`;
});

const closeModal = () => {
  emit('close');
};

// ESSA FUNÇÃO CHAMA O EVENTO 'confirm'
const confirmPlan = () => {
  emit('confirm', props.plan.name);
};
</script>

<template>
  <!-- Overlay (Fundo semi-transparente) -->
  <div v-if="isVisible" 
       class="fixed inset-0 bg-black bg-opacity-70 z-40 flex items-center justify-center"
       @click.self="closeModal"
  >
    <!-- Modal Card (O bloco branco) -->
    <div class="bg-white text-black p-8 rounded-xl shadow-2xl w-full max-w-md mx-4 transform transition-all duration-300">
      
      <!-- Conteúdo do Modal -->
      <div class="text-center">
        <h2 class="text-5xl font-black mb-4">Plano {{ plan.name }}</h2>
        
        <p class="text-3xl font-bold text-gray-800 mb-6">{{ formattedPrice }}</p>
        
        <div class="text-gray-600 mb-8 max-w-xs mx-auto">
          <p class="mb-2 font-semibold">Descrição do produto</p>
          <p class="text-sm">
            {{ plan.description }}
          </p>
        </div>

        <!-- Botão de Confirmação que dispara o evento 'confirm' -->
        <button 
          @click="confirmPlan"
          class="w-full py-3 bg-[#00A444] text-white text-xl font-bold rounded-lg hover:bg-[#00D431] transition-colors duration-300 shadow-md"
        >
          Confirmar
        </button>
      </div>
    </div>
  </div>
</template>