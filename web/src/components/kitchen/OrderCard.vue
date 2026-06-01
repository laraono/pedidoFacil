<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { Clock, ChefHat, CheckCircle2, AlertTriangle, Hash, Flame, XCircle } from 'lucide-vue-next';
import localStorageService from '@/services/localStorageService';

const props = defineProps({
  order: { type: Object, required: true },
  alertMinutes: { type: Number, default: 15 }
});

const unitLabel = localStorageService.getComandaUnitLabel();
const isAutoatendimento = computed(() => props.order.source === 'totem' || (props.order.comanda || '').startsWith('Totem #'));

const emit = defineEmits(['move', 'cancel']);

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

  isDelayed.value = diff > props.alertMinutes * 60;
};

onMounted(() => {
  updateTimer();
  timerInterval = setInterval(updateTimer, 1000);
});

onUnmounted(() => {
  clearInterval(timerInterval);
});

const statusTheme = computed(() => {
  if(!props.order) return
  if (isDelayed.value && props.order.status !== 'ready') {
    return {
      color: 'bg-red-600',
      border: 'border-red-400',
      bg: 'bg-red-50',
      label: 'CRÍTICO / ATRASADO',
      btn: 'bg-red-600 text-white shadow-red-200',
      barWidth: 'w-6'
    };
  }

  switch (props.order.status) {
    case 'pending':
      return { color: 'bg-amber-500', border: 'border-[#E0E0E0]', bg: 'bg-white', label: 'PENDENTE', btn: 'bg-amber-500 text-white', barWidth: 'w-3' };
    case 'preparing':
      return { color: 'bg-blue-500', border: 'border-[#E0E0E0]', bg: 'bg-white', label: 'PREPARO', btn: 'bg-blue-500 text-white', barWidth: 'w-3' };
    case 'ready':
      return { color: 'bg-accent', border: 'border-[#E0E0E0]', bg: 'bg-white', label: 'PRONTO', btn: 'bg-primary text-white', barWidth: 'w-3' };
    default:
      return { color: 'bg-gray-400', border: 'border-[#E0E0E0]', bg: 'bg-white', label: 'INFO', btn: 'bg-gray-400 text-white', barWidth: 'w-3' };
  }
});

const groupedItems = computed(() => {
  if (!props.order || !props.order.items) return [];
  const groups = [];
  
  props.order.items.forEach(item => {
    const itemObs = (item.obs || item.observation || '').trim();
    const itemVar = (item.variationName || '').trim();

    const existing = groups.find(g => {
      const gObs = (g.obs || g.observation || '').trim();
      const gVar = (g.variationName || '').trim();
      
      return g.name === item.name && gVar === itemVar && gObs === itemObs;
    });

    const qty = Number(item.amount) || Number(item.quantity) || 1;

    if (existing) {
      existing.amount += qty; 
    } else {
      groups.push({ ...item, amount: qty }); 
    }
  });

  return groups;
});

</script>

<template>
  <div
    class="w-full rounded flex overflow-hidden mb-5 transition-all duration-500 border shadow-sm"
    :class="[
      statusTheme.bg,
      statusTheme.border,
      isDelayed && order.status !== 'ready' ? 'animate-emergency' : ''
    ]"
  >
    <div
      class="shrink-0 transition-all duration-300 flex items-center justify-center"
      :class="[statusTheme.color, statusTheme.barWidth]"
    >
      <Flame v-if="isDelayed && order.status !== 'ready'" :size="16" class="text-white animate-bounce" />
    </div>

    <div class="flex-grow flex flex-col">
      <div class="p-4 flex justify-between items-center border-b border-[#E0E0E0] bg-gray-50">
        <div class="flex items-center gap-3">
          <span class="font-black text-2xl text-[#212121] tracking-tighter">{{ order.id }}</span>
          <div class="flex flex-col">
            <span class="text-[9px] font-black uppercase tracking-[0.2em] leading-none"
              :class="isAutoatendimento ? 'text-blue-500' : 'text-[#757575]'">
              {{ isAutoatendimento ? 'Autoatendimento' : unitLabel }}
            </span>
            <span class="text-[#212121] font-black text-base uppercase italic leading-none">
              {{ isAutoatendimento && order.customerName ? order.customerName : order.comanda }}
            </span>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <div
            class="flex items-center gap-2 font-mono text-xl font-black px-4 py-1.5 rounded border transition-colors"
            :class="isDelayed && order.status !== 'ready'
              ? 'bg-red-600 text-white border-red-400'
              : 'bg-gray-100 text-[#212121] border-[#E0E0E0]'"
          >
            <Clock :size="18" stroke-width="3" />
            {{ elapsedTime }}
          </div>

          <!-- Cancel button -->
          <button
            v-if="order.status !== 'ready'"
            @click.stop="$emit('cancel', order.id)"
            class="p-2 rounded bg-danger-light border border-danger text-danger hover:bg-red-100 transition-all"
            title="Cancelar pedido"
          >
            <XCircle :size="16" stroke-width="2.5" />
          </button>
        </div>
      </div>

      <div class="p-5 space-y-4">
        <div v-for="(item, index) in groupedItems" :key="index" class="flex flex-col border-b border-[#E0E0E0] pb-3 last:border-0 last:pb-0">
          <div class="flex items-start gap-4">
            <span
              class="font-black text-2xl min-w-[35px] transition-colors"
              :class="isDelayed && order.status !== 'ready' ? 'text-red-500' : 'text-accent'"
            >
              {{ item.amount }}x
            </span>
            <div class="flex flex-col gap-1 pt-0.5">
              <span class="font-black text-lg text-[#212121] uppercase tracking-tight leading-none">{{ item.name }}</span>
              <span
                v-if="item.variationName"
                class="inline-block self-start px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-600 text-[11px] font-black uppercase tracking-wide"
              >
                {{ item.variationName }}
              </span>
            </div>
          </div>

          <div v-if="item.obs || item.observation" class="ml-12 mt-2 p-3 rounded bg-amber-50 border border-amber-200 flex items-center gap-2">
            <AlertTriangle :size="14" class="text-amber-500" />
            <p class="text-[11px] font-black text-amber-700 uppercase tracking-wider italic">
              {{ item.obs || item.observation }}
            </p>
          </div>
        </div>
      </div>

      <div class="p-4 mt-auto">
        <button
          v-if="order.status === 'pending'"
          @click="$emit('move', order.id, 'preparing')"
          class="w-full py-4 rounded font-black uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-3 transition-all active:scale-95"
          :class="statusTheme.btn"
        >
          <ChefHat :size="18" stroke-width="3" /> Iniciar Agora
        </button>

        <button
          v-if="order.status === 'preparing'"
          @click="$emit('move', order.id, 'ready')"
          class="w-full py-4 rounded font-black uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-3 transition-all active:scale-95"
          :class="statusTheme.btn"
        >
          <CheckCircle2 :size="18" stroke-width="3" /> Concluir Preparo
        </button>

        <button
          v-if="order.status === 'ready'"
          @click="$emit('move', order.id, 'finished')"
          class="w-full py-4 bg-gray-100 hover:bg-gray-200 text-[#212121] border border-[#E0E0E0] rounded font-black uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-3 transition-all"
        >
          Finalizar Entrega
        </button>

      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes emergency {
  0%, 100% { border-color: rgba(220, 38, 38, 0.5); background-color: #fff5f5; }
  50% { border-color: rgba(220, 38, 38, 0.8); background-color: #fee2e2; }
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