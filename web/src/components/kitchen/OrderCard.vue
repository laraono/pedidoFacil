<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { Clock, ChefHat, CheckCircle2, AlertTriangle, Hash, Flame } from 'lucide-vue-next';

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
  
  // Define atraso (ex: 15 minutos para teste, ajuste conforme necessário)
  isDelayed.value = diff > 900; 
};

onMounted(() => {
  updateTimer();
  timerInterval = setInterval(updateTimer, 1000);
});

onUnmounted(() => {
  clearInterval(timerInterval);
});

const statusTheme = computed(() => {
  // Prioridade Total para Atraso (exceto se já estiver pronto)
  if (isDelayed.value && props.order.status !== 'ready') {
    return {
      color: 'bg-red-600',
      border: 'border-red-600/50',
      bg: 'bg-red-950/20',
      label: 'CRÍTICO / ATRASADO',
      btn: 'bg-red-600 text-white shadow-red-900/40',
      barWidth: 'w-6'
    };
  }
  
  switch (props.order.status) {
    case 'pending': 
      return { color: 'bg-amber-500', border: 'border-white/5', bg: 'bg-zinc-900', label: 'PENDENTE', btn: 'bg-amber-500 text-black', barWidth: 'w-3' };
    case 'preparing': 
      return { color: 'bg-blue-600', border: 'border-white/5', bg: 'bg-zinc-900', label: 'PREPARO', btn: 'bg-blue-600 text-white', barWidth: 'w-3' };
    case 'ready': 
      return { color: 'bg-brand-green', border: 'border-white/5', bg: 'bg-zinc-900', label: 'PRONTO', btn: 'bg-brand-green text-black', barWidth: 'w-3' };
    default: 
      return { color: 'bg-zinc-700', border: 'border-white/5', bg: 'bg-zinc-900', label: 'INFO', btn: 'bg-zinc-700 text-white', barWidth: 'w-3' };
  }
});
</script>

<template>
  <div 
    class="w-full rounded-[1.2rem] flex overflow-hidden mb-5 transition-all duration-500 border"
    :class="[
      statusTheme.bg, 
      statusTheme.border,
      isDelayed && order.status !== 'ready' ? 'animate-emergency shadow-[0_0_30px_rgba(220,38,38,0.15)]' : 'shadow-2xl'
    ]"
  >
    <div 
      class="shrink-0 transition-all duration-300 flex items-center justify-center" 
      :class="[statusTheme.color, statusTheme.barWidth]"
    >
      <Flame v-if="isDelayed && order.status !== 'ready'" :size="16" class="text-white animate-bounce" />
    </div>

    <div class="flex-grow flex flex-col">
      <div class="p-4 flex justify-between items-center border-b border-white/5 bg-white/[0.02]">
        <div class="flex items-center gap-3">
          <span class="font-black text-2xl text-white tracking-tighter">#{{ order.id }}</span>
          <div class="flex flex-col">
            <span class="text-zinc-500 text-[9px] font-black uppercase tracking-[0.2em] leading-none">Mesa</span>
            <span class="text-zinc-200 font-black text-base uppercase italic leading-none">{{ order.mesa }}</span>
          </div>
        </div>
        
        <div 
          class="flex items-center gap-2 font-mono text-xl font-black px-4 py-1.5 rounded-xl border transition-colors"
          :class="isDelayed && order.status !== 'ready' 
            ? 'bg-red-600 text-white border-red-400' 
            : 'bg-black/40 text-zinc-300 border-white/5'"
        >
          <Clock :size="18" stroke-width="3" />
          {{ elapsedTime }}
        </div>
      </div>

      <div class="p-5 space-y-4">
        <div v-for="(item, index) in order.items" :key="index" class="flex flex-col border-b border-white/5 pb-3 last:border-0 last:pb-0">
          <div class="flex items-start gap-4">
            <span 
              class="font-black text-2xl min-w-[35px] transition-colors"
              :class="isDelayed && order.status !== 'ready' ? 'text-red-500' : 'text-brand-green'"
            >
              {{ item.amount }}x
            </span>
            <span class="font-black text-lg text-zinc-100 uppercase tracking-tight pt-0.5">{{ item.name }}</span>
          </div>
          
          <div v-if="item.obs" class="ml-12 mt-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center gap-2">
            <AlertTriangle :size="14" class="text-amber-500" />
            <p class="text-[11px] font-black text-amber-200 uppercase tracking-wider italic">
              {{ item.obs }}
            </p>
          </div>
        </div>
      </div>

      <div class="p-4 mt-auto">
        <button 
          v-if="order.status === 'pending'"
          @click="$emit('move', order.id, 'preparing')"
          class="w-full py-4 rounded-xl font-black uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-3 transition-all active:scale-95"
          :class="statusTheme.btn"
        >
          <ChefHat :size="18" stroke-width="3" /> Iniciar Agora
        </button>

        <button 
          v-if="order.status === 'preparing'"
          @click="$emit('move', order.id, 'ready')"
          class="w-full py-4 rounded-xl font-black uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-3 transition-all active:scale-95"
          :class="statusTheme.btn"
        >
          <CheckCircle2 :size="18" stroke-width="3" /> Concluir Preparo
        </button>

        <button 
          v-if="order.status === 'ready'"
          @click="$emit('finish', order.id)"
          class="w-full py-4 bg-zinc-800 hover:bg-zinc-700 text-white border border-white/10 rounded-xl font-black uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-3 transition-all"
        >
          Finalizar Entrega
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes emergency {
  0%, 100% { border-color: rgba(220, 38, 38, 0.5); background-color: rgba(69, 10, 10, 0.2); }
  50% { border-color: rgba(220, 38, 38, 0.8); background-color: rgba(69, 10, 10, 0.4); }
}

.animate-emergency {
  animation: emergency 1.5s ease-in-out infinite;
}

.animate-bounce {
  animation: bounce 1s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}
</style>