<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useMenuStore } from "@/stores/productsManagement.js";
import { useToast } from "@/composables/useToast";
import BaseInput from "@/components/ui/BaseInput.vue";
import BaseButton from "@/components/ui/BaseButton.vue";
import ConfirmModal from "@/components/ui/ConfirmModal.vue";
import {
  ArrowLeft,
  PlusCircle,
  Edit,
  Image as ImageIcon,
  X,
  Archive,
  RotateCcw,
  Trash2,
} from "lucide-vue-next";

const router = useRouter();
const menuStore = useMenuStore();
const { showToast } = useToast();

onMounted(() => {
  menuStore.loadData();
});

const showModal = ref(false);
const isEditing = ref(false);
const isLoading = ref(false);
const showDeleted = ref(false);

const displayedCategories = computed(() =>
  showDeleted.value ? menuStore.deletedCategories : menuStore.activeCategories,
);

const errors = ref({});
const touched = ref({});

const form = ref({ id: null, name: "", image: null, imagePreview: null });

const confirmModal = ref({
  show: false,
  title: "",
  message: "",
  onConfirm: null,
  data: null,
  isError: false,
});

const showConfirm = (title, message, onConfirm, data = null, options = {}) => {
  confirmModal.value = {
    show: true,
    title,
    message,
    onConfirm,
    data,
    isError: options.isError || false,
  };
};

const validateField = (field) => {
  if (field === "name") {
    errors.value.name = !form.value.name.trim()
      ? "O nome da categoria é obrigatório."
      : "";
    if (!errors.value.name) delete errors.value.name;
  }
};

const touchField = (field) => {
  touched.value[field] = true;
  validateField(field);
};

const openAddModal = () => {
  isEditing.value = false;
  form.value = { id: null, name: "", image: null, imagePreview: null };
  errors.value = {};
  touched.value = {};
  showModal.value = true;
};

const openEditModal = (category) => {
  isEditing.value = true;
  form.value = {
    id: category.id,
    name: category.name,
    image: category.image,
    imagePreview: category.image,
  };
  errors.value = {};
  touched.value = {};
  showModal.value = true;
};

const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const maxSize = 2 * 1024 * 1024; 
  if (file.size > maxSize) {
    showToast("Arquivo muito grande! O limite é 2MB antes da compressão.", "error");
    event.target.value = ""; 
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const MAX_WIDTH = 600;
      const MAX_HEIGHT = 600;
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height;
          height = MAX_HEIGHT;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);

      form.value.imagePreview = compressedBase64;
      form.value.image = compressedBase64; 
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
};

const saveCategory = async () => {
  touchField("name");
  if (Object.keys(errors.value).length) return;

  isLoading.value = true;
  try {
    const payload = {
      id: form.value.id,
      name: form.value.name,
      image: form.value.image, 
    };

    if (isEditing.value) await menuStore.updateCategory(payload);
    else await menuStore.addCategory(payload);
    
    showToast(`Categoria "${form.value.name}" salva com sucesso!`, "success");
    showModal.value = false;
  } catch (error) {
    const data = error.response?.data || error.data || error;
    
    if (data?.errors && Array.isArray(data.errors)) {
      data.errors.forEach((err) => {
        let field = err.campo.replace("body.", "");
        
        errors.value[field] = err.mensagem;
      });
      
      showToast("Verifique os campos destacados em vermelho.", "error");
    } else {
      showToast(data?.message || "Erro ao salvar categoria.", "error");
    }
  } finally {
    isLoading.value = false;
  }
};
const handleDelete = (category) => {
  const hasProducts = menuStore.activeProducts?.some(
    (p) => String(p.categoryId) === String(category.id),
  );
  if (hasProducts) {
    showConfirm(
      "Ação Bloqueada",
      `Não é possível arquivar "${category.name}" pois existem produtos vinculados. Remova ou altere a categoria dos produtos primeiro.`,
      null,
      null,
      { isError: true },
    );
    return;
  }
  showConfirm(
    "Arquivar Categoria",
    `Deseja arquivar "${category.name}"?`,
    async (cat) => {
      const result = await menuStore.softDeleteCategory(cat.id);
      if (result && !result.success)
        showConfirm("Erro", result.message, null, null, { isError: true });
      else showToast("Categoria arquivada.", "success");
    },
    category,
  );
};

