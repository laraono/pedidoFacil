<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { isValidCPF, maskCPF } from '@/utils/validator';
import { ArrowLeft, PlusCircle, Trash, Pencil, X } from 'lucide-vue-next';
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
  <main class="max-w-5xl mx-auto py-6 md:py-12 px-3 md:px-4 text-black">
    <div class="flex flex-col sm:flex-row sm:items-center mb-6 gap-4">
      <button @click="router.back()" class="p-2 text-black mr-4">
        <ArrowLeft :size="28" />
      </button>

      <h1 class="text-3xl font-bold text-black">
        Usuários
      </h1>

      <button
        @click="openForm()"
        class="sm:ml-auto flex items-center justify-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
      >
        <PlusCircle :size="18" class="mr-2" />
        Novo Usuário
      </button>
    </div>

    <div v-if="showForm" class="bg-white p-6 rounded-xl shadow-md border mb-8">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold text-black">
          {{ editingUser ? 'Editar Usuário' : 'Cadastrar Usuário' }}
        </h2>
        <button @click="closeForm" class="text-black">
          <X :size="20" />
        </button>
      </div>

      <form @submit.prevent="saveUser" class="grid grid-cols-1 md:grid-cols-2 gap-6">

        <div>
          <label class="block font-semibold mb-1 text-black">Nome</label>
          <input v-model="form.name" required type="text"
                 class="w-full p-2 border rounded-lg text-black" />
        </div>

        <div>
          <label class="block font-semibold mb-1 text-black">Email</label>
          <input v-model="form.email" required type="email"
                 class="w-full p-2 border rounded-lg text-black" />
        </div>

        <div>
          <label class="block font-semibold mb-1 text-black">CPF</label>
          <input v-model="form.cpf" required type="text"
                 class="w-full p-2 border rounded-lg text-black" />
          <p v-if="localError" class="text-red-500 text-sm mt-2">
            {{ localError }}
          </p>
        </div>

        <div>
          <label class="block font-semibold mb-1 text-black">Senha</label>
          <input v-model="form.password" required type="password"
                 class="w-full p-2 border rounded-lg text-black" />
        </div>

        <div class="md:col-span-2">
          <label class="block font-semibold mb-1 text-black">Cargo</label>
          <select
            v-model.number="form.roleId"
            required
            :disabled="editingUser === currentUser?.id"
            class="w-full p-2 border rounded-lg text-black disabled:bg-gray-200"
          >
            <option disabled value="">Selecione</option>
            <option v-for="role in roles" :key="role.id" :value="role.id">
              {{ role.name }}
            </option>
          </select>
        </div>

        <div class="md:col-span-2 flex gap-4">
          <button type="submit"
                  :disabled="isLoading"
                  class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            {{ isLoading ? 'Salvando...' : 'Salvar' }}
          </button>

          <button type="button"
                  @click="closeForm"
                  class="bg-gray-300 px-6 py-2 rounded-lg">
            Cancelar
          </button>
        </div>
      </form>
    </div>

    <div class="bg-white p-4 md:p-6 rounded-xl shadow-md border">
      <h2 class="text-xl font-bold mb-4 text-black">
        Lista de Usuários
      </h2>

      <div class="hidden md:block">
        <table class="w-full text-black">
          <thead>
            <tr class="border-b">
              <th class="px-4 py-3 text-left">Nome</th>
              <th class="px-4 py-3 text-left">Email</th>
              <th class="px-4 py-3 text-left">Status</th>
              <th class="px-4 py-3 text-left">Cargo</th>
              <th class="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id" class="border-b">
              <td class="px-4 py-4">{{ user.name }}</td>
              <td class="px-4 py-4">{{ user.email }}</td>
              <td class="px-4 py-4">
                <span
                  :class="isActive(user.status)
                    ? 'text-green-600 font-semibold'
                    : 'text-red-600 font-semibold'"
                >
                  {{ user.status || 'ATIVO' }}
                </span>
              </td>
              <td class="px-4 py-4">
                {{ roles.find(r => r.id === user.roleId)?.name || '-' }}
              </td>
              <td class="px-4 py-4 text-right">
                <div class="flex justify-end gap-3">
                  <button
                    @click="openForm(user)"
                    class="text-blue-600"
                  >
                    <Pencil :size="18" />
                  </button>

                  <button
                    v-if="user.id !== currentUser?.id"
                    @click="toggleStatus(user)"
                    class="text-red-600"
                  >
                    <Trash :size="18" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="md:hidden space-y-4">
        <div
          v-for="user in users"
          :key="user.id"
          class="border rounded-lg p-4 shadow-sm"
        >
          <div class="flex justify-between items-start">
            <div>
              <p class="font-bold text-lg">{{ user.name }}</p>
              <p class="text-sm text-gray-600">{{ user.email }}</p>
            </div>

            <span
              :class="isActive(user.status)
                ? 'text-green-600 font-semibold'
                : 'text-red-600 font-semibold'"
            >
              {{ user.status || 'ATIVO' }}
            </span>
          </div>

          <div class="mt-3 text-sm">
            <p>
              <span class="font-semibold">Cargo:</span>
              {{ roles.find(r => r.id === user.roleId)?.name || '-' }}
            </p>
          </div>

          <div class="flex justify-end gap-4 mt-4">
            <button
              @click="openForm(user)"
              class="text-blue-600"
            >
              <Pencil :size="18" />
            </button>

            <button
              v-if="user.id !== currentUser?.id"
              @click="toggleStatus(user)"
              class="text-red-600"
            >
              <Trash :size="18" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>