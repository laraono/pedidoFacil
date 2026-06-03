<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from '@/composables/useToast';
import {
  ArrowLeft, ShieldAlert, Plus, Trash2, Pencil, X,
  Eye, EyeOff, KeyRound, Mail
} from 'lucide-vue-next';
import { adminUserApi } from '@/services/adminApi';
import { validatePasswordStrength } from '@/utils/password';

const router = useRouter();
const { showToast } = useToast();

const users = ref([]);
const loading = ref(false);
const saving = ref(false);
const isModalOpen = ref(false);
const isEditing = ref(false);
const showPassword = ref(false);
const deleteTarget = ref(null);
const confirmDelete = ref(false);

const form = ref({ id: null, name: '', email: '', password: '' });
const errors = ref({});

async function load() {
  loading.value = true;
  try {
    users.value = await adminUserApi.list();
  } catch (e) {
    showToast('Erro ao carregar usuários admin.', 'error');
  } finally {
    loading.value = false;
  }
}

onMounted(load);

function openCreate() {
  form.value = { id: null, name: '', email: '', password: '' };
  errors.value = {};
  isEditing.value = false;
  showPassword.value = false;
  isModalOpen.value = true;
}

function openEdit(user) {
  form.value = { id: user.id, name: user.name, email: user.email, password: '' };
  errors.value = {};
  isEditing.value = true;
  showPassword.value = false;
  isModalOpen.value = true;
}

function validate() {
  const e = {};
  if (!form.value.name.trim()) e.name = 'Nome é obrigatório.';
  if (!form.value.email.trim() || !form.value.email.includes('@')) e.email = 'E-mail inválido.';
  if (!isEditing.value && !form.value.password.trim()) e.password = 'Senha é obrigatória.';
  else if (form.value.password) { const err = validatePasswordStrength(form.value.password); if (err) e.password = err; }
  errors.value = e;
  return Object.keys(e).length === 0;
}

async function save() {
  if (!validate()) return;
  saving.value = true;
  const payload = { name: form.value.name.trim(), email: form.value.email.trim() };
  if (form.value.password) payload.password = form.value.password;
  try {
    if (isEditing.value) {
      await adminUserApi.update(form.value.id, payload);
      showToast('Admin atualizado!', 'success');
    } else {
      payload.password = form.value.password;
      await adminUserApi.create(payload);
      showToast('Admin criado!', 'success');
    }
    isModalOpen.value = false;
    await load();
  } catch (e) {
    showToast(e?.message || 'Erro ao salvar admin.', 'error');
  } finally {
    saving.value = false;
  }
}

function askDelete(user) {
  deleteTarget.value = user;
  confirmDelete.value = true;
}

async function doDelete() {
  if (!deleteTarget.value) return;
  try {
    await adminUserApi.delete(deleteTarget.value.id);
    showToast(`"${deleteTarget.value.name}" removido.`, 'success');
    await load();
  } catch (e) {
    showToast('Erro ao remover admin.', 'error');
  } finally {
    confirmDelete.value = false;
    deleteTarget.value = null;
  }
}
</script>

