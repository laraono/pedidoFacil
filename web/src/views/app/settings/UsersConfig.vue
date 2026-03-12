<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { isValidCPF, maskCPF } from '@/utils/validator';
import { ArrowLeft, PlusCircle, Trash, Pencil, X, AlertCircle } from 'lucide-vue-next';
import { getRolesMock, initMockRoles } from '@/mock/authmock'; 

const USERS_KEY = "users";

const router = useRouter();
const authStore = useAuthStore();

const users = ref([]);
const roles = ref([]);
const isLoading = ref(false);
const showForm = ref(false);
const editingUser = ref(null);
const localError = ref(null);

const currentUser = computed(() => authStore.user);

const form = ref({
  id: null,
  name: '',
  email: '',
  cpf: '',
  password: '',
  roleId: ''
});

watch(
  () => form.value.cpf,
  (value) => {
    if (!value) return;
    const masked = maskCPF(value);
    if (masked !== value) {
      form.value.cpf = masked;
    }
    if (isValidCPF(masked)) {
      localError.value = null;
    }
  }
);

onMounted(() => {
  initMockRoles();
  loadUsers();
  roles.value = getRolesMock();
});

function loadUsers() {
  users.value = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
}

function openForm(user = null) {
  showForm.value = true;

  if (user) {
    editingUser.value = user.id;
    form.value = { ...user };
  } else {
    editingUser.value = null;
    form.value = {
      id: null,
      name: '',
      email: '',
      cpf: '',
      password: '',
      roleId: ''
    };
  }
}

function closeForm() {
  showForm.value = false;
  editingUser.value = null;
}

function saveUser() {
  localError.value = null;

  if (!isValidCPF(form.value.cpf)) {
    localError.value = 'O CPF inserido é inválido.';
    return;
  }

  isLoading.value = true;

  const list = JSON.parse(localStorage.getItem(USERS_KEY)) || [];

  if (form.value.id) {
    const index = list.findIndex(u => u.id === form.value.id);

    if (form.value.id === currentUser.value?.id) {
      form.value.roleId = list[index].roleId;
    }

    list[index] = {
      ...list[index],
      ...form.value
    };
  } else {
    list.push({
      ...form.value,
      id: Date.now(),
      status: 'ATIVO'
    });
  }

  localStorage.setItem(USERS_KEY, JSON.stringify(list));

  loadUsers();
  closeForm();
  isLoading.value = false;
}

function toggleStatus(user) {
  if (user.id === currentUser.value?.id) return;

  const list = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
  const index = list.findIndex(u => u.id === user.id);

  list[index].status =
    user.status === 'ATIVO' ? 'INATIVO' : 'ATIVO';

  localStorage.setItem(USERS_KEY, JSON.stringify(list));
  loadUsers();
}

function isActive(status) {
  if (!status) return true;
  return status.toString().trim().toUpperCase() === 'ATIVO';
}
</script>

