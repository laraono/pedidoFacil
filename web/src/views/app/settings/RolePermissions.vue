<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { request } from "@/services/api"; // <-- Motor do Axios
import { AVAILABLE_PERMISSIONS } from "@/utils/permissions";
import { useToast } from "@/composables/useToast";
import { useFormValidation } from "@/composables/useFormValidation";
import BaseInput from "@/components/ui/BaseInput.vue";
import BaseButton from "@/components/ui/BaseButton.vue";
import {
  ShieldCheck,
  Plus,
  ArrowLeft,
  Lock,
  CheckCircle,
  X,
  AlertCircle,
  Trash2,
} from "lucide-vue-next";

const router = useRouter();
const { showToast } = useToast();

const roles = ref([]);
const isModalOpen = ref(false);
const isEditing = ref(false);
const isLoading = ref(false);
const confirmDeleteRole = ref(null);

const currentRole = ref({ id: null, name: "", permissions: [] });

const PROTECTED_ROLE_NAMES = ["Gerente"];

onMounted(async () => {
  await fetchRoles();
});

const fetchRoles = async () => {
  try {
    // API Call real que criaremos a seguir
    const data = await request("/api/cargos", { method: "GET" });
    roles.value = data.map((r) => ({
      ...r,
      permissions:
        typeof r.permissions === "string"
          ? JSON.parse(r.permissions)
          : r.permissions,
    }));
  } catch (error) {
    showToast("Erro ao carregar os cargos.", "error");
  }
};

const saveRole = async () => {
  if (!currentRole.value.name.trim())
    return showToast("Preencha o nome do cargo.", "error");
  if (currentRole.value.permissions.length === 0)
    return showToast("Selecione permissões.", "error");

  isLoading.value = true;
  try {
    const payload = {
      name: currentRole.value.name,
      permissions: JSON.stringify(currentRole.value.permissions),
    };

    if (isEditing.value) {
      await request(`/api/cargos/${currentRole.value.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      showToast("Cargo atualizado!", "success");
    } else {
      await request("/api/cargos", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      showToast("Cargo criado!", "success");
    }

    isModalOpen.value = false;
    await fetchRoles(); // Recarrega a lista
  } catch (error) {
    showToast(error.message || "Erro ao salvar cargo.", "error");
  } finally {
    isLoading.value = false;
  }
};

const deleteRole = async () => {
  if (!confirmDeleteRole.value) return;
  try {
    await request(`/api/cargos/${confirmDeleteRole.value.id}`, {
      method: "DELETE",
    });
    showToast(`Cargo excluído.`, "success");
    confirmDeleteRole.value = null;
    await fetchRoles();
  } catch (error) {
    showToast("Não é possível excluir um cargo em uso.", "error");
  }
};

const openModal = (role = null) => {
  if (role) {
    currentRole.value = JSON.parse(JSON.stringify(role));
    isEditing.value = true;
  } else {
    currentRole.value = { id: null, name: "", permissions: [] };
    isEditing.value = false;
  }
  isModalOpen.value = true;
};

const togglePermission = (id) => {
  const perms = currentRole.value.permissions;
  const idx = perms.indexOf(id);
  if (idx > -1) perms.splice(idx, 1);
  else perms.push(id);
};
</script>

<template></template>
