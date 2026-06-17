<script setup>
import { ref, computed, onMounted } from "vue";
import { useMenuStore } from "@/stores/productsManagement.js";
import { categoryApi } from "@/services/categoryApi";
import { getImageUrl, validateImageFile } from "@/utils/imageUrl";
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
  DataTable,
} from "@/components/ui";
import { PlusCircle, Edit, Image as ImageIcon, EyeOff, Eye, Trash2 } from "lucide-vue-next";

const menuStore = useMenuStore();
const { showToast } = useToast();
const { confirmState, showConfirm, closeConfirm } = useConfirm();
const { loading: isSaving, run: runSave } = useAsyncAction();

onMounted(() => menuStore.loadData());

const showModal = ref(false);
const isEditing = ref(false);
const showInactive = ref(false);

const displayedCategories = computed(() =>
  showInactive.value ? menuStore.inactiveCategories : menuStore.activeCategories
);

const form = ref({ id: null, name: "", imageFile: null, imagePreview: null });

const validationRules = {
  name: [{ validator: (v) => !!v?.trim(), message: "O nome da categoria é obrigatório." }],
};
const { errors, touched, validateAll, validateField, touchField } = useFormValidation(validationRules);

const openModal = (cat = null) => {
  if (cat) {
    form.value = { id: cat.id, name: cat.name, imageFile: null, imagePreview: getImageUrl(cat.image) };
    isEditing.value = true;
  } else {
    form.value = { id: null, name: "", imageFile: null, imagePreview: null };
    isEditing.value = false;
  }
  errors.value = {};
  touched.value = {};
  showModal.value = true;
};

const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const error = validateImageFile(file);
  if (error) { showToast(error, "error"); event.target.value = ""; return; }
  form.value.imageFile = file;
  form.value.imagePreview = URL.createObjectURL(file);
};

const saveCategory = async () => {
  if (!validateAll({ name: form.value.name })) return;

  await runSave(async () => {
    try {
      const formData = new FormData();
      formData.append("name", form.value.name);
      if (form.value.imageFile) formData.append("imagem", form.value.imageFile);

      if (isEditing.value) {
        await categoryApi.update(form.value.id, formData);
      } else {
        await categoryApi.create(formData);
      }

      await menuStore.loadData();
      showToast(`Categoria "${form.value.name}" salva com sucesso!`, "success");
      showModal.value = false;
    } catch (error) {
      const status = error?.response?.status || error?.status;
      const data = error.response?.data || error.data || error;
      if (data?.errors && Array.isArray(data.errors)) {
        data.errors.forEach((err) => {
          errors.value[err.campo.replace("body.", "")] = err.mensagem;
        });
        showToast("Verifique os campos destacados em vermelho.", "error");
      } else if (status === 429) {
        showToast("Muitas requisições. Tente novamente.", "error");
      } else {
        showToast(data?.message || "Erro ao salvar categoria.", "error");
      }
    }
  });
};

const handleDeactivate = (cat) => {
  const hasProducts = menuStore.activeProducts?.some(
    (p) => String(p.categoryId) === String(cat.id)
  );
  if (hasProducts) {
    showConfirm({
      title: "Ação Bloqueada",
      message: `Não é possível inativar "${cat.name}" pois existem produtos vinculados. Remova ou altere a categoria dos produtos primeiro.`,
      isError: true,
    });
    return;
  }
  showConfirm({
    title: "Inativar Categoria",
    message: `Deseja inativar "${cat.name}"?`,
    onConfirm: async () => {
      const result = await menuStore.deactivateCategory(cat.id);
      if (result && !result.success) {
        showConfirm({ title: "Erro", message: result.message, isError: true });
      } else {
        showToast(`"${cat.name}" inativada.`, "success");
      }
    },
  });
};

const handleReactivate = (cat) => {
  showConfirm({
    title: "Ativar Categoria",
    message: `Ativar "${cat.name}"?`,
    onConfirm: async () => {
      await menuStore.reactivateCategory(cat.id);
      showToast(`"${cat.name}" ativada.`, "success");
    },
  });
};

const handleDelete = (cat) => {
  showConfirm({
    title: "Excluir Categoria",
    message: `Excluir "${cat.name}" definitivamente? Esta ação não pode ser desfeita.`,
    onConfirm: async () => {
      const result = await menuStore.deleteCategory(cat.id);
      if (result && !result.success) {
        showToast(result.status === 429 ? "Muitas requisições. Tente novamente." : result.message || "Erro ao excluir categoria.", "error");
      } else {
        showToast(`"${cat.name}" excluída.`, "success");
      }
    },
  });
};

const tableColumns = [
  { key: "image", label: "Ícone" },
  { key: "name", label: "Nome" },
  { key: "status", label: "Status" },
];
</script>

