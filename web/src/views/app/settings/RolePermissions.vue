<script setup>
import { ref, onMounted } from "vue";
import { AVAILABLE_PERMISSIONS } from "@/utils/permissions";
import { roleApi } from "@/services/roleApi";
import { useToast } from "@/composables/useToast";
import { useFormValidation } from "@/composables/useFormValidation";
import { useConfirm } from "@/composables/useConfirm";
import { useAsyncAction } from "@/composables/useAsyncAction";
import {
  BaseInput,
  BaseButton,
  ConfirmModal,
  FormModal,
  EmptyState,
  PageHeader,
} from "@/components/ui";
import { ShieldCheck, Plus, CheckCircle, AlertCircle, Trash2, Users } from "lucide-vue-next";

const { showToast } = useToast();
const { confirmState, showConfirm, closeConfirm } = useConfirm();
const { loading: isLoading, run: runFetch } = useAsyncAction();
const { loading: isSaving, run: runSave } = useAsyncAction();

const roles = ref([]);
const isModalOpen = ref(false);
const isEditing = ref(false);

const currentRole = ref({ id: null, name: "", permissions: [] });

const validationRules = {
  name: [{ validator: (v) => !!v?.trim(), message: "O nome do cargo é obrigatório." }],
  permissions: [{ validator: (v) => v?.length > 0, message: "Selecione pelo menos um nível de acesso." }],
};

const { errors, validateAll, validateField } = useFormValidation(validationRules);

const HIDDEN_ROLE_NAMES = ["Gerente"];

const normalizePermissions = (perms) => {
  if (typeof perms === "string") {
    try { perms = JSON.parse(perms); } catch { perms = []; }
  }
  if (!Array.isArray(perms)) return [];
  if (perms.length > 0 && typeof perms[0] === "object") {
    return perms.map((p) => p.id || p.name || p.value || p);
  }
  return perms;
};

const fetchRoles = () =>
  runFetch(async () => {
    const data = await roleApi.list();
    roles.value = data
      .filter((role) => !HIDDEN_ROLE_NAMES.includes(role.name))
      .map((role) => ({
        ...role,
        permissions: normalizePermissions(role.permissions),
      }));
  }, "Erro ao carregar os cargos.");

onMounted(fetchRoles);

const saveRole = async () => {
  if (!Array.isArray(currentRole.value.permissions)) {
    currentRole.value.permissions = [];
  }
  if (!validateAll(currentRole.value)) {
    showToast(
      !currentRole.value.permissions.length
        ? "Selecione ao menos uma permissão antes de salvar o cargo."
        : "Preencha o nome do cargo.",
      "error"
    );
    return;
  }

  await runSave(async () => {
    try {
      if (isEditing.value) {
        await roleApi.update(currentRole.value.id, currentRole.value);
      } else {
        await roleApi.create(currentRole.value);
      }
      await fetchRoles();
      showToast(`Cargo "${currentRole.value.name}" salvo com sucesso!`, "success");
      isModalOpen.value = false;
    } catch (error) {
      const data = error.response?.data || error.data || error;
      if (data?.errors && Array.isArray(data.errors)) {
        data.errors.forEach((err) => {
          errors.value[err.campo.replace("body.", "")] = err.mensagem;
        });
        showToast("Corrija os erros destacados no formulário.", "error");
      } else {
        showToast(data?.message || "Erro ao salvar cargo.", "error");
      }
    }
  });
};

const openModal = (role = null) => {
  if (role) {
    currentRole.value = JSON.parse(JSON.stringify(role));
    if (!Array.isArray(currentRole.value.permissions)) {
      currentRole.value.permissions = [];
    }
    isEditing.value = true;
  } else {
    currentRole.value = { id: null, name: "", permissions: [] };
    isEditing.value = false;
  }
  errors.value = {};
  isModalOpen.value = true;
};

const deleteRole = (role) => {
  if (HIDDEN_ROLE_NAMES.includes(role.name)) {
    showToast(`O cargo "${role.name}" não pode ser excluído.`, "error");
    return;
  }

  showConfirm({
    title: "Excluir cargo?",
    message: `O cargo "${role.name}" será removido permanentemente. Certifique-se de que não há usuários vinculados a ele.`,
    onConfirm: async () => {
      try {
        await roleApi.delete(role.id);
        await fetchRoles();
        showToast(`Cargo "${role.name}" excluído.`, "success");
      } catch (error) {
        showToast(
          error.response?.data?.message || "Não é possível excluir este cargo.",
          "error"
        );
      }
    },
  });
};

const togglePermission = (id) => {
  if (!Array.isArray(currentRole.value.permissions)) {
    currentRole.value.permissions = [];
  }
  const perms = currentRole.value.permissions;
  const idx = perms.indexOf(id);
  if (idx > -1) perms.splice(idx, 1);
  else perms.push(id);
  validateField("permissions", perms);
};
</script>

