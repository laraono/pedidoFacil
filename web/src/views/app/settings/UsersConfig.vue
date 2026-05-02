<script setup>
import { ref, computed, onMounted, watch, nextTick } from "vue";
import { useRouter } from "vue-router";
import { roleApi } from "@/services/roleApi";
import { employeeApi } from "@/services/employeeApi";
import { useAuthStore } from "@/stores/auth";
import { isValidCPF, maskCPF } from "@/utils/validator";
import { useToast } from "@/composables/useToast";
import BaseInput from "@/components/ui/BaseInput.vue";
import BaseSelect from "@/components/ui/BaseSelect.vue";
import BaseButton from "@/components/ui/BaseButton.vue";
import {
  ArrowLeft,
  PlusCircle,
  Trash,
  Pencil,
  X,
  RotateCcw,
} from "lucide-vue-next";

const router = useRouter();
const authStore = useAuthStore();
const { showToast } = useToast();

const users = ref([]);
const inactiveUsers = ref([]);
const roles = ref([]);
const isLoading = ref(false);
const showForm = ref(false);
const editingUser = ref(null);
const errors = ref({});
const confirmDeleteUser = ref(null);
const activeTab = ref("active");

const currentUser = computed(() => authStore.user);

const form = ref({
  id: null,
  name: "",
  email: "",
  cpf: "",
  password: "",
  roleId: "",
});

const HIDDEN_ROLE_NAMES = ["Admin"];
const PROTECTED_ROLE_NAMES = ["Gerente"];

const roleOptions = computed(() =>
  roles.value
    .filter((r) => !HIDDEN_ROLE_NAMES.includes(r.name))
    .map((r) => ({ label: r.name, value: r.id })),
);

const visibleUsers = computed(() => {
  const adminRoleIds = roles.value
    .filter((r) => HIDDEN_ROLE_NAMES.includes(r.name))
    .map((r) => r.id);
  return users.value.filter((u) => {
    const rId = u.role?.id || u.roleId;
    return !adminRoleIds.includes(Number(rId));
  });
});

function isProtectedRole(user) {
  const rId = user.role?.id || user.roleId;
  const role = roles.value.find((r) => Number(r.id) === Number(rId));
  return role && PROTECTED_ROLE_NAMES.includes(role.name);
}

function canDeleteUser(user) {
  if (user.id === currentUser.value?.id) return false;
  if (isProtectedRole(user)) return false;
  return true;
}

const fetchAll = async () => {
  await fetchRoles();
  await fetchUsers();
};

onMounted(fetchAll);

const fetchRoles = async () => {
  try {
    roles.value = await roleApi.list();
  } catch (e) {
    showToast("Erro ao buscar os cargos.", "error");
  }
};

const fetchUsers = async () => {
  try {
    users.value = await employeeApi.list();
    inactiveUsers.value = await employeeApi.listInactive();
  } catch (e) {
    showToast("Erro ao carregar a equipe.", "error");
  }
};

