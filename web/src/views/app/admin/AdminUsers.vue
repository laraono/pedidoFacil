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
        <button @click="router.push('/app/dashboard')" class="p-3 bg-white/5 border border-white/10 rounded-2xl text-gray-400 hover:text-white transition-colors">
          <ArrowLeft :size="20" />
        </button>
        <div>
          <div class="flex items-center gap-2 mb-1">
            <ShieldAlert :size="16" class="text-brand-green" />
            <span class="text-xs font-black text-brand-green uppercase tracking-widest">Painel Admin</span>
          </div>
          <h1 class="text-3xl font-black text-white">Usuários Admin</h1>
          <p class="text-gray-400 text-sm">Gerenciar contas com acesso ao painel administrativo</p>
        </div>
      </div>
      <button
        @click="openCreate"
        class="flex items-center gap-2 px-5 py-3 bg-brand-green text-black font-black rounded-2xl hover:bg-brand-green/90 transition-all text-sm"
      >
        <Plus :size="16" /> Novo Admin
      </button>
    </header>

    <!-- Table -->
    <div class="bg-dark-card border border-white/10 rounded-[2rem] overflow-hidden">
      <table class="w-full">
        <thead>
          <tr class="border-b border-white/5 bg-black/20">
            <th class="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Nome</th>
            <th class="text-left px-4 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 hidden sm:table-cell">E-mail</th>
            <th class="text-left px-4 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Status</th>
            <th class="text-left px-4 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 hidden md:table-cell">Criado em</th>
            <th class="px-6 py-4"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-white/5">
          <tr v-for="user in users" :key="user.id" class="hover:bg-white/[0.02] transition-colors">
            <td class="px-6 py-4">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-brand-green/10 border border-brand-green/20 flex items-center justify-center">
                  <ShieldAlert :size="15" class="text-brand-green" />
                </div>
                <span class="font-bold text-white text-sm">{{ user.name }}</span>
              </div>
            </td>
            <td class="px-4 py-4 hidden sm:table-cell">
              <span class="text-zinc-400 text-sm">{{ user.email }}</span>
            </td>
            <td class="px-4 py-4">
              <button
                @click="toggleStatus(user)"
                class="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border cursor-pointer transition-all"
                :class="user.status === 'ativo'
                  ? 'text-brand-green bg-brand-green/10 border-brand-green/25 hover:bg-brand-green/20'
                  : 'text-zinc-500 bg-zinc-700/20 border-zinc-600/20 hover:bg-zinc-700/30'"
              >
                <UserCheck v-if="user.status === 'ativo'" :size="10" />
                <UserX v-else :size="10" />
                {{ user.status }}
              </button>
            </td>
            <td class="px-4 py-4 hidden md:table-cell">
              <span class="text-zinc-500 text-sm">{{ formatDate(user.createdAt) }}</span>
            </td>
            <td class="px-6 py-4">
              <div class="flex items-center justify-end gap-2">
                <button @click="openEdit(user)" class="p-2 rounded-xl text-zinc-500 hover:text-white hover:bg-white/10 transition-all" title="Editar">
                  <Pencil :size="15" />
                </button>
                <button @click="deleteUser(user)" class="p-2 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all" title="Excluir">
                  <Trash2 :size="15" />
                </button>
              </div>
            </td>
          </tr>

          <tr v-if="!users.length">
            <td colspan="5" class="px-6 py-16 text-center text-zinc-600">
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
      <div v-if="isModalOpen" class="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
        <div class="bg-zinc-900 border border-white/10 w-full max-w-md rounded-[2.5rem] shadow-2xl">

          <div class="p-8 border-b border-white/5 flex justify-between items-center bg-black/20">
            <h2 class="text-xl font-black text-white flex items-center gap-3">
              <ShieldAlert :size="20" class="text-brand-green" />
              {{ isEditing ? 'Editar Admin' : 'Novo Admin' }}
            </h2>
            <button @click="isModalOpen = false" class="p-2 text-gray-400 hover:text-white">
              <X :size="20" />
            </button>
          </div>

          <div class="p-8 space-y-5">
            <!-- Name -->
            <div>
              <label class="text-xs font-black uppercase tracking-widest text-zinc-500 ml-2 mb-2 block">Nome</label>
              <input
                v-model="form.name"
                type="text"
                placeholder="Ex: Admin Suporte"
                class="w-full bg-white/5 border rounded-2xl px-4 py-3.5 text-sm text-white outline-none placeholder:text-zinc-600 transition-colors"
                :class="errors.name ? 'border-red-500/50' : 'border-white/10 focus:border-brand-green/40'"
                @input="delete errors.name"
              />
              <p v-if="errors.name" class="text-red-400 text-xs font-bold mt-1 ml-2">{{ errors.name }}</p>
            </div>

            <!-- Email -->
            <div>
              <label class="text-xs font-black uppercase tracking-widest text-zinc-500 ml-2 mb-2 block">E-mail</label>
              <div class="relative">
                <Mail :size="16" class="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  v-model="form.email"
                  type="email"
                  placeholder="admin@empresa.com"
                  class="w-full bg-white/5 border rounded-2xl pl-10 pr-4 py-3.5 text-sm text-white outline-none placeholder:text-zinc-600 transition-colors"
                  :class="errors.email ? 'border-red-500/50' : 'border-white/10 focus:border-brand-green/40'"
                  @input="delete errors.email"
                />
              </div>
              <p v-if="errors.email" class="text-red-400 text-xs font-bold mt-1 ml-2">{{ errors.email }}</p>
            </div>

            <!-- Password -->
            <div>
              <label class="text-xs font-black uppercase tracking-widest text-zinc-500 ml-2 mb-2 block">
                {{ isEditing ? 'Nova Senha (deixe em branco para manter)' : 'Senha' }}
              </label>
              <div class="relative">
                <KeyRound :size="16" class="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Mínimo 6 caracteres"
                  class="w-full bg-white/5 border rounded-2xl pl-10 pr-12 py-3.5 text-sm text-white outline-none placeholder:text-zinc-600 transition-colors"
                  :class="errors.password ? 'border-red-500/50' : 'border-white/10 focus:border-brand-green/40'"
                  @input="delete errors.password"
                />
                <button type="button" @click="showPassword = !showPassword"
                  class="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors">
                  <Eye v-if="!showPassword" :size="16" />
                  <EyeOff v-else :size="16" />
                </button>
              </div>
              <p v-if="errors.password" class="text-red-400 text-xs font-bold mt-1 ml-2">{{ errors.password }}</p>
            </div>

            <!-- Status (edit only) -->
            <div v-if="isEditing">
              <label class="text-xs font-black uppercase tracking-widest text-zinc-500 ml-2 mb-2 block">Status</label>
              <div class="flex gap-3">
                <button v-for="s in ['ativo', 'inativo']" :key="s" @click="form.status = s"
                  :class="form.status === s
                    ? (s === 'ativo' ? 'border-brand-green bg-brand-green/10 text-brand-green' : 'border-red-500/40 bg-red-500/10 text-red-400')
                    : 'border-white/10 bg-white/5 text-zinc-400'"
                  class="flex-1 py-2.5 rounded-2xl border text-xs font-black uppercase tracking-wider transition-all capitalize">
                  {{ s }}
                </button>
              </div>
            </div>
          </div>

          <div class="p-8 pt-0 flex gap-3">
            <button @click="isModalOpen = false" class="flex-1 py-3 rounded-2xl text-zinc-400 font-bold hover:bg-white/5 transition-colors">
              Cancelar
            </button>
            <button
              @click="saveUser"
              :disabled="isLoading"
              class="flex-1 py-3 rounded-2xl bg-brand-green text-black font-black hover:bg-brand-green/90 transition-all disabled:opacity-50"
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
