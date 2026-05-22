<script setup>
import { CreditCard, AlertTriangle } from 'lucide-vue-next';
import { useRouter } from 'vue-router';

defineProps({ message: String });

const router = useRouter();
</script>

<template>
  <div class="absolute inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded border border-[#E0E0E0] shadow-2xl max-w-md w-full p-8 text-center">
      <div class="w-16 h-16 bg-red-50 border border-danger/30 rounded-full flex items-center justify-center mx-auto mb-6">
        <AlertTriangle :size="28" class="text-danger" />
      </div>
      <h2 class="text-xl font-black text-[#212121] mb-2">Assinatura Inativa</h2>
      <p class="text-[#757575] text-sm mb-6">
        {{ message || 'Sua assinatura está pendente ou inativa. Regularize para continuar usando este recurso.' }}
      </p>
      <button
        @click="router.push('/app/subscription')"
        class="w-full py-3 rounded bg-primary text-white font-black text-sm uppercase tracking-wider hover:bg-primary-dark transition-all flex items-center justify-center gap-2"
      >
        <CreditCard :size="16" />
        Ir para Assinaturas
      </button>
    </div>
  </div>
</template>
