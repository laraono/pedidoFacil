<script setup>
import { useRoute } from 'vue-router';
import { X, ShieldAlert } from 'lucide-vue-next';
import { adminMenuItems } from '@/utils/navigation';

defineProps({
  isOpen: Boolean,
  menuItems: Array,
  isAdmin: { type: Boolean, default: false }
});

defineEmits(['close', 'navigate']);

const route = useRoute();
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity print:hidden"
    @click="$emit('close')"
  ></div>

  <aside
    class="fixed top-0 left-0 h-full w-72 border-r shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col print:hidden"
    :class="[
      isOpen ? 'translate-x-0' : '-translate-x-full',
      isAdmin ? 'bg-emerald-950/95 border-brand-green/20' : 'bg-dark-card border-white/5'
    ]"
  >
    <div
      class="p-5 border-b flex justify-between items-center"
      :class="isAdmin ? 'border-brand-green/15 bg-brand-green/5' : 'border-white/5 bg-white/5'"
    >
      <div class="flex items-center gap-2">
        <ShieldAlert v-if="isAdmin" :size="16" class="text-brand-green" />
        <span class="font-bold text-lg text-white">{{ isAdmin ? 'Admin' : 'Navegação' }}</span>
      </div>
      <button @click="$emit('close')" class="text-gray-400 hover:text-red-400 p-2 rounded-lg hover:bg-red-400/10 transition-colors">
        <X class="w-6 h-6" />
      </button>
    </div>

    <nav class="flex-grow p-4 space-y-1 overflow-y-auto custom-scrollbar">
      <!-- Admin section -->
      <template v-if="isAdmin">
        <p class="text-[9px] font-black uppercase tracking-[0.2em] text-brand-green/50 px-4 pb-1 pt-2">Painel Admin</p>
        <a
          v-for="item in adminMenuItems"
          :key="item.label"
          @click.prevent="$emit('navigate', item.route)"
          class="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all hover:translate-x-1"
          :class="route.path === item.route
            ? 'bg-brand-green/15 text-brand-green font-bold'
            : 'text-brand-green/60 hover:bg-brand-green/10 hover:text-brand-green'"
        >
          <component :is="item.icon" class="w-5 h-5" />
          {{ item.label }}
        </a>
        <div class="h-px bg-brand-green/10 my-3" />
      </template>

      <!-- Regular menu items -->
      <a
        v-for="item in menuItems"
        :key="item.label"
        @click.prevent="$emit('navigate', item.route)"
        class="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all hover:translate-x-1"
        :class="route.path === item.route
          ? 'bg-brand-green/10 text-brand-green font-bold'
          : 'text-gray-400 hover:bg-white/5'"
      >
        <component :is="item.icon" class="w-5 h-5" :class="route.path === item.route ? 'text-brand-green' : 'text-gray-500'" />
        {{ item.label }}
      </a>
    </nav>
  </aside>
</template>