<template>
  <main class="max-w-6xl mx-auto py-12 px-6 font-inter">
    
    <header class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-6">
      <div class="flex items-center gap-4">
        <button @click="router.back()" class="p-3 bg-white/5 border border-white/10 rounded-2xl text-gray-400 hover:text-white transition-colors">
          <ArrowLeft :size="20" />
        </button>
        <div>
          <h1 class="text-3xl font-black text-white">Usuários</h1>
          <p class="text-gray-400 text-sm">Gerencie o acesso da sua equipe</p>
        </div>
      </div>

      <button v-if="!showForm" @click="openForm()" class="btn-primary-admin w-full sm:w-auto flex items-center justify-center gap-2">
        <PlusCircle :size="20" /> Novo Usuário
      </button>
    </header>

    <Transition name="fade">
      <div v-if="showForm" class="bg-dark-card border border-white/10 p-8 rounded-[2.5rem] shadow-2xl mb-10 relative overflow-hidden">
        <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-green to-transparent opacity-50"></div>
        
        <div class="flex justify-between items-center mb-8">
          <h2 class="text-2xl font-black text-white flex items-center gap-3">
            <Pencil v-if="editingUser" :size="24" class="text-brand-green" /> 
            <PlusCircle v-else :size="24" class="text-brand-green" /> 
            {{ editingUser ? 'Editar Usuário' : 'Cadastrar Usuário' }}
          </h2>
          <button @click="closeForm" class="p-2 text-gray-400 hover:text-white transition-colors">
            <X :size="24" />
          </button>
        </div>

        <form @submit.prevent="saveUser" class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div class="space-y-2">
            <label class="text-xs font-black uppercase tracking-widest text-gray-500 ml-2">Nome Completo</label>
            <input v-model="form.name" required type="text" minlength="5" maxlength="100" placeholder="Ex: João Silva"
                   class="w-full rounded-2xl p-4 text-white bg-white/5 border border-white/10 focus:outline-none focus:border-brand-green/50 transition-all placeholder-gray-600" />
          </div>

          <div class="space-y-2">
            <label class="text-xs font-black uppercase tracking-widest text-gray-500 ml-2">Email Profissional</label>
            <input v-model="form.email" required type="email" maxlength="255" placeholder="exemplo@email.com"
                   class="w-full rounded-2xl p-4 text-white bg-white/5 border border-white/10 focus:outline-none focus:border-brand-green/50 transition-all placeholder-gray-600" />
          </div>

          <div class="space-y-2">
            <label class="text-xs font-black uppercase tracking-widest text-gray-500 ml-2">CPF</label>
            <input v-model="form.cpf" required type="text" maxlength="14" placeholder="000.000.000-00"
                   :class="localError ? 'border-red-500 bg-red-500/5' : 'border-white/10 bg-white/5'"
                   class="w-full rounded-2xl p-4 text-white border focus:outline-none focus:border-brand-green/50 transition-all placeholder-gray-600" />
            <p v-if="localError" class="text-red-500 text-xs font-bold ml-2 flex items-center gap-1 mt-2">
              <AlertCircle :size="12"/> {{ localError }}
            </p>
          </div>

          <div class="space-y-2">
            <label class="text-xs font-black uppercase tracking-widest text-gray-500 ml-2">Senha</label>
            <input v-model="form.password" :required="!editingUser" type="password" minlength="6" maxlength="64" placeholder="••••••••"
                   class="w-full rounded-2xl p-4 text-white bg-white/5 border border-white/10 focus:outline-none focus:border-brand-green/50 transition-all placeholder-gray-600" />
          </div>

          <div class="space-y-2 md:col-span-2">
            <label class="text-xs font-black uppercase tracking-widest text-gray-500 ml-2">Cargo</label>
            <select v-model.number="form.roleId" required :disabled="editingUser === currentUser?.id"
                    class="w-full rounded-2xl p-4 text-white bg-white/5 border border-white/10 focus:outline-none focus:border-brand-green/50 transition-all appearance-none disabled:opacity-50 disabled:cursor-not-allowed">
              <option disabled value="" class="bg-zinc-900 text-gray-400">Selecione o cargo</option>
              <option v-for="role in roles" :key="role.id" :value="role.id" class="bg-zinc-900 text-white">
                {{ role.name }}
              </option>
            </select>
          </div>

          <div class="md:col-span-2 flex justify-end gap-4 mt-4 pt-8 border-t border-white/5">
            <button type="button" @click="closeForm"
                    class="px-8 py-4 rounded-2xl text-gray-400 font-bold hover:bg-white/5 hover:text-white transition-colors">
              Cancelar
            </button>
            <button type="submit" :disabled="isLoading"
                    class="btn-primary-admin px-8 py-4 disabled:opacity-50">
              {{ isLoading ? 'Salvando...' : 'Salvar Usuário' }}
            </button>
          </div>
        </form>
      </div>
    </Transition>

    <div class="hidden md:block bg-dark-card border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
      <table class="w-full text-left border-collapse">
        <thead class="bg-black/20 text-gray-500 uppercase text-[10px] font-black tracking-widest border-b border-white/5">
          <tr>
            <th class="p-6 border-b border-white/5">Nome</th>
            <th class="p-6 border-b border-white/5">Email</th>
            <th class="p-6 border-b border-white/5 text-center">Status</th>
            <th class="p-6 border-b border-white/5 text-center">Cargo</th>
            <th class="p-6 border-b border-white/5 text-right">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id" class="hover:bg-white/5 border-b border-white/5 last:border-0 transition-colors">
            <td class="p-6 font-bold text-white">{{ user.name }}</td>
            <td class="p-6 text-gray-400 text-sm">{{ user.email }}</td>
            <td class="p-6 text-center">
              <span :class="isActive(user.status) ? 'bg-brand-green/10 text-brand-green border-brand-green/20' : 'bg-red-500/10 text-red-500 border-red-500/20'"
                    class="px-3 py-1 border rounded-full text-[10px] font-black uppercase tracking-widest">
                {{ user.status || 'ATIVO' }}
              </span>
            </td>
            <td class="p-6 text-center font-bold text-gray-400 text-sm">
              {{ roles.find(r => r.id === user.roleId)?.name || '-' }}
            </td>
            <td class="p-6 text-right">
              <div class="flex justify-end gap-2">
                <button @click="openForm(user)" class="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                  <Pencil :size="18" />
                </button>
                <button v-if="user.id !== currentUser?.id" @click="toggleStatus(user)" 
                        class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all">
                  <Trash :size="18" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="md:hidden space-y-4">
      <div v-for="user in users" :key="user.id" class="bg-dark-card border border-white/10 p-6 rounded-2xl shadow-xl">
        <div class="flex justify-between items-start mb-4">
          <div>
            <p class="font-bold text-white text-lg">{{ user.name }}</p>
            <p class="text-sm text-gray-400 mt-1">{{ user.email }}</p>
          </div>
          <span :class="isActive(user.status) ? 'bg-brand-green/10 text-brand-green border-brand-green/20' : 'bg-red-500/10 text-red-500 border-red-500/20'"
                class="px-2 py-1 border rounded-full text-[9px] font-black uppercase tracking-widest">
            {{ user.status || 'ATIVO' }}
          </span>
        </div>

        <div class="flex justify-between items-center mt-6 pt-4 border-t border-white/5">
          <span class="text-[10px] font-black uppercase tracking-widest text-gray-500 bg-white/5 px-3 py-1 rounded-lg border border-white/10">
            {{ roles.find(r => r.id === user.roleId)?.name || '-' }}
          </span>
          
          <div class="flex gap-2">
            <button @click="openForm(user)" class="p-2 text-gray-400 hover:text-white bg-white/5 rounded-xl">
              <Pencil :size="18" />
            </button>
            <button v-if="user.id !== currentUser?.id" @click="toggleStatus(user)" class="p-2 text-red-500 bg-red-500/10 rounded-xl">
              <Trash :size="18" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>