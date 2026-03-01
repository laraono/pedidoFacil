<template>
  <div class="p-6 text-gray-800">
    <h1 class="text-2xl font-bold mb-6">Comandas Finalizadas</h1>
    <div v-if="closedComandas.length === 0" class="text-gray-500">
      Nenhuma comanda finalizada ainda.
    </div>
    <div v-else class="space-y-4">
      <div v-for="comanda in closedComandas" :key="comanda.id" class="bg-white p-4 rounded shadow">
        <div class="flex justify-between">
          <span class="font-semibold">Comanda #{{ comanda.id }}</span>
          <span class="text-green-600">R$ {{ comanda.total.toFixed(2) }}</span>
        </div>
        <div class="text-sm text-gray-600">
          Fechada em: {{ new Date(comanda.closedAt).toLocaleString('pt-BR') }}
        </div>
        <div class="text-sm">
          Pagamentos:
          <ul class="list-disc list-inside">
            <li v-for="p in comanda.paymentDetails?.payments" :key="p.type">
              {{ p.type }}: R$ {{ p.amount.toFixed(2) }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useClosedComandaStore } from '@/stores/closedComandas';

const closedComandaStore = useClosedComandaStore();
const closedComandas = closedComandaStore.closedComandas;
</script>