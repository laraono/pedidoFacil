<script setup>
import { computed, ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { LogOut } from 'lucide-vue-next';
import { useRouter } from 'vue-router';
import { getEstablishmentMock, initMockEstablishment } from '@/mock/stablishmentmock'; 

const authStore = useAuthStore();
const router = useRouter();

const userName = computed(() => authStore.user?.name || '');
const roleName = computed(() => authStore.role?.name || '');

const establishmentName = ref('Carregando...');

onMounted(async () => {
  initMockEstablishment(); 
  
  try {
    const data = await getEstablishmentMock();
    if (data && data.info) {
      establishmentName.value = data.info.name;
    }
  } catch (error) {
    console.error("Erro ao carregar nome do estabelecimento:", error);
    establishmentName.value = 'Erro ao carregar';
  }
});

const logout = () => {
  authStore.logout();
  router.push('/login');
};
</script>

<template>
  <header
    v-if="authStore.isAuthenticated"
    class="bg-blue-600 text-white px-6 py-3 flex justify-between items-center"
  >
    <div>
      <h1 class="font-bold text-lg">{{ establishmentName }}</h1>
      <span class="text-xs opacity-80">{{ roleName }}</span>
    </div>

    <div class="flex items-center gap-4">
      <span class="text-sm">{{ userName }}</span>
      <button
        @click="logout"
        class="hover:bg-blue-700 p-2 rounded"
      >
        <LogOut :size="18" />
      </button>
    </div>
  </header>
</template>