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
  <div class="h-screen bg-gray-50 flex flex-col font-inter overflow-hidden">
    
    <header class="h-16 md:h-20 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-8 shadow-sm z-20 shrink-0">
      <div class="flex items-center gap-3 md:gap-4">
        <div class="bg-[#00D26A] p-1.5 md:p-2 rounded-xl text-white shadow-lg shadow-green-200">
             <UtensilsCrossed :size="20" class="md:w-6 md:h-6" />
        </div>
      </div>

      <div class="flex items-center gap-2 md:gap-4">
        <button 
          @click="simulateSocketEvent" 
          class="px-3 py-2 md:px-5 md:py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs md:text-sm font-bold transition-colors flex items-center gap-2"
        >
          <Bell :size="16" /> <span class="hidden md:inline">Simular</span>
        </button>

        <button 
          @click="toggleAudio" 
          class="p-2 md:p-2.5 rounded-xl transition-colors border"
          :class="audioEnabled ? 'bg-green-50 text-green-600 border-green-200' : 'bg-red-50 text-red-500 border-red-200'"
        >
          <Volume2 v-if="audioEnabled" :size="18" class="md:w-5 md:h-5" />
          <VolumeX v-else :size="18" class="md:w-5 md:h-5" />
        </button>
        
        <button 
          @click="router.push('/app/dashboard')" 
          class="p-2 text-gray-400 hover:text-red-500 transition-colors"
        >
            <LogOut :size="20"/>
        </button>
      </div>
    </header>

    <main class="flex-grow flex flex-col md:flex-row p-4 md:p-6 gap-4 md:gap-6 overflow-hidden pb-24 md:pb-6">
      
      <section 
        class="flex-1 flex-col min-w-0 md:min-w-[360px] bg-gray-100/50 rounded-2xl md:rounded-[2rem] border border-gray-200/60 shadow-inner overflow-hidden"
        :class="activeTab === 'pending' ? 'flex' : 'hidden md:flex'"
      >
        <header class="p-4 md:p-5 flex justify-between items-center bg-gray-100/50 backdrop-blur-sm z-10 border-b border-gray-200/50">
          <div class="flex items-center gap-3">
             <div class="w-2 md:w-3 h-6 md:h-8 bg-yellow-400 rounded-full"></div>
             <h2 class="font-extrabold text-gray-700 text-base md:text-lg uppercase tracking-wide">Pendente</h2>
          </div>
          <span class="bg-yellow-400 text-yellow-900 font-bold px-3 py-1 rounded-full text-sm shadow-sm">
            {{ kitchenStore.pendingOrders.length }}
          </span>
        </header>
        <div class="flex-grow p-3 md:p-4 overflow-y-auto custom-scrollbar">
          <OrderCard v-for="order in kitchenStore.pendingOrders" :key="order.id" :order="order" @move="handleMove" />
          
          <div v-if="kitchenStore.pendingOrders.length === 0" class="flex flex-col items-center justify-center h-40 text-gray-400 opacity-60">
             <Bell :size="48" class="mb-2" />
             <p>Sem pedidos</p>
          </div>
        </div>
      </section>

      <section 
        class="flex-1 flex-col min-w-0 md:min-w-[360px] bg-gray-100/50 rounded-2xl md:rounded-[2rem] border border-gray-200/60 shadow-inner overflow-hidden"
        :class="activeTab === 'preparing' ? 'flex' : 'hidden md:flex'"
      >
        <header class="p-4 md:p-5 flex justify-between items-center bg-gray-100/50 backdrop-blur-sm z-10 border-b border-gray-200/50">
          <div class="flex items-center gap-3">
             <div class="w-2 md:w-3 h-6 md:h-8 bg-blue-500 rounded-full"></div>
             <h2 class="font-extrabold text-gray-700 text-base md:text-lg uppercase tracking-wide">Preparando</h2>
          </div>
          <span class="bg-blue-500 text-white font-bold px-3 py-1 rounded-full text-sm shadow-sm shadow-blue-200">
            {{ kitchenStore.preparingOrders.length }}
          </span>
        </header>
        <div class="flex-grow p-3 md:p-4 overflow-y-auto custom-scrollbar">
          <OrderCard v-for="order in kitchenStore.preparingOrders" :key="order.id" :order="order" @move="handleMove" />
        </div>
      </section>

      <section 
        class="flex-1 flex-col min-w-0 md:min-w-[360px] bg-gray-100/50 rounded-2xl md:rounded-[2rem] border border-gray-200/60 shadow-inner overflow-hidden"
        :class="activeTab === 'ready' ? 'flex' : 'hidden md:flex'"
      >
        <header class="p-4 md:p-5 flex justify-between items-center bg-gray-100/50 backdrop-blur-sm z-10 border-b border-gray-200/50">
          <div class="flex items-center gap-3">
             <div class="w-2 md:w-3 h-6 md:h-8 bg-[#00D26A] rounded-full"></div>
             <h2 class="font-extrabold text-gray-700 text-base md:text-lg uppercase tracking-wide">Pronto</h2>
          </div>
          <span class="bg-[#00D26A] text-white font-bold px-3 py-1 rounded-full text-sm shadow-sm shadow-green-200">
            {{ kitchenStore.readyOrders.length }}
          </span>
        </header>
        <div class="flex-grow p-3 md:p-4 overflow-y-auto custom-scrollbar">
          <OrderCard v-for="order in kitchenStore.readyOrders" :key="order.id" :order="order" @finish="handleFinish" />
        </div>
      </section>

    </main>

    <nav class="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-[0_-5px_15px_rgba(0,0,0,0.05)] md:hidden z-50 px-6 py-2 pb-5 flex justify-between items-center">
        
        <button 
            @click="activeTab = 'pending'"
            class="flex flex-col items-center gap-1 p-2 rounded-xl transition-all relative w-20"
            :class="activeTab === 'pending' ? 'text-yellow-600 bg-yellow-50' : 'text-gray-400'"
        >
            <div class="relative">
                <List :size="24" stroke-width="2.5" />
                <span v-if="kitchenStore.pendingOrders.length > 0" class="absolute -top-2 -right-2 bg-yellow-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center border-2 border-white">
                    {{ kitchenStore.pendingOrders.length }}
                </span>
            </div>
            <span class="text-[10px] font-bold uppercase tracking-wide">Fila</span>
        </button>

        <button 
            @click="activeTab = 'preparing'"
            class="flex flex-col items-center gap-1 p-2 rounded-xl transition-all relative w-20"
            :class="activeTab === 'preparing' ? 'text-blue-600 bg-blue-50' : 'text-gray-400'"
        >
            <div class="relative">
                <ChefHat :size="24" stroke-width="2.5" />
                <span v-if="kitchenStore.preparingOrders.length > 0" class="absolute -top-2 -right-2 bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center border-2 border-white">
                    {{ kitchenStore.preparingOrders.length }}
                </span>
            </div>
            <span class="text-[10px] font-bold uppercase tracking-wide">Preparo</span>
        </button>

        <button 
            @click="activeTab = 'ready'"
            class="flex flex-col items-center gap-1 p-2 rounded-xl transition-all relative w-20"
            :class="activeTab === 'ready' ? 'text-green-600 bg-green-50' : 'text-gray-400'"
        >
            <div class="relative">
                <CheckCircle :size="24" stroke-width="2.5" />
                <span v-if="kitchenStore.readyOrders.length > 0" class="absolute -top-2 -right-2 bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center border-2 border-white">
                    {{ kitchenStore.readyOrders.length }}
                </span>
            </div>
            <span class="text-[10px] font-bold uppercase tracking-wide">Pronto</span>
        </button>

    </nav>

  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
</style>