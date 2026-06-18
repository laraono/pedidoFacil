<script setup>
  import { useRoute } from "vue-router";
  import { X, ShieldAlert } from "lucide-vue-next";
  import { adminMenuItems } from "@/utils/navigation";

  defineProps({
    isOpen: Boolean,
    menuItems: Array,
    isAdmin: { type: Boolean, default: false },
  });

  defineEmits(["close", "navigate"]);

  const route = useRoute();
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity print:hidden"
    @click="$emit('close')"
  ></div>

  <aside
    class="fixed top-0 left-0 h-full w-72 border-r shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col print:hidden"
    :class="[
      isOpen ? 'translate-x-0' : '-translate-x-full',
      isAdmin
        ? 'bg-emerald-950/95 border-accent/30'
        : 'bg-white border-[#E0E0E0]',
    ]"
  >
    <div
      class="p-5 border-b flex justify-between items-center"
      :class="
        isAdmin
          ? 'border-accent/15 bg-accent-light'
          : 'border-[#E0E0E0] bg-gray-50'
      "
    >
      <div class="flex items-center gap-2">
        <ShieldAlert v-if="isAdmin" :size="16" class="text-accent" />
        <span class="font-bold text-lg text-[#212121]">{{
          isAdmin ? "Admin" : "Navegação"
        }}</span>
      </div>
      <button
        @click="$emit('close')"
        class="text-[#757575] hover:text-danger p-2 rounded hover:bg-red-400/10 transition-colors"
      >
        <X class="w-6 h-6" />
      </button>
    </div>

    <nav class="flex-grow p-4 space-y-1 overflow-y-auto custom-scrollbar">
      <template v-if="isAdmin">
        <p
          class="text-[9px] font-black uppercase tracking-[0.2em] text-accent/50 px-4 pb-1 pt-2"
        >
          Painel Admin
        </p>
        <a
          v-for="item in adminMenuItems"
          :key="item.label"
          @click.prevent="$emit('navigate', item.route)"
          class="flex items-center gap-3 px-4 py-3 rounded cursor-pointer transition-all hover:translate-x-1"
          :class="
            route.path === item.route
              ? 'bg-accent/15 text-accent-light font-bold'
              : 'text-accent-light/60 hover:bg-primary-dark/10 hover:text-accent'
          "
        >
          <component :is="item.icon" class="w-5 h-5" />
          {{ item.label }}
        </a>
        <div class="h-px bg-accent-light my-3" />
      </template>

      <template v-if="!isAdmin">
        <a
          v-for="item in menuItems"
          :key="item.label"
          @click.prevent="$emit('navigate', item.route)"
          class="flex items-center gap-3 px-4 py-3 rounded cursor-pointer transition-all hover:translate-x-1"
          :class="
            route.fullPath === item.route
              ? 'bg-primary-light text-primary font-bold'
              : 'text-[#757575] hover:bg-gray-100 hover:text-[#212121]'
          "
        >
          <component
            :is="item.icon"
            class="w-5 h-5"
            :class="
              route.fullPath === item.route ? 'text-primary' : 'text-[#9E9E9E]'
            "
          />
          {{ item.label }}
        </a>
      </template>
    </nav>
  </aside>
</template>
