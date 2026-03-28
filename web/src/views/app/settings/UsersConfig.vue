<script setup>
import { ref, onMounted, computed, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { isValidCPF, maskCPF } from '@/utils/validator';
import { useToast } from '@/composables/useToast';
import BaseInput from '@/components/ui/BaseInput.vue';
import BaseSelect from '@/components/ui/BaseSelect.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import { ArrowLeft, PlusCircle, Trash, Pencil, X } from 'lucide-vue-next';
import { getRolesMock, initMockRoles } from '@/mock/authmock';

const USERS_KEY = 'users';

const router = useRouter();
const authStore = useAuthStore();
const { showToast } = useToast();

const users = ref([]);
const roles = ref([]);
const isLoading = ref(false);
const showForm = ref(false);
const editingUser = ref(null);
const errors = ref({});
const confirmDeleteUser = ref(null);

const currentUser = computed(() => authStore.user);

const form = ref({
  id: null,
  name: '',
  username: '',
  email: '',
  cpf: '',
  password: '',
  roleId: '',
});

const roleOptions = computed(() =>
  roles.value.map(r => ({ label: r.name, value: r.id }))
);


onMounted(() => {
  initMockRoles();
  loadUsers();
  roles.value = getRolesMock();
});

function reloadRoles() {
  roles.value = getRolesMock();
}

function loadUsers() {
  users.value = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
}

function openForm(user = null) {
  errors.value = {};
  reloadRoles();
  showForm.value = true;
  if (user) {
    editingUser.value = user.id;
    form.value = { ...user, roleId: user.roleId != null ? String(user.roleId) : '' };
  } else {
    editingUser.value = null;
    form.value = { id: null, name: '', username: '', email: '', cpf: '', password: '', roleId: '' };
  }
}

function closeForm() {
  showForm.value = false;
  editingUser.value = null;
  errors.value = {};
}

function validateForm() {
  errors.value = {};
  if (!form.value.name || form.value.name.trim().length < 5)
    errors.value.name = 'Nome deve ter ao menos 5 caracteres.';
  if (!form.value.username || form.value.username.trim().length < 3)
    errors.value.username = 'Nome de usuário deve ter ao menos 3 caracteres.';
  if (form.value.cpf && !isValidCPF(form.value.cpf))
    errors.value.cpf = 'O CPF inserido é inválido.';
  if (!editingUser.value && !form.value.password)
    errors.value.password = 'Senha é obrigatória.';
  if (form.value.password && form.value.password.length < 6)
    errors.value.password = 'Senha deve ter ao menos 6 caracteres.';
  if (!form.value.roleId)
    errors.value.roleId = 'Selecione um cargo.';
  return Object.keys(errors.value).length === 0;
}

function saveUser() {
  if (!validateForm()) {
    showToast('Corrija os erros no formulário.', 'error');
    return;
  }

  const list = JSON.parse(localStorage.getItem(USERS_KEY)) || [];

  const duplicate = list.find(u =>
    u.username === form.value.username.trim() && u.id !== form.value.id
  );
  if (duplicate) {
    errors.value.username = 'Este nome de usuário já está em uso.';
    showToast('Nome de usuário já existe.', 'error');
    return;
  }

  isLoading.value = true;

  const userToSave = { ...form.value, roleId: form.value.roleId ? Number(form.value.roleId) : null };

  if (form.value.id) {
    const index = list.findIndex(u => u.id === form.value.id);
    if (form.value.id === currentUser.value?.id) userToSave.roleId = list[index].roleId;
    list[index] = { ...list[index], ...userToSave };
  } else {
    list.push({ ...userToSave, id: Date.now(), status: 'ATIVO' });
  }

  localStorage.setItem(USERS_KEY, JSON.stringify(list));
  loadUsers();
  closeForm();
  showToast('Usuário salvo com sucesso!', 'success');
  isLoading.value = false;
}

function confirmAndDeleteUser() {
  const user = confirmDeleteUser.value;
  if (!user || user.id === currentUser.value?.id) return;
  const list = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
  localStorage.setItem(USERS_KEY, JSON.stringify(list.filter(u => u.id !== user.id)));
  loadUsers();
  showToast('Usuário removido.', 'success');
  confirmDeleteUser.value = null;
}

// Aplica máscara de CPF reativamente — bloqueia letras sem travar o campo
watch(() => form.value.cpf, (val) => {
  if (!val) return;
  const masked = maskCPF(val);
  if (masked !== val) {
    nextTick(() => { form.value.cpf = masked; });
  }
});

function isActive(status) {
  if (!status) return true;
  return status.toString().trim().toUpperCase() === 'ATIVO';
}
</script>

<template>
  <main class="max-w-6xl mx-auto py-12 px-6 font-inter">
    
    <header class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-6">
      <div class="flex items-center gap-4">
        <button @click="router.back()" class="p-3 bg-gray-50 border border-[#E0E0E0] rounded text-[#757575] hover:text-[#212121] transition-colors">
          <ArrowLeft :size="20" />
        </button>
        <div>
          <h1 class="text-3xl font-black text-[#212121]">Usuários</h1>
          <p class="text-[#757575] text-sm">Gerencie o acesso da sua equipe</p>
        </div>
      </div>

      <BaseButton v-if="!showForm" @click="openForm()" :icon="PlusCircle" class="w-full sm:w-auto">
        Novo Usuário
      </BaseButton>
    </header>

    <Transition name="fade">
      <div v-if="showForm" class="bg-white border border-[#E0E0E0] p-8 rounded shadow-2xl mb-10 relative overflow-hidden">
        <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-green to-transparent opacity-50"></div>
        
        <div class="flex justify-between items-center mb-8">
          <h2 class="text-2xl font-black text-[#212121] flex items-center gap-3">
            <component :is="editingUser ? Pencil : PlusCircle" :size="24" class="text-accent" />
            {{ editingUser ? 'Editar Usuário' : 'Cadastrar Usuário' }}
          </h2>
          <button @click="closeForm" class="p-2 text-[#757575] hover:text-[#212121] transition-colors">
            <X :size="24" />
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <BaseInput
            v-model="form.name"
            label="Nome Completo"
            placeholder="Ex: João Silva"
            :error="errors.name"
          />
          <BaseInput
            v-model="form.username"
            label="Nome de Usuário"
            placeholder="ex: joao_silva"
            :error="errors.username"
          />
          <BaseInput
            v-model="form.cpf"
            label="CPF"
            placeholder="000.000.000-00"
            :error="errors.cpf"
          />
          <BaseInput
            v-model="form.password"
            label="Senha"
            type="password"
            :placeholder="editingUser ? 'Deixe em branco para manter' : '••••••••'"
            :error="errors.password"
          />
          <div class="md:col-span-2">
            <BaseSelect
              v-model="form.roleId"
              label="Cargo"
              :options="roleOptions"
              placeholder="Selecione o cargo"
              :error="errors.roleId"
              :disabled="editingUser === currentUser?.id"
            />
          </div>

          <div class="md:col-span-2 flex justify-end gap-4 mt-4 pt-8 border-t border-[#E0E0E0]">
            <button type="button" @click="closeForm" class="px-8 py-4 rounded text-[#757575] font-bold hover:bg-gray-50 hover:text-[#212121] transition-colors">
              Cancelar
            </button>
            <BaseButton @click="saveUser" :isLoading="isLoading" class="px-8 py-4">
              Salvar Usuário
            </BaseButton>
          </div>
        </div>
      </div>
    </Transition>

    <div class="hidden md:block bg-white border border-[#E0E0E0] rounded overflow-hidden shadow-2xl">
      <table class="w-full text-left border-collapse">
        <thead class="bg-gray-100 text-[#757575] uppercase text-[10px] font-black tracking-widest border-b border-[#E0E0E0]">
          <tr>
            <th class="p-6">Nome</th>
            <th class="p-6">Usuário</th>
            <th class="p-6 text-center">Status</th>
            <th class="p-6 text-center">Cargo</th>
            <th class="p-6 text-right">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50 border-b border-[#E0E0E0] last:border-0 transition-colors">
            <td class="p-6 font-bold text-[#212121]">{{ user.name }}</td>
            <td class="p-6 text-[#757575] text-sm">{{ user.username || user.email }}</td>
            <td class="p-6 text-center">
              <span
                :class="isActive(user.status) ? 'bg-accent-light text-accent border-accent/30' : 'bg-danger-light text-red-500 border-danger'"
                class="px-3 py-1 border rounded text-[10px] font-black uppercase tracking-widest"
              >
                {{ user.status || 'ATIVO' }}
              </span>
            </td>
            <td class="p-6 text-center font-bold text-[#757575] text-sm">
              {{ roles.find(r => r.id === user.roleId)?.name || '-' }}
            </td>
            <td class="p-6 text-right">
              <div class="flex justify-end gap-2">
                <button @click="openForm(user)" class="p-2 text-[#757575] hover:text-[#212121] hover:bg-gray-50 rounded transition-all">
                  <Pencil :size="18" />
                </button>
                <button
                  v-if="user.id !== currentUser?.id"
                  @click="confirmDeleteUser = user"
                  class="p-2 text-[#757575] hover:text-red-500 hover:bg-danger-light rounded transition-all"
                >
                  <Trash :size="18" />
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="users.length === 0">
            <td colspan="5" class="p-12 text-center text-[#757575] text-sm font-bold">Nenhum usuário cadastrado.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="md:hidden space-y-4">
      <div v-for="user in users" :key="user.id" class="bg-white border border-[#E0E0E0] p-6 rounded shadow-xl">
        <div class="flex justify-between items-start mb-4">
          <div>
            <p class="font-bold text-[#212121] text-lg">{{ user.name }}</p>
            <p class="text-sm text-[#757575] mt-1">@{{ user.username || user.email }}</p>
          </div>
          <span
            :class="isActive(user.status) ? 'bg-accent-light text-accent border-accent/30' : 'bg-danger-light text-red-500 border-danger'"
            class="px-2 py-1 border rounded text-[9px] font-black uppercase tracking-widest"
          >
            {{ user.status || 'ATIVO' }}
          </span>
        </div>

        <div class="flex justify-between items-center mt-6 pt-4 border-t border-[#E0E0E0]">
          <span class="text-[10px] font-black uppercase tracking-widest text-[#757575] bg-gray-50 px-3 py-1 rounded border border-[#E0E0E0]">
            {{ roles.find(r => r.id === user.roleId)?.name || '-' }}
          </span>
          <div class="flex gap-2">
            <button @click="openForm(user)" class="p-2 text-[#757575] hover:text-[#212121] bg-gray-50 rounded">
              <Pencil :size="18" />
            </button>
            <button v-if="user.id !== currentUser?.id" @click="confirmDeleteUser = user" class="p-2 text-red-500 bg-danger-light rounded">
              <Trash :size="18" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </main>

  <Teleport to="body">
    <Transition name="fade">
      <div v-if="confirmDeleteUser" class="fixed inset-0 bg-black/50  z-[110] flex items-center justify-center p-4">
        <div class="bg-white border border-[#E0E0E0] w-full max-w-sm rounded p-8 shadow-2xl">
          <div class="flex items-start gap-4 mb-6">
            <div class="p-3 bg-danger-light rounded border border-danger shrink-0">
              <Trash :size="20" class="text-danger" />
            </div>
            <div>
              <p class="text-[#212121] font-black text-base">Excluir usuário?</p>
              <p class="text-[#757575] text-sm mt-1"><span class="text-[#212121] font-bold">{{ confirmDeleteUser.name }}</span> será removido permanentemente.</p>
            </div>
          </div>
          <div class="flex gap-3">
            <button @click="confirmDeleteUser = null" class="flex-1 py-3 rounded text-[#757575] font-bold hover:bg-gray-50 transition-colors border border-[#E0E0E0]">Cancelar</button>
            <button @click="confirmAndDeleteUser" class="flex-1 py-3 rounded bg-danger text-white font-black hover:bg-red-400 transition-colors">Excluir</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-10px); }
</style>
