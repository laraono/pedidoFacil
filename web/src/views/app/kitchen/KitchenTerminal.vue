<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useKitchenStore } from '@/stores/kitchen';
import { PERMISSIONS } from '@/utils/permissions';
import OrderCard from '@/components/kitchen/OrderCard.vue';
import { Bell, Volume2, VolumeX, LogOut, UtensilsCrossed, List, ChefHat, CheckCircle } from 'lucide-vue-next';

const AUDIO_URL = 'https://codeskulptor-demos.commondatastorage.googleapis.com/GalaxyInvaders/pause.wav';
const audioPlayer = new Audio(AUDIO_URL);
const audioEnabled = ref(false);

const router = useRouter();
const authStore = useAuthStore();
const kitchenStore = useKitchenStore();

const activeTab = ref('pending'); // 'pending', 'preparing', 'ready'

onMounted(() => {
  if (!authStore.hasPermission(PERMISSIONS.COZINHA)) {
    alert('Acesso negado: Apenas cozinha.');
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
</script>

<template>
  <div class="h-screen bg-black flex flex-col font-inter overflow-hidden text-white">
    
    <header class="h-16 md:h-20 bg-zinc-900 border-b border-white/10 flex items-center justify-between px-6 md:px-8 shadow-2xl z-20 shrink-0">
      <div class="flex items-center gap-4">
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
        class="flex-1 flex-col min-w-0 md:min-w-[360px] bg-zinc-900/50 rounded-[2.5rem] border border-white/10 shadow-inner overflow-hidden transition-all"
        :class="activeTab === 'pending' ? 'flex' : 'hidden md:flex'"
      >
        <header class="p-6 flex justify-between items-center bg-white/[0.03] backdrop-blur-md z-10 border-b border-white/5">
          <div class="flex items-center gap-3">
             <div class="w-2 h-6 bg-yellow-500 rounded-full shadow-[0_0_15px_rgba(234,179,8,0.4)]"></div>
             <h2 class="font-black text-white text-sm uppercase tracking-widest">Pendente</h2>
          </div>
          <span class="bg-yellow-500 text-black font-black px-4 py-1 rounded-full text-xs">
            {{ kitchenStore.pendingOrders.length }}
          </span>
        </header>
        <div class="flex-grow p-4 overflow-y-auto custom-scrollbar space-y-4">
          <OrderCard v-for="order in kitchenStore.pendingOrders" :key="order.id" :order="order" @move="handleMove" />
          
          <div v-if="kitchenStore.pendingOrders.length === 0" class="flex flex-col items-center justify-center h-40 text-zinc-700">
             <Bell :size="48" class="mb-2 opacity-20" />
             <p class="text-[10px] font-black uppercase tracking-[0.2em]">Cozinha Limpa</p>
          </div>
        </div>
      </section>

      <section 
        class="flex-1 flex-col min-w-0 md:min-w-[360px] bg-zinc-900/50 rounded-[2.5rem] border border-white/10 shadow-inner overflow-hidden transition-all"
        :class="activeTab === 'preparing' ? 'flex' : 'hidden md:flex'"
      >
        <header class="p-6 flex justify-between items-center bg-white/[0.03] backdrop-blur-md z-10 border-b border-white/5">
          <div class="flex items-center gap-3">
             <div class="w-2 h-6 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.4)]"></div>
             <h2 class="font-black text-white text-sm uppercase tracking-widest">Preparo</h2>
          </div>
          <span class="bg-blue-600 text-white font-black px-4 py-1 rounded-full text-xs border border-blue-400/30">
            {{ kitchenStore.preparingOrders.length }}
          </span>
        </header>
        <div class="flex-grow p-4 overflow-y-auto custom-scrollbar space-y-4">
          <OrderCard v-for="order in kitchenStore.preparingOrders" :key="order.id" :order="order" @move="handleMove" />
        </div>
      </section>

      <section 
        class="flex-1 flex-col min-w-0 md:min-w-[360px] bg-zinc-900/50 rounded-[2.5rem] border border-white/10 shadow-inner overflow-hidden transition-all"
        :class="activeTab === 'ready' ? 'flex' : 'hidden md:flex'"
      >
        <header class="p-6 flex justify-between items-center bg-white/[0.03] backdrop-blur-md z-10 border-b border-white/5">
          <div class="flex items-center gap-3">
             <div class="w-2 h-6 bg-brand-green rounded-full shadow-[0_0_15px_rgba(0,255,159,0.4)]"></div>
             <h2 class="font-black text-white text-sm uppercase tracking-widest">Pronto</h2>
          </div>
          <span class="bg-brand-green text-black font-black px-4 py-1 rounded-full text-xs">
            {{ kitchenStore.readyOrders.length }}
          </span>
        </header>
        <div class="flex-grow p-4 overflow-y-auto custom-scrollbar space-y-4">
          <OrderCard v-for="order in kitchenStore.readyOrders" :key="order.id" :order="order" @finish="handleFinish" />
        </div>
      </section>

    </main>

    <nav class="fixed bottom-0 left-0 w-full bg-zinc-900 border-t border-white/5 shadow-2xl md:hidden z-50 px-8 py-3 pb-8 flex justify-between items-center">
        
        <button 
            @click="activeTab = 'pending'"
            class="flex flex-col items-center gap-1 p-2 transition-all relative"
            :class="activeTab === 'pending' ? 'text-yellow-500' : 'text-gray-600'"
        >
            <div class="relative">
                <List :size="24" stroke-width="3" />
                <span v-if="kitchenStore.pendingOrders.length > 0" class="absolute -top-2 -right-3 bg-yellow-500 text-black text-[10px] font-black px-1.5 py-0.5 rounded-full border-2 border-zinc-900">
                    {{ kitchenStore.pendingOrders.length }}
                </span>
            </div>
            <span class="text-[9px] font-black uppercase tracking-widest mt-1">Fila</span>
        </button>

        <button 
            @click="activeTab = 'preparing'"
            class="flex flex-col items-center gap-1 p-2 transition-all relative"
            :class="activeTab === 'preparing' ? 'text-blue-500' : 'text-gray-600'"
        >
            <div class="relative">
                <ChefHat :size="24" stroke-width="3" />
                <span v-if="kitchenStore.preparingOrders.length > 0" class="absolute -top-2 -right-3 bg-blue-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full border-2 border-zinc-900">
                    {{ kitchenStore.preparingOrders.length }}
                </span>
            </div>
            <span class="text-[9px] font-black uppercase tracking-widest mt-1">Preparo</span>
        </button>

        <button 
            @click="activeTab = 'ready'"
            class="flex flex-col items-center gap-1 p-2 transition-all relative"
            :class="activeTab === 'ready' ? 'text-brand-green' : 'text-gray-600'"
        >
            <div class="relative">
                <CheckCircle :size="24" stroke-width="3" />
                <span v-if="kitchenStore.readyOrders.length > 0" class="absolute -top-2 -right-3 bg-brand-green text-black text-[10px] font-black px-1.5 py-0.5 rounded-full border-2 border-zinc-900">
                    {{ kitchenStore.readyOrders.length }}
                </span>
            </div>
            <span class="text-[9px] font-black uppercase tracking-widest mt-1">Pronto</span>
        </button>
    </nav>

  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.1); }
</style>