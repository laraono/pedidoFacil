<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { isValidCPF, maskCPF } from '@/utils/validator';
import { ArrowLeft, PlusCircle, Trash, Pencil, X, CircleX} from 'lucide-vue-next';
import { getRolesMock, initMockRoles } from '@/mock/authmock'; 

const USERS_KEY = "users";

const router = useRouter();
const authStore = useAuthStore();

const users = ref([]);
const roles = ref([]);
const isLoading = ref(false);
const showForm = ref(false);
const editingUser = ref(null);

const errors = ref({
  name: null,
  email: null,
  cpf: null,
  password: null,
  roleId: null
});

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
      errors.value.cpf = null;
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
  errors.value = {
    name: null,
    email: null,
    cpf: null,
    password: null,
    roleId: null
  };

  let hasError = false;

  if (!form.value.name || form.value.name.trim().length < 5) {
    errors.value.name = 'O nome deve ter pelo menos 5 caracteres.';
    hasError = true;
  }

  if (!form.value.email) {
    errors.value.email = 'Informe um email.';
    hasError = true;
  } else if (!isValidEmail(form.value.email)) {
    errors.value.email = 'O email informado não é válido.';
    hasError = true;
  }

  if (!form.value.cpf || !isValidCPF(form.value.cpf)) {
    errors.value.cpf = 'O CPF inserido é inválido.';
    hasError = true;
  }

  if (!form.value.password || form.value.password.length < 6) {
    errors.value.password = 'A senha deve ter pelo menos 6 caracteres.';
    hasError = true;
  }

  if (!form.value.roleId) {
    errors.value.roleId = 'Selecione um cargo.';
    hasError = true;
  }

  if (hasError) return;

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

function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}
</script>