<template>
  <main class="max-w-5xl mx-auto py-12 px-6 font-inter">
    <header class="flex items-center justify-between gap-4 mb-10">
      <div class="flex items-center gap-4">
        <button @click="router.push('/app/admin/subscriptions')" class="p-3 bg-gray-50 border border-[#E0E0E0] rounded text-[#757575] hover:text-[#212121] transition-colors">
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
      <button @click="openCreate" class="flex items-center gap-2 px-5 py-3 bg-primary text-white font-black rounded hover:bg-primary-dark transition-all text-sm">
        <Plus :size="16" /> Novo Admin
      </button>
    </header>

    <div v-if="loading" class="py-20 text-center text-[#757575]">Carregando...</div>

    <div v-else class="bg-white border border-[#E0E0E0] rounded overflow-hidden">
      <table class="w-full">
        <thead>
          <tr class="border-b border-[#E0E0E0] bg-gray-100">
            <th class="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#757575]">Nome</th>
            <th class="text-left px-4 py-4 text-[10px] font-black uppercase tracking-widest text-[#757575] hidden sm:table-cell">E-mail</th>
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
            <td class="px-6 py-4">
              <div class="flex items-center justify-end gap-2">
                <button @click="openEdit(user)" class="p-2 rounded text-[#757575] hover:text-[#212121] hover:bg-gray-100 transition-all">
                  <Pencil :size="15" />
                </button>
                <button @click="askDelete(user)" class="p-2 rounded text-[#757575] hover:text-red-500 hover:bg-red-50 transition-all">
                  <Trash2 :size="15" />
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="!users.length">
            <td colspan="3" class="px-6 py-16 text-center text-[#757575]">
              <ShieldAlert :size="32" class="mx-auto mb-3 opacity-30" />
              <p class="text-sm font-bold">Nenhum usuário admin cadastrado</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </main>

  <Teleport to="body">
    <Transition name="fade">
      <div v-if="isModalOpen" class="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
        <div class="bg-white border border-[#E0E0E0] w-full max-w-md rounded-xl shadow-2xl">
          <div class="p-6 border-b border-[#E0E0E0] flex justify-between items-center bg-gray-50">
            <h2 class="text-xl font-black text-[#212121] flex items-center gap-3">
              <ShieldAlert :size="20" class="text-accent" />
              {{ isEditing ? 'Editar Admin' : 'Novo Admin' }}
            </h2>
            <button @click="isModalOpen = false" class="p-2 text-[#757575] hover:text-[#212121]"><X :size="20" /></button>
          </div>
          <div class="p-6 space-y-5">
            <div>
              <label class="text-xs font-black uppercase tracking-widest text-[#757575] ml-1 mb-2 block">Nome</label>
              <input v-model="form.name" type="text" placeholder="Ex: Admin Suporte"
                class="w-full bg-gray-50 border rounded-lg px-4 py-3 text-sm text-[#212121] outline-none placeholder:text-[#757575] transition-colors"
                :class="errors.name ? 'border-red-400' : 'border-[#E0E0E0] focus:border-primary/40'"
                @input="delete errors.name" />
              <p v-if="errors.name" class="text-red-500 text-xs font-bold mt-1 ml-1">{{ errors.name }}</p>
            </div>
            <div>
              <label class="text-xs font-black uppercase tracking-widest text-[#757575] ml-1 mb-2 block">E-mail</label>
              <div class="relative">
                <Mail :size="15" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#757575]" />
                <input v-model="form.email" type="email" placeholder="admin@empresa.com"
                  class="w-full bg-gray-50 border rounded-lg pl-9 pr-4 py-3 text-sm text-[#212121] outline-none placeholder:text-[#757575] transition-colors"
                  :class="errors.email ? 'border-red-400' : 'border-[#E0E0E0] focus:border-primary/40'"
                  @input="delete errors.email" />
              </div>
              <p v-if="errors.email" class="text-red-500 text-xs font-bold mt-1 ml-1">{{ errors.email }}</p>
            </div>
            <div>
              <label class="text-xs font-black uppercase tracking-widest text-[#757575] ml-1 mb-2 block">
                {{ isEditing ? 'Nova Senha (deixe em branco para manter)' : 'Senha' }}
              </label>
              <div class="relative">
                <KeyRound :size="15" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#757575]" />
                <input v-model="form.password" :type="showPassword ? 'text' : 'password'" placeholder="Mínimo 8 caracteres"
                  class="w-full bg-gray-50 border rounded-lg pl-9 pr-10 py-3 text-sm text-[#212121] outline-none placeholder:text-[#757575] transition-colors"
                  :class="errors.password ? 'border-red-400' : 'border-[#E0E0E0] focus:border-primary/40'"
                  @input="delete errors.password" />
                <button type="button" @click="showPassword = !showPassword"
                  class="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#757575] hover:text-[#212121] transition-colors">
                  <Eye v-if="!showPassword" :size="15" /><EyeOff v-else :size="15" />
                </button>
              </div>
              <p v-if="errors.password" class="text-red-500 text-xs font-bold mt-1 ml-1">{{ errors.password }}</p>
            </div>
          </div>
          <div class="p-6 pt-0 flex gap-3">
            <button @click="isModalOpen = false" class="flex-1 py-3 rounded-lg text-[#757575] font-bold hover:bg-gray-50 transition-colors">Cancelar</button>
            <button @click="save" :disabled="saving"
              class="flex-1 py-3 rounded-lg bg-primary text-white font-black hover:bg-primary-dark transition-all disabled:opacity-50">
              {{ saving ? 'Salvando...' : (isEditing ? 'Salvar' : 'Criar Admin') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <Teleport to="body">
    <Transition name="fade">
      <div v-if="confirmDelete" class="fixed inset-0 bg-black/50 z-[110] flex items-center justify-center p-4">
        <div class="bg-white border border-[#E0E0E0] w-full max-w-sm rounded-xl shadow-2xl p-8 text-center">
          <div class="w-14 h-14 rounded-full bg-red-50 border border-red-200 flex items-center justify-center mx-auto mb-5">
            <Trash2 :size="24" class="text-red-500" />
          </div>
          <h3 class="text-xl font-black text-[#212121] mb-2">Remover Admin?</h3>
          <p class="text-[#757575] text-sm mb-6">O usuário <strong>"{{ deleteTarget?.name }}"</strong> será removido permanentemente.</p>
          <div class="flex gap-3">
            <button @click="confirmDelete = false; deleteTarget = null" class="flex-1 py-3 rounded-lg font-bold text-[#757575] border border-[#E0E0E0] hover:bg-gray-50 transition-colors">Cancelar</button>
            <button @click="doDelete" class="flex-1 py-3 rounded-lg bg-red-500 text-white font-black hover:bg-red-600 transition-all">Remover</button>
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