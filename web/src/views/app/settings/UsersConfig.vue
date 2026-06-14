<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { roleApi } from "@/services/roleApi";
import { employeeApi } from "@/services/employeeApi";
import { useAuthStore } from "@/stores/auth";
import { validatePasswordStrength } from "@/utils/password";
import { useToast } from "@/composables/useToast";
import { useConfirm } from "@/composables/useConfirm";
import { useAsyncAction } from "@/composables/useAsyncAction";
import { BaseInput, BaseSelect, BaseButton, ConfirmModal, DataTable, EmptyState } from "@/components/ui";
import {
  ArrowLeft, PlusCircle, Trash, Pencil, X, RotateCcw, Eye, EyeOff,
} from "lucide-vue-next";

const router = useRouter();
const authStore = useAuthStore();
const { showToast } = useToast();
const { confirmState, showConfirm, closeConfirm } = useConfirm();
const { loading: isSaving, run } = useAsyncAction();

const users = ref([]);
const inactiveUsers = ref([]);
const roles = ref([]);
const showForm = ref(false);
const editingUser = ref(null);
const errors = ref({});
const activeTab = ref("active");

const currentUser = computed(() => authStore.user);

const form = ref({ id: null, name: "", email: "", password: "", roleId: "" });
const showPassword = ref(false);

const PROTECTED_ROLE_NAMES = ["Gerente"];

const roleOptions = computed(() =>
  roles.value
    .filter((r) => !PROTECTED_ROLE_NAMES.includes(r.name))
    .map((r) => ({ label: r.name, value: r.id }))
);

function getRoleName(user) {
  return user.role?.name || "-";
}

function isProtectedRole(user) {
  return PROTECTED_ROLE_NAMES.includes(user.role?.name);
}

function canDeleteUser(user) {
  return user.id !== currentUser.value?.id && !isProtectedRole(user);
}

function isActive(status) {
  if (!status) return true;
  return status.toString().trim().toUpperCase() === "ATIVO";
}

const fetchRoles = async () => {
  try { roles.value = (await roleApi.list()) ?? []; }
  catch { showToast("Erro ao buscar os cargos.", "error"); }
};

const fetchUsers = async () => {
  try {
    users.value = (await employeeApi.list()) ?? [];
    inactiveUsers.value = (await employeeApi.listInactive()) ?? [];
  } catch { showToast("Erro ao carregar a equipe.", "error"); }
};

onMounted(async () => { await fetchRoles(); await fetchUsers(); });

function openForm(user = null) {
  errors.value = {};
  showForm.value = true;
  if (user) {
    editingUser.value = user.id;
    form.value = { ...user, roleId: user.role?.id != null ? String(user.role.id) : "" };
  } else {
    editingUser.value = null;
    form.value = { id: null, name: "", email: "", password: "", roleId: "" };
  }
}

function closeForm() {
  showForm.value = false;
  editingUser.value = null;
  errors.value = {};
  showPassword.value = false;
}

function validateForm() {
  errors.value = {};
  if (!form.value.name || form.value.name.trim().length < 5)
    errors.value.name = "Nome deve ter ao menos 5 caracteres.";
  if (!form.value.email || !form.value.email.includes("@"))
    errors.value.email = "E-mail inválido.";
  if (!editingUser.value && !form.value.password)
    errors.value.password = "Senha é obrigatória.";
  else if (form.value.password) {
    const err = validatePasswordStrength(form.value.password);
    if (err) errors.value.password = err;
  }
  if (!form.value.roleId) errors.value.roleId = "Selecione um cargo.";
  return Object.keys(errors.value).length === 0;
}

const saveUser = async () => {
  if (!validateForm()) { showToast("Corrija os erros no formulário.", "error"); return; }
  await run(async () => {
    const payload = { name: form.value.name, email: form.value.email, roleId: Number(form.value.roleId) };
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
  }, "Erro ao salvar usuário.");
};

function askDeactivate(user) {
  showConfirm({
    title: "Desativar usuário?",
    message: `${user.name} perderá o acesso ao sistema. Você pode reativá-lo depois.`,
    onConfirm: async () => {
      try {
        await employeeApi.delete(user.id);
        showToast("Usuário desativado.", "success");
        await fetchUsers();
      } catch (e) {
        showToast(e?.response?.data?.message || "Erro ao desativar usuário.", "error");
      }
    },
  });
}

function askPermanentDelete(user) {
  showConfirm({
    title: "Excluir definitivamente?",
    message: `${user.name} será removido permanentemente. Esta ação não pode ser desfeita.`,
    onConfirm: async () => {
      try {
        await employeeApi.permanentDelete(user.id);
        showToast("Funcionário excluído definitivamente.", "success");
        await fetchUsers();
      } catch (e) {
        showToast(e?.response?.data?.message || "Erro ao excluir funcionário.", "error");
      }
    },
  });
}

