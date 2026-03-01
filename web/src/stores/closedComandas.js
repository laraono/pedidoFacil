import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useClosedComandaStore = defineStore('closedComandas', () => {
  const closedComandas = ref([]);

  function addClosedComanda(comanda) {
    closedComandas.value.push(comanda);
  }

  function getClosedComandas() {
    return closedComandas.value;
  }

  return { closedComandas, addClosedComanda, getClosedComandas };
});