function openForm(user = null) {
  errors.value = {};
  showForm.value = true;
  if (user) {
    editingUser.value = user.id;
    const rId = user.role?.id || user.roleId;
    form.value = {
      ...user,
      cpf: user.cpf || "",
      roleId: rId != null ? String(rId) : "",
    };
  } else {
    editingUser.value = null;
    form.value = {
      id: null,
      name: "",
      email: "",
      cpf: "",
      password: "",
      roleId: "",
    };
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
    errors.value.name = "Nome deve ter ao menos 5 caracteres.";
  if (!form.value.email || !form.value.email.includes("@"))
    errors.value.email = "E-mail inválido.";
  if (form.value.cpf && !isValidCPF(form.value.cpf))
    errors.value.cpf = "O CPF inserido é inválido.";
  if (!editingUser.value && !form.value.password)
    errors.value.password = "Senha é obrigatória.";
  if (form.value.password && form.value.password.length < 6)
    errors.value.password = "Senha deve ter ao menos 6 caracteres.";
  if (!form.value.roleId) errors.value.roleId = "Selecione um cargo.";
  return Object.keys(errors.value).length === 0;
}

const saveUser = async () => {
  if (!validateForm()) {
    showToast("Corrija os erros no formulário.", "error");
    return;
  }

  isLoading.value = true;

  try {
    const payload = {
      name: form.value.name,
      email: form.value.email,
      cpf: form.value.cpf?.replace(/\D/g, ""),
      roleId: Number(form.value.roleId),
    };

    if (form.value.password) payload.password = form.value.password;

    if (editingUser.value) {
      await employeeApi.update(form.value.id, payload);
      showToast("Usuário atualizado com sucesso!", "success");
    } else {
      await employeeApi.create(payload);
      showToast("Usuário criado com sucesso!", "success");
    }

    closeForm();
    await fetchUsers();
  } catch (error) {
    const msg =
      error.response?.data?.message ||
      error.message ||
      "Erro ao salvar usuário.";
    showToast(msg, "error");
  } finally {
    isLoading.value = false;
  }
};

const confirmAndDeleteUser = async () => {
  if (!confirmDeleteUser.value) return;
  try {
    await employeeApi.delete(confirmDeleteUser.value.id);
    showToast("Usuário desativado.", "success");
    confirmDeleteUser.value = null;
    await fetchUsers();
  } catch (error) {
    const msg = error.response?.data?.message || "Erro ao excluir usuário.";
    showToast(msg, "error");
  }
};

const handleReactivate = async (user) => {
  try {
    await employeeApi.reactivate(user.id);
    showToast(`${user.name} reativado com sucesso!`, "success");
    await fetchUsers();
  } catch (error) {
    const msg = error.response?.data?.message || "Erro ao reativar usuário.";
    showToast(msg, "error");
  }
};

watch(
  () => form.value.cpf,
  (val) => {
    if (!val) return;
    const masked = maskCPF(val);
    if (masked !== val) {
      nextTick(() => {
        form.value.cpf = masked;
      });
    }
  },
);

function isActive(status) {
  if (!status) return true;
  return status.toString().trim().toUpperCase() === "ATIVO";
}
</script>

<template>
  <main class="max-w-6xl mx-auto py-12 px-6 font-inter">
    <header class="flex flex-col mb-10 gap-6">
      <div
        class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div class="flex items-center gap-4">
          <button
            @click="router.back()"
            class="p-3 bg-gray-50 border border-[#E0E0E0] rounded text-[#757575] hover:text-[#212121] transition-colors"
          >
            <ArrowLeft :size="20" />
          </button>
          <div>
            <h1 class="text-3xl font-black text-[#212121]">Usuários</h1>
            <p class="text-[#757575] text-sm">
              Gerencie o acesso da sua equipe
            </p>
          </div>
        </div>

        <BaseButton
          v-if="!showForm && activeTab === 'active'"
          @click="openForm()"
          :icon="PlusCircle"
          class="w-full sm:w-auto"
        >
          Novo Usuário
        </BaseButton>
      </div>

      <div class="flex gap-6 mt-2 border-b border-[#E0E0E0]">
        <button
          @click="
            activeTab = 'active';
            closeForm();
          "
          :class="
            activeTab === 'active'
              ? 'text-accent border-b-2 border-accent'
              : 'text-[#757575] hover:text-[#212121]'
          "
          class="pb-3 font-bold text-sm transition-all px-2"
        >
          Ativos ({{ visibleUsers.length }})
        </button>
        <button
          @click="
            activeTab = 'inactive';
            closeForm();
          "
          :class="
            activeTab === 'inactive'
              ? 'text-accent border-b-2 border-accent'
              : 'text-[#757575] hover:text-[#212121]'
          "
          class="pb-3 font-bold text-sm transition-all px-2"
        >
          Desativados ({{ inactiveUsers.length }})
        </button>
      </div>
    </header>

    <Transition name="fade">
      <div
        v-if="showForm"
        class="bg-white border border-[#E0E0E0] p-8 rounded shadow-2xl mb-10 relative overflow-hidden"
      >
        <div
          class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-green to-transparent opacity-50"
        ></div>
        <div class="flex justify-between items-center mb-8">
          <h2
            class="text-2xl font-black text-[#212121] flex items-center gap-3"
          >
            <component
              :is="editingUser ? Pencil : PlusCircle"
              :size="24"
              class="text-accent"
            />
            {{ editingUser ? "Editar Usuário" : "Cadastrar Usuário" }}
          </h2>
          <button
            @click="closeForm"
            class="p-2 text-[#757575] hover:text-[#212121] transition-colors"
          >
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
            v-model="form.email"
            label="E-mail de Login"
            placeholder="ex: joao@email.com"
            :error="errors.email"
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
            :placeholder="
              editingUser ? 'Deixe em branco para manter' : '••••••••'
            "
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
          <div
            class="md:col-span-2 flex justify-end gap-4 mt-4 pt-8 border-t border-[#E0E0E0]"
          >
            <button
              type="button"
              @click="closeForm"
              class="px-8 py-4 rounded text-[#757575] font-bold hover:bg-gray-50 hover:text-[#212121] transition-colors"
            >
              Cancelar
            </button>
            <BaseButton
              @click="saveUser"
              :isLoading="isLoading"
              class="px-8 py-4"
              >Salvar Usuário</BaseButton
            >
          </div>
        </div>
      </div>
    </Transition>

    <div v-if="activeTab === 'active'" class="animate-fadeIn">
      <div
        class="hidden md:block bg-white border border-[#E0E0E0] rounded overflow-hidden shadow-2xl"
      >
        <table class="w-full text-left border-collapse">
          <thead
            class="bg-gray-100 text-[#757575] uppercase text-[10px] font-black tracking-widest border-b border-[#E0E0E0]"
          >
            <tr>
              <th class="p-6">Nome / CPF</th>
              <th class="p-6">E-mail</th>
              <th class="p-6 text-center">Status</th>
              <th class="p-6 text-center">Cargo</th>
              <th class="p-6 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="user in visibleUsers"
              :key="user.id"
              class="hover:bg-gray-50 border-b border-[#E0E0E0] last:border-0 transition-colors"
            >
              <td class="p-6">
                <p class="font-bold text-[#212121]">{{ user.name }}</p>
                <p class="text-[11px] text-[#757575] font-mono mt-1">
                  {{ user.cpf ? maskCPF(user.cpf) : "---" }}
                </p>
              </td>
              <td class="p-6 text-[#757575] text-sm">{{ user.email }}</td>
              <td class="p-6 text-center">
                <span
                  :class="
                    isActive(user.status)
                      ? 'bg-accent-light text-accent border-accent/30'
                      : 'bg-danger-light text-red-500 border-danger'
                  "
                  class="px-3 py-1 border rounded text-[10px] font-black uppercase tracking-widest"
                >
                  {{ user.status || "ATIVO" }}
                </span>
              </td>
              <td class="p-6 text-center font-bold text-[#757575] text-sm">
                {{
                  roles.find((r) => r.id === (user.role?.id || user.roleId))
                    ?.name || "-"
                }}
              </td>
              <td class="p-6 text-right">
                <div class="flex justify-end gap-2">
                  <button
                    @click="openForm(user)"
                    class="p-2 text-[#757575] hover:text-[#212121] hover:bg-gray-50 rounded transition-all"
                  >
                    <Pencil :size="18" />
                  </button>
                  <button
                    v-if="canDeleteUser(user)"
                    @click="confirmDeleteUser = user"
                    class="p-2 text-[#757575] hover:text-red-500 hover:bg-danger-light rounded transition-all"
                  >
                    <Trash :size="18" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="visibleUsers.length === 0">
              <td
                colspan="5"
                class="p-12 text-center text-[#757575] text-sm font-bold"
              >
                Nenhum usuário cadastrado.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="md:hidden space-y-4">
        <div
          v-for="user in visibleUsers"
          :key="user.id"
          class="bg-white border border-[#E0E0E0] p-6 rounded shadow-xl"
        >
          <div class="flex justify-between items-start mb-4">
            <div>
              <p class="font-bold text-[#212121] text-lg">{{ user.name }}</p>
              <p class="text-[11px] text-[#757575] font-mono mt-0.5 mb-1">
                {{ user.cpf ? maskCPF(user.cpf) : "---" }}
              </p>
              <p class="text-sm text-[#757575] mt-1">{{ user.email }}</p>
            </div>
            <span
              class="bg-accent-light text-accent border-accent/30 px-2 py-1 border rounded text-[9px] font-black uppercase tracking-widest"
            >
              {{ user.status || "ATIVO" }}
            </span>
          </div>
          <div
            class="flex justify-between items-center mt-6 pt-4 border-t border-[#E0E0E0]"
          >
            <span
              class="text-[10px] font-black uppercase tracking-widest text-[#757575] bg-gray-50 px-3 py-1 rounded border border-[#E0E0E0]"
            >
              {{
                roles.find((r) => r.id === (user.role?.id || user.roleId))
                  ?.name || "-"
              }}
            </span>
            <div class="flex gap-2">
              <button
                @click="openForm(user)"
                class="p-2 text-[#757575] hover:text-[#212121] bg-gray-50 rounded"
              >
                <Pencil :size="18" />
              </button>
              <button
                v-if="canDeleteUser(user)"
                @click="confirmDeleteUser = user"
                class="p-2 text-red-500 bg-danger-light rounded"
              >
                <Trash :size="18" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="activeTab === 'inactive'" class="animate-fadeIn">
      <div
        class="hidden md:block bg-white border border-[#E0E0E0] rounded overflow-hidden shadow-2xl"
      >
        <table class="w-full text-left border-collapse">
          <thead
            class="bg-gray-100 text-[#757575] uppercase text-[10px] font-black tracking-widest border-b border-[#E0E0E0]"
          >
            <tr>
              <th class="p-6">Nome / E-mail</th>
              <th class="p-6">CPF</th>
              <th class="p-6 text-center">Status</th>
              <th class="p-6 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="user in inactiveUsers"
              :key="user.id"
              class="hover:bg-gray-50 border-b border-[#E0E0E0] last:border-0 transition-colors"
            >
              <td class="p-6">
                <p class="font-bold text-[#212121]">{{ user.name }}</p>
                <p class="text-sm text-[#757575] mt-1">{{ user.email }}</p>
              </td>
              <td class="p-6 text-[#757575] font-mono text-sm">
                {{ user.cpf ? maskCPF(user.cpf) : "---" }}
              </td>

              <td class="p-6 text-center">
                <span
                  class="bg-danger-light text-red-500 border border-danger/30 px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest"
                >
                  Desativado
                </span>
              </td>

              <td class="p-6 text-right">
                <button
                  @click="handleReactivate(user)"
                  class="flex items-center gap-2 ml-auto px-4 py-2 bg-accent-light text-accent border border-accent/20 rounded text-[11px] font-black uppercase tracking-wider hover:bg-accent hover:text-white transition-all"
                >
                  <RotateCcw :size="14" />
                  Reativar
                </button>
              </td>
            </tr>
            <tr v-if="inactiveUsers.length === 0">
              <td
                colspan="4"
                class="p-12 text-center text-[#757575] text-sm font-bold"
              >
                Nenhum usuário desativado no momento.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="md:hidden space-y-4">
        <div
          v-for="user in inactiveUsers"
          :key="user.id"
          class="bg-white border border-[#E0E0E0] p-6 rounded shadow-xl opacity-80"
        >
          <div class="flex justify-between items-start mb-4">
            <div>
              <p class="font-bold text-[#212121] text-lg line-through">
                {{ user.name }}
              </p>
              <p class="text-[11px] text-[#757575] font-mono mt-0.5 mb-1">
                {{ user.cpf ? maskCPF(user.cpf) : "---" }}
              </p>
              <p class="text-sm text-[#757575] mt-1">{{ user.email }}</p>
            </div>
          </div>
          <div class="flex justify-end mt-6 pt-4 border-t border-[#E0E0E0]">
            <button
              @click="handleReactivate(user)"
              class="flex items-center gap-2 px-4 py-2 bg-accent-light text-accent border border-accent/20 rounded text-[11px] font-black uppercase tracking-wider"
            >
              <RotateCcw :size="14" />
              Reativar
            </button>
          </div>
        </div>
      </div>
    </div>
  </main>

  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="confirmDeleteUser"
        class="fixed inset-0 bg-black/50 z-[110] flex items-center justify-center p-4"
      >
        <div
          class="bg-white border border-[#E0E0E0] w-full max-w-sm rounded p-8 shadow-2xl"
        >
          <div class="flex items-start gap-4 mb-6">
            <div
              class="p-3 bg-danger-light rounded border border-danger shrink-0"
            >
              <Trash :size="20" class="text-danger" />
            </div>
            <div>
              <p class="text-[#212121] font-black text-base">
                Desativar usuário?
              </p>
              <p class="text-[#757575] text-sm mt-1">
                <span class="text-[#212121] font-bold">{{
                  confirmDeleteUser.name
                }}</span>
                perderá o acesso ao sistema. Você pode reativá-lo depois.
              </p>
            </div>
          </div>
          <div class="flex gap-3">
            <button
              @click="confirmDeleteUser = null"
              class="flex-1 py-3 rounded text-[#757575] font-bold hover:bg-gray-50 transition-colors border border-[#E0E0E0]"
            >
              Cancelar
            </button>
            <button
              @click="confirmAndDeleteUser"
              class="flex-1 py-3 rounded bg-red-50 text-red-600 font-black border border-red-200 hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors"
            >
              Desativar
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
.animate-fadeIn {
  animation: fadeIn 0.4s ease-out forwards;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
