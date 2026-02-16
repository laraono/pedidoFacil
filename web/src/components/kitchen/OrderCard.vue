<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { Clock, ChefHat, CheckCircle2 } from 'lucide-vue-next';

const props = defineProps({
  order: { type: Object, required: true }
});

const emit = defineEmits(['move', 'finish']);

const elapsedTime = ref('00:00');
const isDelayed = ref(false);
let timerInterval = null;

const updateTimer = () => {
  const now = new Date();
  const start = new Date(props.order.createdAt);
  const diff = Math.floor((now - start) / 1000); 

  const h = Math.floor(diff / 3600).toString().padStart(2, '0');
  const m = Math.floor((diff % 3600) / 60).toString().padStart(2, '0');
  const s = (diff % 60).toString().padStart(2, '0');

  elapsedTime.value = h > 0 ? `${h}:${m}:${s}` : `${m}:${s}`;
  
  isDelayed.value = diff > 1200; 
};

onMounted(() => {
  updateTimer();
  timerInterval = setInterval(updateTimer, 1000);
});

onUnmounted(() => {
  clearInterval(timerInterval);
});

const cardStyles = computed(() => {
  if (isDelayed.value && props.order.status !== 'ready') {
    return 'border-red-500 bg-red-50';
  }
  
  switch (props.order.status) {
    case 'pending': return 'border-yellow-400 bg-white';
    case 'preparing': return 'border-blue-500 bg-white';
    case 'ready': return 'border-green-500 bg-white';
    default: return 'border-gray-300 bg-white';
  }
});

// Cor do Timer
const timerClass = computed(() => {
  if (isDelayed.value && props.order.status !== 'ready') return 'text-red-600 font-black animate-pulse bg-red-100 px-2 py-0.5 rounded';
  return 'text-gray-500 font-medium';
});
</script>

<template>
  <div 
    class="w-full rounded-2xl border-l-8 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden mb-4 border border-gray-100"
    :class="cardStyles"
  >
    
    <div class="p-4 flex justify-between items-start border-b border-gray-100">
      <div>
        <h3 class="font-bold text-xl text-gray-800">#{{ order.id }} - {{ order.mesa }}</h3>
        <span class="text-sm text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded-full mt-1 inline-block">
          Garçom: {{ order.garcom }}
        </span>
      </div>
      
      <div class="flex items-center gap-1.5" :class="timerClass">
        <Clock :size="16" />
        <span class="font-mono text-lg">{{ elapsedTime }}</span>
      </div>
    </div>

    <div class="p-5 flex-grow space-y-4">
      <div v-for="(item, index) in order.items" :key="index" class="flex flex-col border-b border-dashed border-gray-200 pb-3 last:border-0 last:pb-0">
        
        <div class="flex items-start gap-3">
          <span class="font-black text-lg text-gray-900 min-w-[24px]">{{ item.qtd }}x</span>
          <span class="font-semibold text-lg text-gray-700 leading-tight">{{ item.name }}</span>
        </div>
        
        <p v-if="item.obs" class="ml-9 mt-1 text-sm font-bold text-yellow-700 bg-yellow-50 px-3 py-1 rounded-lg border border-yellow-100 inline-block self-start">
          ⚠️ {{ item.obs }}
        </p>
      </div>
    </div>

    <div class="p-3 bg-gray-50/50 mt-auto border-t border-gray-100">
      
      <button 
        v-if="order.status === 'pending'"
        @click="$emit('move', order.id, 'preparing')"
        class="w-full py-3 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-blue-200 shadow-lg"
      >
        <ChefHat :size="20" /> Iniciar Preparo
      </button>

      <button 
        v-if="order.status === 'preparing'"
        @click="$emit('move', order.id, 'ready')"
        class="w-full py-3 bg-[#00D26A] hover:bg-[#00b058] active:scale-[0.98] text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-green-200 shadow-lg"
      >
        <CheckCircle2 :size="20" /> Pedido Pronto
      </button>

      <button 
        v-if="order.status === 'ready'"
        @click="$emit('finish', order.id)"
        class="w-full py-3 bg-gray-200 hover:bg-gray-300 text-gray-600 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
      >
        Entregue / Arquivar
      </button>

    </div>
  </div>
</template>