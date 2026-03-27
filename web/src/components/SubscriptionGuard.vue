<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useSubscriptionStore } from '@/stores/subscriptions';
import { AlertTriangle, CreditCard } from 'lucide-vue-next';

defineProps({
  featureName: { type: String, default: 'esta funcionalidade' }
});

const router = useRouter();
const subscriptionStore = useSubscriptionStore();
const isActive = computed(() => subscriptionStore.isActive);
</script>

<template>
  <div class="relative">
    <slot />

    <Transition name="guard-fade">
      <div
        v-if="!isActive"
        class="absolute inset-0 z-50 flex flex-col items-center justify-center"
        style="backdrop-filter: blur(6px); background: rgba(0,0,0,0.72);"
      >
        <div class="max-w-sm w-full mx-4 bg-zinc-900 border border-red-500/30 rounded-[2rem] p-8 text-center shadow-2xl">
          <div class="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-5">
            <AlertTriangle :size="28" class="text-red-400" />
          </div>

          <h2 class="text-xl font-black text-white mb-2">Assinatura Inativa</h2>
          <p class="text-sm text-zinc-400 mb-1">
            {{ featureName }} não está disponível com sua assinatura atual.
          </p>
          <p class="text-xs text-zinc-500 mb-6">
            Renove seu plano para continuar utilizando o sistema completo.
          </p>

          <button
            @click="router.push('/app/subscription')"
            class="w-full py-3.5 rounded-2xl bg-brand-green text-black font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-brand-green-hover transition-colors active:scale-95"
          >
            <CreditCard :size="16" />
            Gerenciar Assinatura
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.guard-fade-enter-active,
.guard-fade-leave-active {
  transition: opacity 0.25s ease;
}
.guard-fade-enter-from,
.guard-fade-leave-to {
  opacity: 0;
}
</style>