const handleReactivate = async (user) => {
  try {
    await employeeApi.reactivate(user.id);
    showToast(`${user.name} reativado com sucesso!`, "success");
    await fetchUsers();
  } catch (e) {
    showToast(e?.response?.data?.message || "Erro ao reativar usuário.", "error");
  }
};

const activeColumns = [
  { key: 'name', label: 'Nome' },
  { key: 'email', label: 'E-mail' },
  { key: 'status', label: 'Status' },
  { key: 'role', label: 'Cargo' },
];

const activeActions = [
  { icon: Pencil, tooltip: 'Editar', handler: openForm, class: 'text-[#757575] hover:text-[#212121] hover:bg-gray-50' },
  { icon: Trash, tooltip: 'Desativar', handler: askDeactivate, condition: canDeleteUser, class: 'text-[#757575] hover:text-red-500 hover:bg-danger-light' },
];

const inactiveColumns = [
  { key: 'name', label: 'Nome' },
  { key: 'email', label: 'E-mail' },
  { key: 'status', label: 'Status' },
];
</script>

<template>
  <main class="max-w-6xl mx-auto py-12 px-6 font-inter">
    <header class="flex flex-col mb-10 gap-6">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div class="flex items-center gap-4">
          <button @click="router.back()" class="p-3 bg-gray-50 border border-[#E0E0E0] rounded text-[#757575] hover:text-[#212121] transition-colors">
            <ArrowLeft :size="20" />
          </button>
          <div>
            <h1 class="text-3xl font-black text-[#212121]">Usuários</h1>
            <p class="text-[#757575] text-sm">Gerencie o acesso da sua equipe</p>
          </div>
        </div>
        <BaseButton v-if="!showForm && activeTab === 'active'" @click="openForm()" :icon="PlusCircle" class="w-full sm:w-auto">
          Novo Usuário
        </BaseButton>
      </div>
      <div class="flex gap-6 mt-2 border-b border-[#E0E0E0]">
        <button @click="activeTab = 'active'; closeForm();" :class="activeTab === 'active' ? 'text-accent border-b-2 border-accent' : 'text-[#757575] hover:text-[#212121]'" class="pb-3 font-bold text-sm transition-all px-2">
          Ativos ({{ users.length }})
        </button>
        <button @click="activeTab = 'inactive'; closeForm();" :class="activeTab === 'inactive' ? 'text-accent border-b-2 border-accent' : 'text-[#757575] hover:text-[#212121]'" class="pb-3 font-bold text-sm transition-all px-2">
          Desativados ({{ inactiveUsers.length }})
        </button>
      </div>
    </header>

    <Transition name="fade">
      <div v-if="showForm" class="bg-white border border-[#E0E0E0] p-8 rounded shadow-2xl mb-10 relative overflow-hidden">
        <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-green to-transparent opacity-50"></div>
        <div class="flex justify-between items-center mb-8">
          <h2 class="text-2xl font-black text-[#212121] flex items-center gap-3">
            <component :is="editingUser ? Pencil : PlusCircle" :size="24" class="text-accent" />
            {{ editingUser ? "Editar Usuário" : "Cadastrar Usuário" }}
          </h2>
          <button @click="closeForm" class="p-2 text-[#757575] hover:text-[#212121] transition-colors">
            <X :size="24" />
          </button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <BaseInput v-model="form.name" label="Nome Completo" placeholder="Ex: João Silva" :error="errors.name" />
          <BaseInput v-model="form.email" label="E-mail de Login" placeholder="ex: joao@email.com" :error="errors.email" />
          <BaseInput v-model="form.password" label="Senha" :type="showPassword ? 'text' : 'password'" :placeholder="editingUser ? 'Deixe em branco para manter' : '••••••••'" :error="errors.password">
            <template #suffix>
              <button type="button" @click="showPassword = !showPassword" class="absolute right-3 top-1/2 -translate-y-1/2 text-[#757575] hover:text-[#212121] transition-colors">
                <component :is="showPassword ? EyeOff : Eye" :size="18" />
              </button>
            </template>
          </BaseInput>
          <BaseSelect v-model="form.roleId" label="Cargo" :options="roleOptions" placeholder="Selecione o cargo" :error="errors.roleId" :disabled="editingUser === currentUser?.id" />
          <div class="md:col-span-2 flex justify-end gap-4 mt-4 pt-8 border-t border-[#E0E0E0]">
            <button type="button" @click="closeForm" class="px-8 py-4 rounded text-[#757575] font-bold hover:bg-gray-50 hover:text-[#212121] transition-colors">Cancelar</button>
            <BaseButton @click="saveUser" :isLoading="isSaving" class="px-8 py-4">Salvar Usuário</BaseButton>
          </div>
        </div>
      </div>
    </Transition>

    <div v-if="activeTab === 'active'" class="animate-fadeIn">
      <DataTable v-if="users.length" :columns="activeColumns" :data="users" :actions="activeActions">
        <template #cell-status="{ item }">
          <span :class="isActive(item.status) ? 'bg-accent-light text-accent border-accent/30' : 'bg-danger-light text-red-500 border-danger'"
                class="px-3 py-1 border rounded text-[10px] font-black uppercase tracking-widest">
            {{ item.status || "ATIVO" }}
          </span>
        </template>
        <template #cell-role="{ item }">
          <span class="font-bold text-[#757575] text-sm">{{ getRoleName(item) }}</span>
        </template>
        <template #mobile-item="{ item }">
          <div class="p-6">
            <div class="flex justify-between items-start mb-4">
              <div>
                <p class="font-bold text-[#212121] text-lg">{{ item.name }}</p>
                <p class="text-sm text-[#757575] mt-1">{{ item.email }}</p>
              </div>
              <span class="bg-accent-light text-accent border-accent/30 px-2 py-1 border rounded text-[9px] font-black uppercase tracking-widest">
                {{ item.status || "ATIVO" }}
              </span>
            </div>
            <div class="flex justify-between items-center mt-6 pt-4 border-t border-[#E0E0E0]">
              <span class="text-[10px] font-black uppercase tracking-widest text-[#757575] bg-gray-50 px-3 py-1 rounded border border-[#E0E0E0]">
                {{ getRoleName(item) }}
              </span>
              <div class="flex gap-2">
                <button @click="openForm(item)" class="p-2 text-[#757575] hover:text-[#212121] bg-gray-50 rounded">
                  <Pencil :size="18" />
                </button>
                <button v-if="canDeleteUser(item)" @click="askDeactivate(item)" class="p-2 text-red-500 bg-danger-light rounded">
                  <Trash :size="18" />
                </button>
              </div>
            </div>
          </div>
        </template>
      </DataTable>
      <EmptyState v-else :icon="PlusCircle" message="Nenhum usuário cadastrado." action-label="Novo Usuário" @action="openForm()" />

    </div>

    <div v-if="activeTab === 'inactive'" class="animate-fadeIn">
      <DataTable v-if="inactiveUsers.length" :columns="inactiveColumns" :data="inactiveUsers">
        <template #cell-name="{ item }">
          <span class="font-bold text-[#212121]">{{ item.name }}</span>
        </template>
        <template #cell-status>
          <span class="bg-danger-light text-red-500 border border-danger/30 px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest">
            Desativado
          </span>
        </template>
        <template #row-actions="{ item }">
          <button @click="handleReactivate(item)" class="flex items-center gap-2 px-4 py-2 bg-accent-light text-accent border border-accent/20 rounded text-[11px] font-black uppercase tracking-wider hover:bg-accent hover:text-white transition-all">
            <RotateCcw :size="14" /> Reativar
          </button>
          <button @click="askPermanentDelete(item)" class="flex items-center gap-2 px-4 py-2 bg-danger-light text-red-600 border border-red-200 rounded text-[11px] font-black uppercase tracking-wider hover:bg-red-600 hover:text-white transition-all">
            <Trash :size="14" /> Excluir
          </button>
        </template>
        <template #mobile-item="{ item }">
          <div class="p-6 opacity-80">
            <div class="flex justify-between items-start mb-4">
              <div>
                <p class="font-bold text-[#212121] text-lg line-through">{{ item.name }}</p>
                <p class="text-sm text-[#757575] mt-1">{{ item.email }}</p>
              </div>
            </div>
            <div class="flex justify-end gap-2 mt-6 pt-4 border-t border-[#E0E0E0]">
              <button @click="handleReactivate(item)" class="flex items-center gap-2 px-4 py-2 bg-accent-light text-accent border border-accent/20 rounded text-[11px] font-black uppercase tracking-wider">
                <RotateCcw :size="14" /> Reativar
              </button>
              <button @click="askPermanentDelete(item)" class="flex items-center gap-2 px-4 py-2 bg-danger-light text-red-600 border border-red-200 rounded text-[11px] font-black uppercase tracking-wider">
                <Trash :size="14" /> Excluir
              </button>
            </div>
          </div>
        </template>
      </DataTable>
      <EmptyState v-else :icon="RotateCcw" message="Nenhum usuário desativado no momento." />
    </div>
  </main>

  <ConfirmModal :confirm-modal="confirmState" @close="closeConfirm" />
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-10px); }
.animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
