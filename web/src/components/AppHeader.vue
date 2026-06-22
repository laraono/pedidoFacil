<script setup>
  import { ref, computed, onMounted } from "vue";
  import localStorageService from "@/services/localStorageService";
  import { useRouter } from "vue-router";
  import { useAuthStore } from "@/stores/auth";
  import { LogOut, User, Menu, ShieldAlert } from "lucide-vue-next";
  import { allMenuItems } from "@/utils/navigation";
  import AppSidebar from "./AppSidebar.vue";
  import imgLogo from "@/assets/logo.png";
  import imgLightLogo from "@/assets/light-logo.png";

  const router = useRouter();
  const authStore = useAuthStore();

  const isSidebarOpen = ref(false);

  const establishmentName = ref("");
  const establishmentLogo = ref("");

  onMounted(() => {
    const data = localStorageService.getOnboarding();
    establishmentName.value = data?.nome_estabelecimento || "";
    establishmentLogo.value = localStorageService.getImage() || "";
  });

  const roleName = computed(() => authStore.user?.cargo?.name || "");
  const isAdmin = computed(() => authStore.isAdmin);

  const visibleMenuItems = computed(() => {
    return allMenuItems.filter((item) => {
      if (item.permission && !authStore.hasPermission(item.permission)) {
        return false;
      }
      if (item.managerOnly && roleName.value !== "Gerente") {
        return false;
      }
      return true;
    });
  });

  const logout = async () => {
    await authStore.logout();
    router.push("/login");
  };

  const handleNavigation = (path) => {
    isSidebarOpen.value = false;
    router.push(path);
  };
</script>

<template>
  <header
    class="h-20 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30 shadow-md print:hidden transition-colors duration-300"
    :class="
      isAdmin
        ? 'bg-emerald-950/90 border-b border-accent/30'
        : 'bg-white border-b border-[#E0E0E0]'
    "
  >
    <div class="flex items-center gap-3 sm:gap-5">
      <button
        @click="isSidebarOpen = true"
        class="p-2 -ml-2 rounded transition-all active:scale-95"
        :class="
          isAdmin
            ? 'text-white/60 hover:text-white hover:bg-white/10'
            : 'text-[#757575] hover:text-primary hover:bg-primary-light'
        "
      >
        <Menu class="w-7 h-7" />
      </button>

      <div
        class="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
        @click="
          router.push(isAdmin ? '/app/admin/reports' : '/app/dashboard')
        "
      >
        <img
          :src="isAdmin ? imgLogo : imgLightLogo"
          alt="PedidoFácil"
          class="h-9 sm:h-12 object-contain"
        />
      </div>
    </div>

    <div
      v-if="establishmentName && !isAdmin"
      class="hidden md:flex items-center gap-2.5 px-4 py-1.5 bg-gray-50 border border-[#E0E0E0] rounded"
    >
      <div
        class="w-10 h-10 rounded overflow-hidden bg-gray-100 flex items-center justify-center shrink-0"
      >
        <img
          v-if="establishmentLogo"
          :src="establishmentLogo"
          class="w-full h-full object-contain p-0.5"
        />
        <div v-else class="w-3 h-3 rounded-sm bg-accent/40" />
      </div>
      <span class="text-[#212121] text-s font-bold max-w-[120px] truncate">{{
        establishmentName
      }}</span>
    </div>

    <div class="flex items-center gap-3">
      <div
        v-if="isAdmin"
        class="flex items-center gap-2 px-3 py-1.5 bg-accent/15 border border-accent/40 rounded"
      >
        <ShieldAlert class="w-4 h-4 text-accent" />
        <span class="text-xs font-black text-accent uppercase tracking-[0.15em]"
          >Admin</span
        >
      </div>

      <div
        class="hidden sm:flex items-center gap-3 px-4 py-2 rounded border"
        :class="
          isAdmin
            ? 'bg-white/10 border-white/20'
            : 'bg-primary-light border-primary/20'
        "
      >
        <User
          class="w-4 h-4"
          :class="isAdmin ? 'text-white/70' : 'text-primary'"
        />
        <div class="flex flex-col leading-none">
          <span
            class="text-sm font-bold"
            :class="isAdmin ? 'text-white' : 'text-primary'"
          >
            {{ authStore.user?.name || "Gestor Principal" }}
          </span>
          <span
            v-if="!isAdmin"
            class="text-[10px] font-medium mt-0.5 text-primary/70"
            >{{ roleName }}</span
          >
        </div>
      </div>

      <button
        @click="logout"
        class="flex items-center gap-1.5 px-3 py-2 rounded border transition-all text-sm font-medium active:scale-95"
        :class="
          isAdmin
            ? 'text-accent/70 border-accent/30 hover:text-danger hover:border-danger/40 hover:bg-red-400/10'
            : 'text-[#757575] border-[#E0E0E0] hover:text-danger hover:border-danger/40 hover:bg-red-400/10'
        "
      >
        <LogOut class="w-4 h-4" />
        <span class="hidden sm:inline">Sair</span>
      </button>
    </div>
  </header>

  <AppSidebar
    :isOpen="isSidebarOpen"
    :menuItems="visibleMenuItems"
    :isAdmin="isAdmin"
    @close="isSidebarOpen = false"
    @navigate="handleNavigation"
  />
</template>
