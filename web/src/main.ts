import './style/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router/index'

import { useAuthStore } from '@/stores/auth'

const app = createApp(App)
const pinia = createPinia();

app.use(pinia);

const authStore = useAuthStore(pinia);
authStore.loadSession();

app.use(router);
app.mount('#app');