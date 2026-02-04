import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router/index.js'

// 🚨 LÓGICA CRÍTICA DE LIMPEZA PARA TESTES INICIAIS 🚨
// COMENTE OU REMOVA ESTE BLOCO QUANDO O BACKEND ESTIVER ESTÁVEL!
const resetLocalStorageForTesting = () => {
    console.warn("MODO DE TESTE ATIVO: Limpando dados de Autenticação/Onboarding.");
    localStorage.removeItem('userToken');
    localStorage.removeItem('user');
    localStorage.removeItem('onboarding_personal'); // Dados pessoais temporários
    localStorage.removeItem('configStatus'); // Status das 3 etapas de config
    // Isso garante que cada "npm run dev" inicia o fluxo do zero.
};
//resetLocalStorageForTesting();
// 🚨 FIM DO BLOCO DE TESTE 🚨

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')