<template>
  <main class="max-w-6xl mx-auto py-12 px-6 font-inter">
    <PageHeader
      title="Cargos e Permissões"
      subtitle="Gerenciando acessos do estabelecimento"
      backTo="/app/dashboard"
    >
      <template #actions>
        <BaseButton @click="openModal()" :icon="Plus">Novo Cargo</BaseButton>
      </template>
    </PageHeader>

    <div
      v-if="isLoading && roles.length === 0"
      class="flex justify-center py-20 text-[#757575]"
    >
      <p class="font-bold">Carregando cargos...</p>
    </div>

    <EmptyState
      v-else-if="!isLoading && roles.length === 0"
      :icon="ShieldCheck"
      message="Nenhum cargo cadastrado"
      action-label="Novo Cargo"
      @action="openModal()"
    />

    <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div
        v-for="role in roles"
        :key="role.id"
        class="bg-white border border-[#E0E0E0] rounded p-8 group transition-all hover:border-accent/40 cursor-pointer"
        @click="openModal(role)"
      >
        <div class="flex justify-between items-start mb-6">
          <ShieldCheck class="text-accent" :size="24" />
          <button
            v-if="!HIDDEN_ROLE_NAMES.includes(role.name)"
            @click.stop="deleteRole(role)"
            class="p-1.5 text-[#757575] hover:text-red-500 hover:bg-danger-light rounded transition-all"
            title="Excluir cargo"
          >
            <Trash2 :size="16" />
          </button>
          <span
            v-else
            class="text-[9px] font-black uppercase tracking-widest text-[#757575] px-2 py-1 bg-gray-50 rounded border border-[#E0E0E0]"
            title="Cargo protegido"
            >Fixo</span
          >
        </div>
        <h3 class="text-xl font-bold text-[#212121]">{{ role.name }}</h3>
        <div class="flex items-center gap-4 mt-2">
          <p class="text-[10px] font-black uppercase tracking-widest text-[#757575]">
            {{ role.permissions?.length || 0 }} Permissões
          </p>
          <p
            v-if="role.usersCount != null"
            class="text-[10px] font-black uppercase tracking-widest text-[#757575] flex items-center gap-1"
          >
            <Users :size="10" />
            {{ role.usersCount }} Usuário{{ role.usersCount !== 1 ? "s" : "" }}
          </p>
        </div>
        <div class="flex flex-wrap gap-1 mt-4">
          <span
            v-for="permId in (role.permissions || []).slice(0, 3)"
            :key="permId"
            class="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 bg-accent-light text-accent rounded border border-accent/30"
          >
            {{ AVAILABLE_PERMISSIONS.find((p) => p.id === permId)?.label || permId }}
          </span>
          <span
            v-if="(role.permissions?.length || 0) > 3"
            class="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 bg-gray-50 text-[#757575] rounded"
          >
            +{{ role.permissions.length - 3 }}
          </span>
        </div>
      </div>
    </div>

    <FormModal
      :show="isModalOpen"
      :title="isEditing ? 'Editar Cargo' : 'Novo Cargo'"
      save-label="Salvar Cargo"
      :is-loading="isSaving"
      @close="isModalOpen = false"
      @save="saveRole"
    >
      <div class="space-y-8">
        <BaseInput
          v-model="currentRole.name"
          label="Nome do Cargo"
          placeholder="Ex: Supervisor"
          :error="errors.name"
          @input="validateField('name', currentRole.name)"
        />

        <div class="space-y-4">
          <label class="text-xs font-black uppercase tracking-widest text-[#757575] ml-2">
            Permissões de Acesso
          </label>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div
              v-for="perm in AVAILABLE_PERMISSIONS"
              :key="perm.id"
              @click="togglePermission(perm.id)"
              :class="
                currentRole.permissions.includes(perm.id)
                  ? 'border-accent bg-accent-light'
                  : 'border-[#E0E0E0] bg-gray-50'
              "
              class="p-4 rounded border cursor-pointer transition-all flex items-start gap-4"
            >
              <div class="mt-1">
                <div
                  class="w-5 h-5 rounded border border-[#E0E0E0] flex items-center justify-center"
                  :class="currentRole.permissions.includes(perm.id) ? 'bg-accent border-accent' : ''"
                >
                  <CheckCircle
                    v-if="currentRole.permissions.includes(perm.id)"
                    :size="14"
                    class="text-black"
                  />
                </div>
              </div>
              <div>
                <span
                  class="block font-bold text-sm"
                  :class="currentRole.permissions.includes(perm.id) ? 'text-accent' : 'text-[#212121]'"
                >
                  {{ perm.label }}
                </span>
                <span class="text-[10px] text-[#757575] font-medium">{{ perm.desc }}</span>
              </div>
            </div>
          </div>
          <p
            v-if="errors.permissions"
            class="text-red-500 text-xs font-bold ml-2 flex items-center gap-1"
          >
            <AlertCircle :size="12" /> {{ errors.permissions }}
          </p>
        </div>
      </div>
    </FormModal>

    <ConfirmModal :confirm-modal="confirmState" @close="closeConfirm" />
  </main>
</template>
