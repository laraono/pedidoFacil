<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useKitchenStore } from '@/stores/kitchen';
import { PERMISSIONS } from '@/utils/permissions';
import OrderCard from '@/components/kitchen/OrderCard.vue';
import SubscriptionGuard from '@/components/SubscriptionGuard.vue';
import { Bell, Volume2, VolumeX, UtensilsCrossed, List, ChefHat, CheckCircle, XCircle, X, ArrowLeft, Settings, Clock } from 'lucide-vue-next';

const AUDIO_URL = 'https://codeskulptor-demos.commondatastorage.googleapis.com/GalaxyInvaders/pause.wav';
const audioPlayer = new Audio(AUDIO_URL);
const audioEnabled = ref(false);

const router = useRouter();
const authStore = useAuthStore();
const kitchenStore = useKitchenStore();

const activeTab = ref('pending');
const showTimerSettings = ref(false);
const alertMinutes = ref(Number(localStorage.getItem('kitchenAlertMinutes') || 15));

const saveAlertMinutes = () => {
  const val = Math.max(1, Math.min(120, alertMinutes.value));
  alertMinutes.value = val;
  localStorage.setItem('kitchenAlertMinutes', String(val));
  showTimerSettings.value = false;
};

onMounted(() => {
  if (!authStore.hasPermission(PERMISSIONS.COZINHA)) {
    router.push('/app/dashboard');
  }
});

const toggleAudio = () => {
  audioEnabled.value = !audioEnabled.value;
  if (audioEnabled.value) audioPlayer.play().catch(() => {});
};

const playAlert = () => {
  if (audioEnabled.value) {
    audioPlayer.currentTime = 0;
    audioPlayer.play().catch(e => console.error(e));
  }
};

const simulateSocketEvent = () => {
  const hasNew = kitchenStore.incomingOrderMock();
  if (hasNew) playAlert();
};

const handleMove = (id, status) => kitchenStore.moveOrder(id, status);
const handleFinish = (id) => kitchenStore.finishOrder(id);

const cancelTargetId = ref(null);
const cancelReason = ref('');

const openCancelModal = (id) => {
  cancelTargetId.value = id;
  cancelReason.value = '';
};

const confirmCancel = () => {
  if (!cancelReason.value.trim()) return;
  kitchenStore.finishOrder(cancelTargetId.value);
  cancelTargetId.value = null;
  cancelReason.value = '';
};

const dismissCancelModal = () => {
  cancelTargetId.value = null;
  cancelReason.value = '';
};

const columns = [
  { key: 'pending', label: 'Pendente', color: 'yellow', badgeClass: 'bg-yellow-500 text-black' },
  { key: 'preparing', label: 'Preparo', color: 'blue', badgeClass: 'bg-blue-600 text-white border border-blue-400/30' },
  { key: 'ready', label: 'Pronto', color: 'brand-green', badgeClass: 'bg-brand-green text-black' },
];

const columnOrders = (key) => {
  if (key === 'pending') return kitchenStore.pendingOrders;
  if (key === 'preparing') return kitchenStore.preparingOrders;
  return kitchenStore.readyOrders;
};

const indicatorColor = (color) => {
  if (color === 'yellow') return 'bg-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.4)]';
  if (color === 'blue') return 'bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.4)]';
  return 'bg-brand-green shadow-[0_0_15px_rgba(0,255,159,0.4)]';
};
</script>