const handleRestore = (category) => {
  showConfirm(
    "Restaurar Categoria",
    `Restaurar "${category.name}"?`,
    async (cat) => {
      await menuStore.restoreCategory(cat.id);
      showToast("Categoria restaurada.", "success");
    },
    category,
  );
};

const handlePermanentDelete = (category) => {
  showConfirm(
    "Excluir Permanentemente",
    `Esta ação é irreversível! "${category.name}" será excluída.`,
    (cat) => {
      menuStore.permanentlyDeleteCategory(cat.id);
      showToast("Categoria removida do painel local.", "success");
    },
    category,
  );
};
</script>

<template>
  <main class="max-w-6xl mx-auto py-12 px-6 font-inter">
    <header
      class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-6"
    >
      <div class="flex items-center gap-4">
        <button
          @click="router.back()"
          class="p-3 bg-gray-50 border border-[#E0E0E0] rounded text-[#757575] hover:text-[#212121] transition-colors"
        >
          <ArrowLeft :size="20" />
        </button>
        <div>
          <h1 class="text-3xl font-black text-[#212121]">
            Gerenciar Categorias
          </h1>
          <p class="text-[#757575] text-sm">
            Controle de categorias de produtos do cardápio
          </p>
        </div>
      </div>

      <div class="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        <button
          @click="showDeleted = !showDeleted"
          class="px-5 py-3 rounded flex items-center justify-center gap-2 transition-all font-bold text-sm border w-full sm:w-auto"
          :class="
            showDeleted
              ? 'bg-gray-100 text-[#212121] border-[#E0E0E0]'
              : 'bg-gray-50 text-[#757575] border-[#E0E0E0] hover:bg-gray-100 hover:text-[#212121]'
          "
        >
          <Archive :size="18" />
          {{ showDeleted ? "Ver Ativas" : "Ver Arquivadas" }}
        </button>

        <BaseButton
          v-if="!showDeleted"
          @click="openAddModal"
          :icon="PlusCircle"
          class="w-full sm:w-auto"
        >
          Nova Categoria
        </BaseButton>
      </div>
    </header>

    <div
      v-if="showDeleted"
      class="mb-8 p-4 bg-orange-500/10 border border-orange-500/20 rounded flex items-center justify-between"
    >
      <p class="text-orange-400 text-sm font-bold flex items-center gap-2">
        <Archive :size="18" /> Visualizando categorias arquivadas.
      </p>
      <button
        @click="showDeleted = false"
        class="text-orange-300 hover:text-orange-100 text-sm font-bold underline transition-colors"
      >
        Voltar para ativas
      </button>
    </div>

    <div
      class="bg-white border border-[#E0E0E0] rounded overflow-x-auto shadow-2xl"
    >
      <table class="w-full text-left border-collapse">
        <thead
          class="bg-gray-100 text-[#757575] uppercase text-[10px] font-black tracking-widest"
        >
          <tr>
            <th class="p-4 sm:p-6 border-b border-[#E0E0E0] w-20">Ícone</th>
            <th class="p-4 sm:p-6 border-b border-[#E0E0E0]">Nome</th>
            <th class="p-4 sm:p-6 border-b border-[#E0E0E0] whitespace-nowrap">
              Status
            </th>
            <th
              class="p-4 sm:p-6 border-b border-[#E0E0E0] text-right whitespace-nowrap"
            >
              Ações
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="displayedCategories.length === 0">
            <td
              colspan="4"
              class="p-12 text-center text-[#757575] text-sm font-bold"
            >
              Nenhuma categoria encontrada.
            </td>
          </tr>
          <tr
            v-for="cat in displayedCategories"
            :key="cat.id"
            class="hover:bg-gray-50 border-b border-[#E0E0E0] last:border-0 transition-colors"
            :class="{ 'opacity-50 grayscale': cat.deletedAt }"
          >
            <td class="p-4 sm:p-6 w-20">
              <div
                class="w-12 h-12 bg-gray-50 rounded flex items-center justify-center overflow-hidden border border-[#E0E0E0]"
              >
                <img
                  v-if="cat.image"
                  :src="cat.image"
                  class="w-full h-full object-cover"
                />
                <ImageIcon v-else class="text-[#757575]" :size="20" />
              </div>
            </td>
            <td
              class="p-4 sm:p-6 font-bold text-[#212121] text-sm sm:text-base truncate max-w-[150px] sm:max-w-none"
            >
              {{ cat.name }}
            </td>
            <td class="p-4 sm:p-6 whitespace-nowrap">
              <span
                v-if="cat.deletedAt"
                class="px-3 py-1 bg-gray-100 text-[#757575] border border-[#E0E0E0] rounded text-[10px] font-black uppercase tracking-widest"
              >
                {{ new Date(cat.deletedAt).toLocaleDateString() }}
              </span>
              <span
                v-else
                class="px-3 py-1 bg-accent-light text-accent border border-accent/30 rounded text-[10px] font-black uppercase tracking-widest"
              >
                Ativa
              </span>
            </td>
            <td class="p-4 sm:p-6 text-right whitespace-nowrap">
              <div class="flex justify-end gap-2">
                <template v-if="!cat.deletedAt">
                  <button
                    @click="openEditModal(cat)"
                    class="p-2 text-[#757575] hover:text-[#212121] transition-colors"
                    title="Editar"
                  >
                    <Edit :size="18" />
                  </button>
                  <button
                    @click="handleDelete(cat)"
                    class="p-2 text-[#757575] hover:text-orange-400 transition-colors"
                    title="Arquivar"
                  >
                    <Archive :size="18" />
                  </button>
                </template>
                <template v-else>
                  <button
                    @click="handleRestore(cat)"
                    class="p-2 text-[#757575] hover:text-accent transition-colors"
                    title="Restaurar"
                  >
                    <RotateCcw :size="18" />
                  </button>
                  <button
                    @click="handlePermanentDelete(cat)"
                    class="p-2 text-[#757575] hover:text-red-500 transition-colors"
                    title="Deletar permanentemente"
                  >
                    <Trash2 :size="18" />
                  </button>
                </template>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showModal"
          class="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4"
        >
          <div
            class="bg-white border border-[#E0E0E0] w-full max-w-md rounded flex flex-col shadow-2xl overflow-hidden"
          >
            <header
              class="p-8 border-b border-[#E0E0E0] flex justify-between items-center bg-gray-100"
            >
              <h2
                class="text-2xl font-black text-[#212121] flex items-center gap-3"
              >
                <Edit :size="24" class="text-accent" />
                {{ isEditing ? "Editar Categoria" : "Nova Categoria" }}
              </h2>
              <button
                @click="showModal = false"
                class="p-2 text-[#757575] hover:text-[#212121] transition-colors"
              >
                <X :size="24" />
              </button>
            </header>

            <div class="p-8 space-y-6">
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
                    <span
                      class="text-[10px] font-black uppercase tracking-widest mt-2"
                      >Ícone</span
                    >
                  </div>
                  <div
                    class="absolute inset-0 bg-gray-100 transition-all flex items-center justify-center text-[#212121] opacity-0 group-hover:opacity-100 font-bold text-xs uppercase tracking-wider"
                  >
                    Alterar
                  </div>
                  <input
                    type="file"
                    class="hidden"
                    accept="image/*"
                    @change="handleImageUpload"
                  />
                </label>
              </div>

              <BaseInput
                v-model="form.name"
                label="Nome da Categoria"
                placeholder="Ex: Bebidas"
                :error="errors.name"
                @blur="touchField('name')"
                @input="
                  () => {
                    if (touched.name) validateField('name');
                  }
                "
              />
            </div>

            <footer
              class="p-8 border-t border-[#E0E0E0] bg-gray-100 flex justify-end gap-4"
            >
              <button
                @click="showModal = false"
                class="px-6 py-3 rounded text-[#757575] font-bold hover:bg-gray-50 hover:text-[#212121] transition-colors"
              >
                Cancelar
              </button>
              <BaseButton
                @click="saveCategory"
                :isLoading="isLoading"
                class="px-8"
              >
                {{ isEditing ? "Salvar Alterações" : "Criar Categoria" }}
              </BaseButton>
            </footer>
          </div>
        </div>
      </Transition>
    </Teleport>

    <ConfirmModal
      :confirmModal="confirmModal"
      @close="confirmModal.show = false"
    />
  </main>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
