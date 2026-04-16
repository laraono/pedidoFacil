import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Comanda } from './comandaManagement';

export const useClosedComandaStore = defineStore('closedComandas', () => {
  const closedComandas = ref<Comanda[]>([]);

  function addClosedComanda(comanda: Comanda): void {
    closedComandas.value.push(comanda);
  }

  function getClosedComandas(): Comanda[] {
    return closedComandas.value;
  }

  return { closedComandas, addClosedComanda, getClosedComandas };
});