<template>
  <main class="max-w-6xl mx-auto py-12 px-6 font-inter">
    <PageHeader
      title="Gerenciar Categorias"
      subtitle="Controle de categorias de produtos do cardápio"
      backTo="back"
    >
      <template #actions>
        <BaseButton
          :variant="showInactive ? 'secondary' : 'ghost'"
          @click="showInactive = !showInactive"
        >
          <EyeOff :size="18" />
          {{ showInactive ? "Ver Ativas" : "Ver Inativas" }}
        </BaseButton>
        <BaseButton v-if="!showInactive" @click="openModal()" :icon="PlusCircle">
          Nova Categoria
        </BaseButton>
      </template>
    </PageHeader>

    <div
      v-if="showInactive"
      class="mb-8 p-4 bg-orange-500/10 border border-orange-500/20 rounded flex items-center justify-between"
    >
      <p class="text-orange-400 text-sm font-bold flex items-center gap-2">
        <EyeOff :size="18" /> Visualizando categorias inativas.
      </p>
      <button
        @click="showInactive = false"
        class="text-orange-300 hover:text-orange-100 text-sm font-bold underline transition-colors"
      >
        Voltar para ativas
      </button>
    </div>

    <EmptyState
      v-if="displayedCategories.length === 0"
      :icon="PlusCircle"
      :message="showInactive ? 'Nenhuma categoria inativa.' : 'Nenhuma categoria cadastrada.'"
      :action-label="!showInactive ? 'Nova Categoria' : undefined"
      @action="openModal()"
    />

    <DataTable
      v-else
      :columns="tableColumns"
      :data="displayedCategories"
    >
      <template #cell-image="{ item }">
        <div
          class="w-12 h-12 bg-gray-50 rounded flex items-center justify-center overflow-hidden border border-[#E0E0E0]"
        >
          <img v-if="item.image" :src="getImageUrl(item.image)" class="w-full h-full object-cover" />
          <ImageIcon v-else class="text-[#757575]" :size="20" />
        </div>
      </template>

      <template #cell-status="{ item }">
        <span
          v-if="item.status === 'Inativa'"
          class="px-3 py-1 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded text-[10px] font-black uppercase tracking-widest"
        >
          Inativa
        </span>
        <span
          v-else
          class="px-3 py-1 bg-accent-light text-accent border border-accent/30 rounded text-[10px] font-black uppercase tracking-widest"
        >
          Ativa
        </span>
      </template>

      <template #row-actions="{ item }">
        <template v-if="item.status === 'Ativa'">
          <button
            @click="openModal(item)"
            class="p-2 text-[#757575] hover:text-[#212121] transition-colors"
            title="Editar"
          >
            <Edit :size="18" />
          </button>
          <button
            @click="handleDeactivate(item)"
            class="p-2 text-[#757575] hover:text-orange-400 transition-colors"
            title="Inativar"
          >
            <EyeOff :size="18" />
          </button>
        </template>
        <template v-else>
          <button
            @click="handleReactivate(item)"
            class="p-2 text-[#757575] hover:text-accent transition-colors"
            title="Ativar"
          >
            <Eye :size="18" />
          </button>
          <button
            @click="handleDelete(item)"
            class="p-2 text-[#757575] hover:text-red-500 transition-colors"
            title="Excluir"
          >
            <Trash2 :size="18" />
          </button>
        </template>
      </template>
    </DataTable>

    <FormModal
      :show="showModal"
      :title="isEditing ? 'Editar Categoria' : 'Nova Categoria'"
      :save-label="isEditing ? 'Salvar Alterações' : 'Criar Categoria'"
      :is-loading="isSaving"
      size="sm"
      @close="showModal = false"
      @save="saveCategory"
    >
      <div class="space-y-6">
        <div class="flex justify-center">
          <label
            class="cursor-pointer group relative w-32 h-32 bg-gray-50 rounded flex items-center justify-center overflow-hidden border-2 border-dashed border-[#E0E0E0] hover:border-accent/50 transition-all"
          >
            <img
              v-if="form.imagePreview"
              :src="form.imagePreview"
              class="w-full h-full object-cover"
            />
            <div v-else class="flex flex-col items-center text-[#757575]">
              <ImageIcon :size="32" />
              <span class="text-[10px] font-black uppercase tracking-widest mt-2">Ícone</span>
            </div>
            <div
              class="absolute inset-0 bg-gray-100 transition-all flex items-center justify-center text-[#212121] opacity-0 group-hover:opacity-100 font-bold text-xs uppercase tracking-wider"
            >
              Alterar
            </div>
            <input type="file" class="hidden" accept="image/*" @change="handleImageUpload" />
          </label>
        </div>

        <BaseInput
          v-model="form.name"
          label="Nome da Categoria"
          placeholder="Ex: Bebidas"
          :error="errors.name"
          @blur="touchField('name', form.name)"
          @input="touched['name'] && validateField('name', form.name)"
        />
      </div>
    </FormModal>

    <ConfirmModal :confirm-modal="confirmState" @close="closeConfirm" />
  </main>
</template>
