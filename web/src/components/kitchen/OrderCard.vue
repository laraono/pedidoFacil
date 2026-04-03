<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { Clock, ChefHat, CheckCircle2, AlertTriangle, Hash, Flame, XCircle } from 'lucide-vue-next';

const props = defineProps({
  order: { type: Object, required: true },
  alertMinutes: { type: Number, default: 15 }
});

const emit = defineEmits(['move', 'cancel']);

const elapsedTime = ref('00:00');
const isDelayed = ref(false);
let timerInterval = null;

const updateTimer = () => {
  const now = new Date();
  const start = new Date(props.order.created_at);
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
  // Priority for delayed orders (except if ready)
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
    case 'Agurdando_Preparo':
      return { color: 'bg-amber-500', border: 'border-[#E0E0E0]', bg: 'bg-white', label: 'PENDENTE', btn: 'bg-amber-500 text-white', barWidth: 'w-3' };
    case 'Em_Preparo':
      return { color: 'bg-blue-500', border: 'border-[#E0E0E0]', bg: 'bg-white', label: 'PREPARO', btn: 'bg-blue-500 text-white', barWidth: 'w-3' };
    case 'Pronto':
      return { color: 'bg-accent', border: 'border-[#E0E0E0]', bg: 'bg-white', label: 'PRONTO', btn: 'bg-primary text-white', barWidth: 'w-3' };
    default:
      return { color: 'bg-gray-400', border: 'border-[#E0E0E0]', bg: 'bg-white', label: 'INFO', btn: 'bg-gray-400 text-white', barWidth: 'w-3' };
  }
});

</script>

<template>
  <div
    class="w-full rounded flex overflow-hidden mb-5 transition-all duration-500 border shadow-sm"
    :class="[
      statusTheme.bg,
      statusTheme.border,
      isDelayed && order.status !== 'Pronto' ? 'animate-emergency' : ''
    ]"
  >
    <div
      class="shrink-0 transition-all duration-300 flex items-center justify-center"
      :class="[statusTheme.color, statusTheme.barWidth]"
    >
      <Flame v-if="isDelayed && order.status !== 'Pronto'" :size="16" class="text-white animate-bounce" />
    </div>

    <div class="flex-grow flex flex-col">
      <div class="p-4 flex justify-between items-center border-b border-[#E0E0E0] bg-gray-50">
        <div class="flex items-center gap-3">
          <span class="font-black text-2xl text-[#212121] tracking-tighter">#{{ order.id }}</span>
          <div class="flex flex-col">
            <span class="text-[#757575] text-[9px] font-black uppercase tracking-[0.2em] leading-none">Comanda</span>
            <span class="text-[#212121] font-black text-base uppercase italic leading-none">{{ order.comanda.description }}</span>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <div
            class="flex items-center gap-2 font-mono text-xl font-black px-4 py-1.5 rounded border transition-colors"
            :class="isDelayed && order.status !== 'Pronto'
              ? 'bg-red-600 text-white border-red-400'
              : 'bg-gray-100 text-[#212121] border-[#E0E0E0]'"
          >
            <Clock :size="18" stroke-width="3" />
            {{ elapsedTime }}
          </div>

          <!-- Cancel button -->
          <button
            v-if="order.status !== 'Pronto'"
            @click.stop="$emit('cancel', order.id, order.comanda.id)"
            class="p-2 rounded bg-danger-light border border-danger text-danger hover:bg-red-100 transition-all"
            title="Cancelar pedido"
          >
            <XCircle :size="16" stroke-width="2.5" />
          </button>
        </div>
      </div>

      <div class="p-5 space-y-4">
        <div v-for="(item, index) in order.productOrders" :key="index" class="flex flex-col border-b border-[#E0E0E0] pb-3 last:border-0 last:pb-0">
          <div class="flex items-start gap-4">
            <span
              class="font-black text-2xl min-w-[35px] transition-colors"
              :class="isDelayed && order.status !== 'ready' ? 'text-red-500' : 'text-accent'"
            >
              {{ item.quantity }}x
            </span>
            <span class="font-black text-lg text-[#212121] uppercase tracking-tight pt-0.5">{{ item.product.name }}</span>
          </div>

          <div v-if="item.observation" class="ml-12 mt-2 p-3 rounded bg-amber-50 border border-amber-200 flex items-center gap-2">
            <AlertTriangle :size="14" class="text-amber-500" />
            <p class="text-[11px] font-black text-amber-700 uppercase tracking-wider italic">
              {{ item.observation }}
            </p>
          </div>
        </div>
      </div>

      <div class="p-4 mt-auto">
        <button
          v-if="order.status === 'Aguardando_Preparo'"
          @click="$emit('move', order.comanda.id, order.id, 'Em_Preparo')"
          class="w-full py-4 rounded font-black uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-3 transition-all active:scale-95"
          :class="statusTheme.btn"
        >
          <ChefHat :size="18" stroke-width="3" /> Iniciar Agora
        </button>

        <button
          v-if="order.status === 'Em_Preparo'"
          @click="$emit('move', order.comanda.id, order.id, 'Pronto')"
          class="w-full py-4 rounded font-black uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-3 transition-all active:scale-95"
          :class="statusTheme.btn"
        >
          <CheckCircle2 :size="18" stroke-width="3" /> Concluir Preparo
        </button>

        <button
          v-if="order.status === 'Pronto'"
          @click="$emit('move', order.comanda.id, order.id, 'Finalizado')"
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
