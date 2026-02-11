<script setup>
import { useRouter } from 'vue-router';
import { Info, Briefcase, Utensils, CheckCircle } from 'lucide-vue-next';

const router = useRouter();

// MOCK de status de configuração
const mockConfigStatus = {
  info: true,
  roles: false,
  menu: false
};

// URLs de Assets
const MOCKUP_INFO_URL = '../../assets/image 29.png';
const MOCKUP_ROLES_URL = '../../assets/image 27.png';
const MOCKUP_MENU_URL = '../../assets/image 28.png';

const configCards = [
  {
    title: 'Informações do Estabelecimento',
    description: 'Configure e Edite as Informações do seu Estabelecimento',
    image: MOCKUP_INFO_URL,
    route: '/app/settings/establishment',
    icon: Info,
    stepKey: 'info'
  },
  {
    title: 'Cargos e Permissões',
    description: 'Configure e Edite os Cargos e Permissões do seu Estabelecimento',
    image: MOCKUP_ROLES_URL,
    route: '/app/settings/roles',
    icon: Briefcase,
    stepKey: 'roles'
  },
  {
    title: 'Cardápio e Produtos',
    description: 'Configure e Personalize seu Cardápio e Produtos',
    image: MOCKUP_MENU_URL,
    route: '/app/settings/menu',
    icon: Utensils,
    stepKey: 'menu'
  }
];

const handleCardEdit = (route) => {
  router.push(route);
};
</script>


<template>
  <!-- Conteúdo Principal: Renderizado dentro do ManagerLayout -->
  <main class="max-w-7xl mx-auto py-12 px-4">
    <h2 class="text-4xl font-bold text-center mb-10 text-gray-800">Personalize seu Sistema</h2>
    
    <!-- Cartões de Configuração -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div v-for="card in configCards" :key="card.title" class="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow">
        <div class="p-6">
          <h3 class="text-xl font-bold text-gray-800 mb-2 flex items-center space-x-2">
              <component :is="card.icon" :size="20" class="text-blue-600" />
              <span>{{ card.title }}</span>
              <!-- Ícone de concluído no card (lido da Auth Store) -->
              <CheckCircle v-if="mockConfigStatus[card.stepKey]" :size="18" class="text-green-500 ml-auto"/>
          </h3>
          
          <!-- CONTAINER DA IMAGEM: Garante proporção uniforme -->
          <div class="h-40 my-4 bg-gray-200 rounded-md overflow-hidden">
              <img :src="card.image" :alt="card.title" 
                   class="w-full h-full object-cover object-center" 
                   onerror="this.onerror=null;this.src='https://placehold.co/300x160/333/fff?text=Imagem+Faltando';" />
          </div>
          
          <p class="text-sm text-gray-600 mb-6">{{ card.description }}</p>
          
          <button @click="handleCardEdit(card.route)"
                  class="w-full py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
            Editar
          </button>
        </div>
      </div>
    </div>
  </main>
</template>