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
    return 'border-red-500 bg-red-100';
  }
  
  switch (props.order.status) {
    case 'pending': return 'border-yellow-400 bg-yellow-100';
    case 'preparing': return 'border-blue-500 bg-blue-100';
    case 'ready': return 'border-green-500 bg-green-100';
    default: return 'border-gray-400 bg-gray-100';
  }
});

const timerClass = computed(() => {
  if (isDelayed.value && props.order.status !== 'ready') return 'text-red-700 font-black animate-pulse bg-red-200 px-2 py-0.5 rounded';
  return 'text-gray-700 font-medium';
});
</script>

<template>
  <div 
    class="w-full rounded-2xl border border-l-8 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden mb-4"
    :class="cardStyles"
  >
    
    <div class="p-4 flex justify-between items-start border-b border-black/10">
      <div>
        <h3 class="font-bold text-xl text-gray-800">#{{ order.id }} - {{ order.mesa }}</h3>
        <span class="text-sm text-gray-800 font-semibold bg-white/80 px-2 py-0.5 rounded-full mt-1 inline-block border border-black/5">
          Garçom: {{ order.garcom }}
        </span>
      </div>
      
      <div class="flex items-center gap-1.5 bg-white/80 px-2 py-1 rounded-lg border border-black/5 shadow-sm" :class="timerClass">
        <Clock :size="16" />
        <span class="font-mono text-lg">{{ elapsedTime }}</span>
      </div>
    </div>

    <div class="p-5 flex-grow space-y-4">
      <div v-for="(item, index) in order.items" :key="index" class="flex flex-col border-b border-dashed border-black/10 pb-3 last:border-0 last:pb-0">
        
        <div class="flex items-start gap-3">
          <span class="font-black text-lg text-gray-900 min-w-[24px]">{{ item.qtd }}x</span>
          <span class="font-semibold text-lg text-gray-900 leading-tight">{{ item.name }}</span>
        </div>
        
        <p v-if="item.obs" class="ml-9 mt-1 text-sm font-bold text-yellow-800 bg-yellow-200/80 px-3 py-1 rounded-lg border border-yellow-300/50 inline-block self-start">
          ⚠️ {{ item.obs }}
        </p>
      </div>
    </div>

    <div class="p-3 bg-white/50 mt-auto border-t border-black/10">
      
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
        class="w-full py-3 bg-brand-green hover:bg-brand-green-hover active:scale-[0.98] text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand-green/30"
      >
        <CheckCircle2 :size="20" /> Pedido Pronto
      </button>

      <button 
        v-if="order.status === 'ready'"
        @click="$emit('finish', order.id)"
        class="w-full py-3 bg-white hover:bg-gray-50 text-gray-700 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors border border-gray-300 shadow-sm"
      >
        Entregue / Arquivar
      </button>

    </div>
  </div>
</template>