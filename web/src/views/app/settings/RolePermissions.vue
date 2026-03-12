<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { PERMISSIONS } from '@/utils/permissions'; //
import { getRolesMock, saveRolesMock } from '@/mock/authmock'; //
import { useToast } from '@/composables/useToast';
import { 
  ShieldCheck, ShieldAlert, Users, Trash2, Edit3, 
  Plus, ArrowLeft, Lock, CheckCircle, X, AlertCircle 
} from 'lucide-vue-next';

const router = useRouter();
const { showToast } = useToast();

const roles = ref([]); // Começa vazio para carregar do mock
const isModalOpen = ref(false);
const isEditing = ref(false);
const isLoading = ref(false);
const errors = ref({}); 

// Lista de permissões disponíveis seguindo o padrão
const availablePermissions = [
  { id: PERMISSIONS.RELATORIOS, label: 'Relatórios', desc: 'Acesso a métricas e desempenho.' },
  { id: PERMISSIONS.COZINHA, label: 'Cozinha', desc: 'Gestão e preparo de pedidos.' },
  { id: PERMISSIONS.ESTOQUE, label: 'Estoque', desc: 'Controle de insumos e produtos.' },
  { id: PERMISSIONS.CARDAPIO, label: 'Cardápio', desc: 'Edição de itens e categorias.' },
  { id: PERMISSIONS.FUNCIONARIOS, label: 'Funcionários', desc: 'Gestão de usuários e cargos.' },
  { id: PERMISSIONS.CONFIGURACAO, label: 'Configuração', desc: 'Ajustes gerais do sistema.' },
  { id: PERMISSIONS.CAIXA, label: 'Caixa', desc: 'Fluxo financeiro e recebimentos.' },
  { id: PERMISSIONS.CRIAR_PEDIDO, label: 'Criar Pedido', desc: 'Lançamento de novas vendas.' },
  { id: PERMISSIONS.COMANDAS_FINALIZADAS, label: 'Histórico', desc: 'Visualizar pedidos encerrados.' }
];

const currentRole = ref({ id: null, name: '', permissions: [] });

// Carrega APENAS os cargos do estabelecimento definidos no mock
onMounted(() => {
  roles.value = getRolesMock();
});

const validateRole = () => {
  errors.value = {};
  let isValid = true;

  if (!currentRole.value.name || currentRole.value.name.trim() === '') {
    errors.value.name = "O nome do cargo é obrigatório.";
    isValid = false;
  }

  if (currentRole.value.permissions.length === 0) {
    errors.value.permissions = "Selecione pelo menos um nível de acesso.";
    isValid = false;
  }

  return isValid;
};

const saveRole = async () => {
  if (!validateRole()) {
    showToast('Existem erros no formulário.', 'error');
    return;
  }

  isLoading.value = true;
  try {
    if (isEditing.value) {
      const idx = roles.value.findIndex(r => r.id === currentRole.value.id);
      roles.value[idx] = { ...currentRole.value };
    } else {
      roles.value.push({ ...currentRole.value, id: Date.now() });
    }

    // Persiste no estabelecimento através do mock
    await saveRolesMock(roles.value);
    
    showToast(`Cargo ${currentRole.value.name} salvo com sucesso!`, 'success');
    isModalOpen.value = false;
  } catch (e) {
    showToast('Erro ao salvar cargos.', 'error');
  } finally {
    isLoading.value = false;
  }
};

const openModal = (role = null) => {
  errors.value = {};
  if (role) {
    currentRole.value = JSON.parse(JSON.stringify(role));
    isEditing.value = true;
  } else {
    currentRole.value = { id: null, name: '', permissions: [] };
    isEditing.value = false;
  }
  isModalOpen.value = true;
};

const togglePermission = (id) => {
  const perms = currentRole.value.permissions;
  const idx = perms.indexOf(id);
  if (idx > -1) perms.splice(idx, 1);
  else perms.push(id);
};
</script>

