<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from '@/composables/useToast';
import {
  ArrowLeft, ShieldAlert, Plus, Trash2, Pencil, X,
  Eye, EyeOff, UserCheck, UserX, KeyRound, Mail
} from 'lucide-vue-next';

const router = useRouter();
const { showToast } = useToast();

const ADMIN_USERS_KEY = 'adminUsers';

const loadUsers = () => {
  const saved = localStorage.getItem(ADMIN_USERS_KEY);
  if (saved) return JSON.parse(saved);
  const defaults = [
    { id: 1, name: 'Admin Principal', email: 'admin@email.com', password: '123456', status: 'ativo', createdAt: '2025-01-10' },
  ];
  localStorage.setItem(ADMIN_USERS_KEY, JSON.stringify(defaults));
  return defaults;
};

const saveUsers = (list) => localStorage.setItem(ADMIN_USERS_KEY, JSON.stringify(list));

const users = ref([]);
const isModalOpen = ref(false);
const isEditing = ref(false);
const showPassword = ref(false);
const isLoading = ref(false);

const form = ref({ id: null, name: '', email: '', password: '', status: 'ativo' });
const errors = ref({});

onMounted(() => { users.value = loadUsers(); });

const validate = () => {
  const e = {};
  if (!form.value.name.trim()) e.name = 'Nome é obrigatório.';
  if (!form.value.email.trim() || !form.value.email.includes('@')) e.email = 'E-mail inválido.';
  if (!isEditing.value && !form.value.password.trim()) e.password = 'Senha é obrigatória.';
  if (form.value.password && form.value.password.length < 6) e.password = 'Mínimo 6 caracteres.';
  errors.value = e;
  return Object.keys(e).length === 0;
};

const openCreate = () => {
  form.value = { id: null, name: '', email: '', password: '', status: 'ativo' };
  errors.value = {};
  isEditing.value = false;
  showPassword.value = false;
  isModalOpen.value = true;
};

const openEdit = (user) => {
  form.value = { ...user, password: '' };
  errors.value = {};
  isEditing.value = true;
  showPassword.value = false;
  isModalOpen.value = true;
};

const saveUser = () => {
  if (!validate()) return;
  isLoading.value = true;
  setTimeout(() => {
    if (isEditing.value) {
      const idx = users.value.findIndex(u => u.id === form.value.id);
      const updated = { ...users.value[idx], name: form.value.name, email: form.value.email, status: form.value.status };
      if (form.value.password) updated.password = form.value.password;
      users.value[idx] = updated;
      showToast('Usuário atualizado!', 'success');
    } else {
      if (users.value.some(u => u.email === form.value.email)) {
        errors.value.email = 'Este e-mail já está em uso.';
        isLoading.value = false;
        return;
      }
      users.value.push({
        id: Date.now(),
        name: form.value.name,
        email: form.value.email,
        password: form.value.password,
        status: 'ativo',
        createdAt: new Date().toISOString().split('T')[0]
      });
      showToast('Usuário admin criado!', 'success');
    }
    saveUsers(users.value);
    isModalOpen.value = false;
    isLoading.value = false;
  }, 300);
};

const deleteUser = (user) => {
  if (users.value.length <= 1) {
    showToast('Precisa existir ao menos um usuário admin.', 'error');
    return;
  }
  users.value = users.value.filter(u => u.id !== user.id);
  saveUsers(users.value);
  showToast(`"${user.name}" removido.`, 'success');
};

const toggleStatus = (user) => {
  user.status = user.status === 'ativo' ? 'inativo' : 'ativo';
  saveUsers(users.value);
  showToast(`Status atualizado para ${user.status}.`, 'success');
};

