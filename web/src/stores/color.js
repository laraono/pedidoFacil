import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useColorStore = defineStore('color', () => {
    const corFundo = ref('#0060A9');
    const corBotoes = ref('#009DFF');
    const corCategorias = ref('#009DFF');
  
    const updateCorFundo = (color) => {
        corFundo.value = color
    }
    
    const updateCorBotoes = (color) => {
        corBotoes.value = color
    }

    const updateCorCategorias = (color) => {
        corCategorias.value = color
    }
  
    return { 
        corFundo, 
        corBotoes, 
        corCategorias,
        updateCorFundo,
        updateCorBotoes,
        updateCorCategorias
    }
})