<template>
  <SubscriptionGuard featureName="A Cozinha">
  <div class="h-screen bg-black flex flex-col font-inter overflow-hidden text-white">
    
    <header class="h-16 md:h-20 bg-zinc-900 border-b border-white/10 flex items-center justify-between px-6 md:px-8 shadow-2xl z-20 shrink-0">
      <div class="flex items-center gap-3">
        <button @click="router.push('/app/dashboard')" class="p-2 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white transition-colors" title="Voltar ao Dashboard">
          <ArrowLeft :size="18" />
        </button>
        <div class="bg-brand-green p-2 rounded-xl text-black shadow-lg shadow-brand-green/20">
          <UtensilsCrossed :size="20" class="md:w-6 md:h-6" />
        </div>
        <div>
          <h1 class="text-white font-black text-lg tracking-tight leading-none uppercase">Fila de Pedidos</h1>
          <p class="text-gray-500 text-[10px] uppercase font-black tracking-widest mt-1">Monitor de Produção</p>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <button
          @click="simulateSocketEvent"
          class="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-xs font-black uppercase tracking-widest transition-all border border-white/5 flex items-center gap-2"
        >
          <Bell :size="14" /> <span class="hidden md:inline">Simular Entrada</span>
        </button>

        <!-- Timer settings -->
        <div class="relative">
          <button
            @click="showTimerSettings = !showTimerSettings"
            class="p-2.5 rounded-xl transition-all border bg-white/5 text-gray-400 border-white/10 hover:text-white hover:bg-white/10"
            title="Configurar alerta de tempo"
          >
            <Clock :size="18" />
          </button>
          <div v-if="showTimerSettings" class="absolute right-0 top-12 z-50 bg-zinc-900 border border-white/10 rounded-2xl p-5 shadow-2xl w-64">
            <p class="text-xs font-black uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-2">
              <Clock :size="12" /> Alerta de atraso
            </p>
            <div class="flex items-center gap-3">
              <input
                v-model.number="alertMinutes"
                type="number" min="1" max="120"
                class="flex-1 bg-zinc-800 border border-white/10 rounded-xl px-3 py-2 text-white text-sm font-black text-center outline-none focus:border-brand-green/50"
              />
              <span class="text-gray-400 text-sm font-bold">min</span>
            </div>
            <p class="text-gray-600 text-[10px] mt-2">Pedido fica vermelho após este tempo</p>
            <button @click="saveAlertMinutes" class="w-full mt-3 py-2 bg-brand-green text-black text-xs font-black uppercase rounded-xl hover:bg-brand-green/80 transition-colors">
              Salvar
            </button>
          </div>
        </div>

        <button
          @click="toggleAudio"
          class="p-2.5 rounded-xl transition-all border"
          :class="audioEnabled ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'"
        >
          <Volume2 v-if="audioEnabled" :size="18" />
          <VolumeX v-else :size="18" />
        </button>
      </div>
    </header>

    <main class="flex-grow flex flex-col md:flex-row p-4 md:p-8 gap-6 overflow-hidden pb-24 md:pb-8 bg-black">
      
      <section
        v-for="col in columns"
        :key="col.key"
        class="flex-1 flex-col min-w-0 md:min-w-[360px] bg-zinc-900/50 rounded-[2.5rem] border border-white/10 shadow-inner overflow-hidden transition-all"
        :class="activeTab === col.key ? 'flex' : 'hidden md:flex'"
      >
        <header class="p-6 flex justify-between items-center bg-white/[0.03] backdrop-blur-md z-10 border-b border-white/5">
          <div class="flex items-center gap-3">
            <div class="w-2 h-6 rounded-full" :class="indicatorColor(col.color)"></div>
            <h2 class="font-black text-white text-sm uppercase tracking-widest">{{ col.label }}</h2>
          </div>
          <span class="font-black px-4 py-1 rounded-full text-xs" :class="col.badgeClass">
            {{ columnOrders(col.key).length }}
          </span>
        </header>

        <div class="flex-grow p-4 overflow-y-auto custom-scrollbar space-y-4">
          <OrderCard
            v-for="order in columnOrders(col.key)"
            :key="order.id"
            :order="order"
            :alertMinutes="alertMinutes"
            @move="handleMove"
            @finish="handleFinish"
            @cancel="openCancelModal"
          />
          
          <div v-if="columnOrders(col.key).length === 0" class="flex flex-col items-center justify-center h-40 text-zinc-700">
            <Bell :size="48" class="mb-2 opacity-20" />
            <p class="text-[10px] font-black uppercase tracking-[0.2em]">Cozinha Limpa</p>
          </div>
        </div>
      </section>

    </main>

    <nav class="fixed bottom-0 left-0 w-full bg-zinc-900 border-t border-white/5 shadow-2xl md:hidden z-50 px-8 py-3 pb-8 flex justify-between items-center">
      
      <button @click="activeTab = 'pending'" class="flex flex-col items-center gap-1 p-2 transition-all relative" :class="activeTab === 'pending' ? 'text-yellow-500' : 'text-gray-600'">
        <div class="relative">
          <List :size="24" stroke-width="3" />
          <span v-if="kitchenStore.pendingOrders.length > 0" class="absolute -top-2 -right-3 bg-yellow-500 text-black text-[10px] font-black px-1.5 py-0.5 rounded-full border-2 border-zinc-900">
            {{ kitchenStore.pendingOrders.length }}
          </span>
        </div>
        <span class="text-[9px] font-black uppercase tracking-widest mt-1">Fila</span>
      </button>

      <button @click="activeTab = 'preparing'" class="flex flex-col items-center gap-1 p-2 transition-all relative" :class="activeTab === 'preparing' ? 'text-blue-500' : 'text-gray-600'">
        <div class="relative">
          <ChefHat :size="24" stroke-width="3" />
          <span v-if="kitchenStore.preparingOrders.length > 0" class="absolute -top-2 -right-3 bg-blue-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full border-2 border-zinc-900">
            {{ kitchenStore.preparingOrders.length }}
          </span>
        </div>
        <span class="text-[9px] font-black uppercase tracking-widest mt-1">Preparo</span>
      </button>

      <button @click="activeTab = 'ready'" class="flex flex-col items-center gap-1 p-2 transition-all relative" :class="activeTab === 'ready' ? 'text-brand-green' : 'text-gray-600'">
        <div class="relative">
          <CheckCircle :size="24" stroke-width="3" />
          <span v-if="kitchenStore.readyOrders.length > 0" class="absolute -top-2 -right-3 bg-brand-green text-black text-[10px] font-black px-1.5 py-0.5 rounded-full border-2 border-zinc-900">
            {{ kitchenStore.readyOrders.length }}
          </span>
        </div>
        <span class="text-[9px] font-black uppercase tracking-widest mt-1">Pronto</span>
      </button>
    </nav>

  <!-- Modal de cancelamento da cozinha -->
  <div v-if="cancelTargetId !== null" class="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-[200]">
    <div class="bg-zinc-900 border border-red-500/20 rounded-[2rem] p-8 w-full max-w-md shadow-2xl">
      <div class="flex items-start gap-4 mb-6">
        <div class="p-3 bg-red-500/10 rounded-2xl border border-red-500/20 shrink-0">
          <XCircle :size="22" class="text-red-400" />
        </div>
        <div>
          <p class="text-white font-black text-base mb-1">Cancelar Pedido</p>
          <p class="text-gray-400 text-sm leading-relaxed">Informe o motivo do cancelamento. Esse pedido será removido da fila.</p>
        </div>
      </div>

      <select
        v-model="cancelReason"
        class="w-full bg-zinc-800 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white outline-none focus:border-red-500/40 mb-6 cursor-pointer"
      >
        <option value="" disabled>Selecione o motivo...</option>
        <option value="Demora no preparo">Demora no preparo</option>
        <option value="Pedido errado / Erro do Garçom">Pedido errado / Erro do Garçom</option>
        <option value="Desistência / Cliente foi embora">Desistência / Cliente foi embora</option>
      </select>

      <div class="flex gap-3">
        <button
          @click="dismissCancelModal"
          class="flex-1 px-6 py-3 bg-white/5 border border-white/10 text-gray-400 font-black uppercase tracking-widest text-xs rounded-xl hover:bg-white/10 transition-all"
        >
          Voltar
        </button>
        <button
          @click="confirmCancel"
          :disabled="!cancelReason.trim()"
          class="flex-1 px-6 py-3 bg-red-500 text-white font-black uppercase tracking-widest text-xs rounded-xl hover:bg-red-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Confirmar Cancelamento
        </button>
      </div>
    </div>
  </div>

  </div>
  </SubscriptionGuard>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.1); }
</style>