const formatDate = (d) =>
  new Date(d + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
</script>

<template>
  <main class="max-w-5xl mx-auto py-12 px-6 font-inter">

    <header class="flex items-center justify-between gap-4 mb-10">
      <div class="flex items-center gap-4">
        <button @click="router.push('/app/dashboard')" class="p-3 bg-gray-50 border border-[#E0E0E0] rounded text-[#757575] hover:text-[#212121] transition-colors">
          <ArrowLeft :size="20" />
        </button>
        <div>
          <div class="flex items-center gap-2 mb-1">
            <ShieldAlert :size="16" class="text-accent" />
            <span class="text-xs font-black text-accent uppercase tracking-widest">Painel Admin</span>
          </div>
          <h1 class="text-3xl font-black text-[#212121]">Usuários Admin</h1>
          <p class="text-[#757575] text-sm">Gerenciar contas com acesso ao painel administrativo</p>
        </div>
      </div>
      <button
        @click="openCreate"
        class="flex items-center gap-2 px-5 py-3 bg-primary text-white font-black rounded hover:bg-primary-dark transition-all text-sm"
      >
        <Plus :size="16" /> Novo Admin
      </button>
    </header>

    <!-- Table -->
    <div class="bg-white border border-[#E0E0E0] rounded overflow-hidden">
      <table class="w-full">
        <thead>
          <tr class="border-b border-[#E0E0E0] bg-gray-100">
            <th class="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#757575]">Nome</th>
            <th class="text-left px-4 py-4 text-[10px] font-black uppercase tracking-widest text-[#757575] hidden sm:table-cell">E-mail</th>
            <th class="text-left px-4 py-4 text-[10px] font-black uppercase tracking-widest text-[#757575]">Status</th>
            <th class="text-left px-4 py-4 text-[10px] font-black uppercase tracking-widest text-[#757575] hidden md:table-cell">Criado em</th>
            <th class="px-6 py-4"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-[#E0E0E0]">
          <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50 transition-colors">
            <td class="px-6 py-4">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded bg-accent-light border border-accent/30 flex items-center justify-center">
                  <ShieldAlert :size="15" class="text-accent" />
                </div>
                <span class="font-bold text-[#212121] text-sm">{{ user.name }}</span>
              </div>
            </td>
            <td class="px-4 py-4 hidden sm:table-cell">
              <span class="text-[#757575] text-sm">{{ user.email }}</span>
            </td>
            <td class="px-4 py-4">
              <button
                @click="toggleStatus(user)"
                class="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded border cursor-pointer transition-all"
                :class="user.status === 'ativo'
                  ? 'text-accent bg-accent-light border-accent/25 hover:bg-primary-dark/20'
                  : 'text-[#757575] bg-gray-200/20 border-[#E0E0E0] hover:bg-gray-200/30'"
              >
                <UserCheck v-if="user.status === 'ativo'" :size="10" />
                <UserX v-else :size="10" />
                {{ user.status }}
              </button>
            </td>
            <td class="px-4 py-4 hidden md:table-cell">
              <span class="text-[#757575] text-sm">{{ formatDate(user.createdAt) }}</span>
            </td>
            <td class="px-6 py-4">
              <div class="flex items-center justify-end gap-2">
                <button @click="openEdit(user)" class="p-2 rounded text-[#757575] hover:text-[#212121] hover:bg-gray-100 transition-all" title="Editar">
                  <Pencil :size="15" />
                </button>
                <button @click="deleteUser(user)" class="p-2 rounded text-[#757575] hover:text-danger hover:bg-danger-light transition-all" title="Excluir">
                  <Trash2 :size="15" />
                </button>
              </div>
            </td>
          </tr>

          <tr v-if="!users.length">
            <td colspan="5" class="px-6 py-16 text-center text-[#757575]">
              <ShieldAlert :size="32" class="mx-auto mb-3 opacity-30" />
              <p class="text-sm font-bold">Nenhum usuário admin cadastrado</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

  </main>

  <!-- Modal -->
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="isModalOpen" class="fixed inset-0 bg-black/50  z-[100] flex items-center justify-center p-4">
        <div class="bg-white border border-[#E0E0E0] w-full max-w-md rounded shadow-2xl">

          <div class="p-8 border-b border-[#E0E0E0] flex justify-between items-center bg-gray-100">
            <h2 class="text-xl font-black text-[#212121] flex items-center gap-3">
              <ShieldAlert :size="20" class="text-accent" />
              {{ isEditing ? 'Editar Admin' : 'Novo Admin' }}
            </h2>
            <button @click="isModalOpen = false" class="p-2 text-[#757575] hover:text-[#212121]">
              <X :size="20" />
            </button>
          </div>

          <div class="p-8 space-y-5">
            <!-- Name -->
            <div>
              <label class="text-xs font-black uppercase tracking-widest text-[#757575] ml-2 mb-2 block">Nome</label>
              <input
                v-model="form.name"
                type="text"
                placeholder="Ex: Admin Suporte"
                class="w-full bg-gray-50 border rounded px-4 py-3.5 text-sm text-[#212121] outline-none placeholder:text-[#757575] transition-colors"
                :class="errors.name ? 'border-danger' : 'border-[#E0E0E0] focus:border-primary/40'"
                @input="delete errors.name"
              />
              <p v-if="errors.name" class="text-danger text-xs font-bold mt-1 ml-2">{{ errors.name }}</p>
            </div>

            <!-- Email -->
            <div>
              <label class="text-xs font-black uppercase tracking-widest text-[#757575] ml-2 mb-2 block">E-mail</label>
              <div class="relative">
                <Mail :size="16" class="absolute left-4 top-1/2 -translate-y-1/2 text-[#757575]" />
                <input
                  v-model="form.email"
                  type="email"
                  placeholder="admin@empresa.com"
                  class="w-full bg-gray-50 border rounded pl-10 pr-4 py-3.5 text-sm text-[#212121] outline-none placeholder:text-[#757575] transition-colors"
                  :class="errors.email ? 'border-danger' : 'border-[#E0E0E0] focus:border-primary/40'"
                  @input="delete errors.email"
                />
              </div>
              <p v-if="errors.email" class="text-danger text-xs font-bold mt-1 ml-2">{{ errors.email }}</p>
            </div>

            <!-- Password -->
            <div>
              <label class="text-xs font-black uppercase tracking-widest text-[#757575] ml-2 mb-2 block">
                {{ isEditing ? 'Nova Senha (deixe em branco para manter)' : 'Senha' }}
              </label>
              <div class="relative">
                <KeyRound :size="16" class="absolute left-4 top-1/2 -translate-y-1/2 text-[#757575]" />
                <input
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Mínimo 6 caracteres"
                  class="w-full bg-gray-50 border rounded pl-10 pr-12 py-3.5 text-sm text-[#212121] outline-none placeholder:text-[#757575] transition-colors"
                  :class="errors.password ? 'border-danger' : 'border-[#E0E0E0] focus:border-primary/40'"
                  @input="delete errors.password"
                />
                <button type="button" @click="showPassword = !showPassword"
                  class="absolute right-4 top-1/2 -translate-y-1/2 text-[#757575] hover:text-[#757575] transition-colors">
                  <Eye v-if="!showPassword" :size="16" />
                  <EyeOff v-else :size="16" />
                </button>
              </div>
              <p v-if="errors.password" class="text-danger text-xs font-bold mt-1 ml-2">{{ errors.password }}</p>
            </div>

            <!-- Status (edit only) -->
            <div v-if="isEditing">
              <label class="text-xs font-black uppercase tracking-widest text-[#757575] ml-2 mb-2 block">Status</label>
              <div class="flex gap-3">
                <button v-for="s in ['ativo', 'inativo']" :key="s" @click="form.status = s"
                  :class="form.status === s
                    ? (s === 'ativo' ? 'border-accent bg-accent-light text-accent' : 'border-danger bg-danger-light text-danger')
                    : 'border-[#E0E0E0] bg-gray-50 text-[#757575]'"
                  class="flex-1 py-2.5 rounded border text-xs font-black uppercase tracking-wider transition-all capitalize">
                  {{ s }}
                </button>
              </div>
            </div>
          </div>

          <div class="p-8 pt-0 flex gap-3">
            <button @click="isModalOpen = false" class="flex-1 py-3 rounded text-[#757575] font-bold hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button
              @click="saveUser"
              :disabled="isLoading"
              class="flex-1 py-3 rounded bg-primary text-white font-black hover:bg-primary-dark transition-all disabled:opacity-50"
            >
              {{ isLoading ? 'Salvando...' : (isEditing ? 'Salvar' : 'Criar Admin') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