<template>
  <main class="max-w-5xl mx-auto py-6 md:py-12 px-3 md:px-4 text-black">
    <div class="flex flex-col sm:flex-row sm:items-center mb-6 gap-4">
      <button @click="router.back()" class="p-2 text-black mr-4 outline-none">
        <ArrowLeft :size="28" />
      </button>

      <h1 class="text-3xl font-bold text-black tracking-tight">
        Usuários
      </h1>

      <button
        @click="openForm()"
        class="sm:ml-auto flex items-center justify-center bg-brand-green text-white px-5 py-2.5 rounded-xl font-bold hover:bg-brand-green-hover"
      >
        <PlusCircle :size="18" class="mr-2" />
        Novo Usuário
      </button>
    </div>

    <div v-if="showForm" class="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-100 mb-8">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-bold text-black">
          {{ editingUser ? 'Editar Usuário' : 'Cadastrar Usuário' }}
        </h2>
        <button @click="closeForm" class="text-gray-400 hover:text-black transition-colors">
          <X :size="24" />
        </button>
      </div>

      <form @submit.prevent="saveUser" novalidate class="grid grid-cols-1 md:grid-cols-2 gap-6">

        <div>
          <label class="block font-bold mb-1.5 text-gray-700 ml-1">Nome Completo</label>
          <input v-model="form.name" type="text" maxlength="100"
                 placeholder="Ex: João Silva"
                 class="w-full p-3 border border-gray-300 rounded-xl text-black focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none transition-all" />
          <p v-if="errors.name" class="text-red-500 text-sm mt-2 font-medium flex items-center gap-1">
            <CircleX :size="14" /> {{ errors.name }}
          </p>
        </div>

        <div>
          <label class="block font-bold mb-1.5 text-gray-700 ml-1">Email Profissional</label>
          <input v-model="form.email" type="email"
                 maxlength="255"
                 placeholder="exemplo@email.com"
                 class="w-full p-3 border border-gray-300 rounded-xl text-black focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none transition-all" />
          <p v-if="errors.email" class="text-red-500 text-sm mt-2 font-medium flex items-center gap-1">
            <CircleX :size="14" /> {{ errors.email }}
          </p>
        </div>

        <div>
          <label class="block font-bold mb-1.5 text-gray-700 ml-1">CPF</label>
          <input v-model="form.cpf" type="text"
                 maxlength="14"
                 placeholder="000.000.000-00"
                 class="w-full p-3 border border-gray-300 rounded-xl text-black focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none transition-all" />
          <p v-if="errors.cpf" class="text-red-500 text-sm mt-2 font-medium flex items-center gap-1">
            <CircleX :size="14" /> {{ errors.cpf }}
          </p>
        </div>

        <div>
          <label class="block font-bold mb-1.5 text-gray-700 ml-1">Senha</label>
          <input v-model="form.password" type="password"
                 minlength="6" maxlength="64"
                 placeholder="••••••••"
                 class="w-full p-3 border border-gray-300 rounded-xl text-black focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none transition-all" />
            <p v-if="errors.password" class="text-red-500 text-sm mt-2 font-medium flex items-center gap-1">
              <CircleX :size="14" /> {{ errors.password }}
            </p>
        </div>

        <div class="md:col-span-2">
          <label class="block font-bold mb-1.5 text-gray-700 ml-1">Cargo</label>
          <select
            v-model.number="form.roleId"
            required
            :disabled="editingUser === currentUser?.id"
            class="w-full p-3 border border-gray-300 rounded-xl text-black focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none transition-all disabled:bg-gray-100 disabled:text-gray-400 cursor-pointer"
          >
            <option disabled value="">Selecione o cargo</option>
            <option v-for="role in roles" :key="role.id" :value="role.id">
              {{ role.name }}
            </option>
          </select>
          <p v-if="errors.roleId" class="text-red-500 text-sm mt-2 font-medium flex items-center gap-1">
            <CircleX :size="14" /> {{ errors.roleId }}
          </p>
        </div>

        <div class="md:col-span-2 flex gap-4 pt-2">
          <button type="submit"
                  :disabled="isLoading"
                  class="bg-brand-green text-white px-8 py-3 rounded-xl font-bold hover:bg-brand-green-hover">
            {{ isLoading ? 'Salvando...' : 'Salvar Usuário' }}
          </button>

          <button type="button"
                  @click="closeForm"
                  class="bg-gray-200 text-gray-700 px-8 py-3 rounded-xl font-bold hover:bg-gray-300 transition-all active:scale-95">
            Cancelar
          </button>
        </div>
      </form>
    </div>

    <div class="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
      <div class="p-6 border-b border-gray-50">
        <h2 class="text-xl font-bold text-black">
          Lista de Usuários
        </h2>
      </div>

      <div class="hidden md:block overflow-x-auto">
        <table class="w-full text-black">
          <thead class="bg-gray-50/50">
            <tr class="text-gray-500 text-sm uppercase tracking-wider">
              <th class="px-6 py-4 text-left font-bold">Nome</th>
              <th class="px-6 py-4 text-left font-bold">Email</th>
              <th class="px-6 py-4 text-center font-bold">Status</th>
              <th class="px-6 py-4 text-center font-bold">Cargo</th>
              <th class="px-6 py-4 text-right font-bold pr-10">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50/50 transition-colors">
              <td class="px-6 py-4 font-medium">{{ user.name }}</td>
              <td class="px-6 py-4 text-gray-600">{{ user.email }}</td>
              <td class="px-6 py-4 text-center">
                <span
                  :class="isActive(user.status)
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'"
                  class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-tighter"
                >
                  {{ user.status || 'ATIVO' }}
                </span>
              </td>
              <td class="px-6 py-4 text-center font-semibold text-gray-600">
                {{ roles.find(r => r.id === user.roleId)?.name || '-' }}
              </td>
              <td class="px-6 py-4 text-right pr-10">
                <div class="flex justify-end gap-3">
                  <button
                    @click="openForm(user)"
                    class="p-2 hover:bg-dark/10 rounded-lg transition-colors"
                  >
                    <Pencil :size="18" />
                  </button>

                  <button
                    v-if="user.id !== currentUser?.id"
                    @click="toggleStatus(user)"
                    class="text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash :size="18" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="md:hidden divide-y divide-gray-100">
        <div
          v-for="user in users"
          :key="user.id"
          class="p-5"
        >
          <div class="flex justify-between items-start mb-3">
            <div>
              <p class="font-bold text-lg leading-tight">{{ user.name }}</p>
              <p class="text-sm text-gray-500">{{ user.email }}</p>
            </div>

            <span
              :class="isActive(user.status)
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'"
              class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase"
            >
              {{ user.status || 'ATIVO' }}
            </span>
          </div>

          <div class="flex justify-between items-center mt-4">
            <span class="text-sm font-semibold text-gray-600 bg-gray-100 px-3 py-1 rounded-lg">
              {{ roles.find(r => r.id === user.roleId)?.name || '-' }}
            </span>
            
            <div class="flex gap-4">
              <button @click="openForm(user)">
                <Pencil :size="18" />
              </button>
              <button v-if="user.id !== currentUser?.id" @click="toggleStatus(user)" class="text-red-500">
                <Trash :size="18" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>