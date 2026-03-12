<script setup>
import { useRoute } from 'vue-router';
import { X } from 'lucide-vue-next';

defineProps({
  isOpen: Boolean,
  menuItems: Array
});

defineEmits(['close', 'navigate']);

const route = useRoute();
</script>

<template>
  <div 
    v-if="isOpen" 
    class="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
    @click="$emit('close')"
  ></div>

  <aside
    class="fixed top-0 left-0 h-full w-72 bg-dark-card border-r border-white/5 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col"
    :class="isOpen ? 'translate-x-0' : '-translate-x-full'"
  >
    <div class="p-5 border-b border-white/5 flex justify-between items-center bg-white/5">
      <span class="font-bold text-lg text-white">Navegação</span>
      <button @click="$emit('close')" class="text-gray-400 hover:text-red-400 p-2 rounded-lg hover:bg-red-400/10 transition-colors">
        <X class="w-6 h-6" />
      </button>
    </div>

    <nav class="flex-grow p-4 space-y-2 overflow-y-auto custom-scrollbar">
      <a
        v-for="item in menuItems"
        :key="item.label"
        @click.prevent="$emit('navigate', item.route)"
        class="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all hover:bg-white/5 hover:translate-x-1"
        :class="route.path === item.route ? 'bg-brand-green/10 text-brand-green font-bold' : 'text-gray-400'"
      >
        <component :is="item.icon" class="w-5 h-5" :class="route.path === item.route ? 'text-brand-green' : 'text-gray-500'" />
        {{ item.label }}
      </a>
    </nav>
  </aside>
</template>