<template>
  <main class="max-w-6xl mx-auto py-12 px-6 font-inter">
    
    <header class="flex items-center justify-between mb-10">
      <div class="flex items-center gap-4">
        <button @click="router.push('/app/dashboard')" class="p-3 bg-white/5 border border-white/10 rounded-2xl text-gray-400">
          <ArrowLeft :size="20" />
        </button>
        <div>
          <h1 class="text-3xl font-black text-white">Cargos e Permissões</h1>
          <p class="text-gray-400 text-sm">Gerenciando acessos do estabelecimento</p>
        </div>
      </div>
      <button @click="openModal()" class="btn-primary-admin">
        <Plus :size="20" /> Novo Cargo
      </button>
    </header>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div v-for="role in roles" :key="role.id" 
           class="admin-card p-8 group transition-all hover:border-brand-green/30 relative">
        <div class="flex justify-between items-start mb-6">
          <ShieldCheck :class="text-brand-green" :size="24" />
          <button @click="openModal(role)" class="text-gray-400 hover:text-white transition-colors">
            <Edit3 :size="18" />
          </button>
        </div>
        <h3 class="text-xl font-bold text-white">{{ role.name }}</h3>
        <p class="text-[10px] font-black uppercase tracking-widest text-gray-500 mt-2">
          {{ role.permissions.length }} Permissões Ativas
        </p>
      </div>
    </div>

    <Teleport to="body">
      <Transition name="fade">
        <div v-if="isModalOpen" class="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div class="bg-dark-card border border-white/10 w-full max-w-2xl rounded-[2.5rem] flex flex-col max-h-[90vh] shadow-2xl">
            
            <header class="p-8 border-b border-white/5 flex justify-between items-center bg-black/20">
              <h2 class="text-2xl font-black text-white flex items-center gap-3">
                <Lock :size="24" class="text-brand-green" /> 
                {{ isEditing ? 'Editar Cargo' : 'Novo Cargo' }}
              </h2>
              <button @click="isModalOpen = false" class="p-2 text-gray-400 hover:text-white"><X :size="24" /></button>
            </header>

            <div class="p-8 overflow-y-auto custom-scrollbar space-y-8">
              <div class="space-y-2">
                <label class="text-xs font-black uppercase tracking-widest text-gray-500 ml-2">Nome do Cargo</label>
                <input v-model="currentRole.name" type="text" 
                       :class="errors.name ? 'border-red-500 bg-red-500/5' : 'border-white/10 bg-white/5'"
                       class="w-full rounded-2xl p-4 text-white border focus:outline-none focus:border-brand-green/50 transition-all" 
                       placeholder="Ex: Supervisor" />
                <p v-if="errors.name" class="text-red-500 text-xs font-bold ml-2 flex items-center gap-1">
                  <AlertCircle :size="12"/> {{ errors.name }}
                </p>
              </div>

              <div class="space-y-4">
                <label class="text-xs font-black uppercase tracking-widest text-gray-500 ml-2">Permissões de Acesso</label>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div v-for="perm in availablePermissions" :key="perm.id" 
                       @click="togglePermission(perm.id)"
                       :class="currentRole.permissions.includes(perm.id) ? 'border-brand-green bg-brand-green/5' : 'border-white/5 bg-white/5'"
                       class="p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-4">
                    <div class="mt-1">
                      <div class="w-5 h-5 rounded border border-white/20 flex items-center justify-center"
                           :class="currentRole.permissions.includes(perm.id) ? 'bg-brand-green border-brand-green' : ''">
                        <CheckCircle v-if="currentRole.permissions.includes(perm.id)" :size="14" class="text-black" />
                      </div>
                    </div>
                    <div>
                      <span class="block font-bold text-sm" :class="currentRole.permissions.includes(perm.id) ? 'text-brand-green' : 'text-white'">
                        {{ perm.label }}
                      </span>
                      <span class="text-[9px] text-gray-500 font-black uppercase tracking-tighter">{{ perm.id }}</span>
                    </div>
                  </div>
                </div>
                <p v-if="errors.permissions" class="text-red-500 text-xs font-bold ml-2 flex items-center gap-1">
                  <AlertCircle :size="12"/> {{ errors.permissions }}
                </p>
              </div>
            </div>

            <footer class="p-8 border-t border-white/5 bg-black/20 flex justify-end gap-4">
              <button @click="saveRole" class="btn-primary-admin px-12">
                {{ isLoading ? 'Salvando...' : 'Salvar Cargo' }}
              </button>
            </footer>
          </div>
        </div>
      </Transition>
    </Teleport>
  </main>
</template>