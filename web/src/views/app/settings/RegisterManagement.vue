<!-- 



############################################

 Fluxo desativado. Requer integração e configuração prévia com o terminal de cartão. 

 ###########################################


<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from '@/composables/useToast';
import BaseInput from '@/components/ui/BaseInput.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import ConfirmModal from '@/components/ui/ConfirmModal.vue';
import {
    ArrowLeft,
    PlusCircle,
    Image as ImageIcon,
    X,
    Archive,
    RotateCcw,
    Trash2,
    Link
} from "lucide-vue-next";
import {registerApi} from '@/services/registerApi'
import {establishmentApi} from '@/services/establishmentApi'

const router = useRouter();
const { showToast } = useToast();

onMounted(async () => {
  registers.value = await registerApi.list();
  establishment.value = await establishmentApi.getProfile()
});

const showModal = ref(false);
const isLoading = ref(false);
const showDeleted = ref(false);
const establishment = ref({})

const registers = ref([])

const errors = ref({});
const touched = ref({});

const form = ref({ id: null, name: "", image: null, imagePreview: null });

const confirmModal = ref({
    show: false, title: '', message: '', onConfirm: null, data: null, isError: false,
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
    if (field === 'name') {
        errors.value.name = !form.value.name.trim() ? 'O nome do caixa é obrigatório.' : '';
        if (!errors.value.name) delete errors.value.name;
    }
};

const touchField = (field) => {
    touched.value[field] = true;
    validateField(field);
};

const openAddModal = () => {
    form.value = { id: null, name: '', image: null, imagePreview: null };
    errors.value = {};
    touched.value = {};
    showModal.value = true;
};

const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
        form.value.imagePreview = URL.createObjectURL(file);
        form.value.image = file;
    }
};

const associateRegisterToTerminal = async (register) => {
    if(!register.terminalId)
    await registerApi.associate(register.id)
}

const saveRegister = async () => {
    touchField('name');
    if (Object.keys(errors.value).length) return;

    isLoading.value = true;
    try {
        const payload = { name: form.value.name };
        
        await registerApi.post(form.value.name, form.value.image)

        showToast(`Caixa "${form.value.name}" salvo com sucesso!`, 'success');
        showModal.value = false;

        categories.value = await registerApi.list()
    } catch {
        showToast('Erro ao salvar caixa.', 'error');
    } finally {
        isLoading.value = false;
    }
};

const handlePermanentDelete = async (register) => {
    showConfirm('Excluir Permanentemente', `Esta ação é irreversível! "${register.name}" será excluído.`, async (cat) => await registerApi.deleteRegister(cat.id), register);
    registers.value = await registerApi.list()
};
</script>

<template>
    <main class="max-w-6xl mx-auto py-12 px-6 font-inter">
        
        <header class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-6">
            <div class="flex items-center gap-4">
                <button @click="router.back()" class="p-3 bg-gray-50 border border-[#E0E0E0] rounded text-[#757575] hover:text-[#212121] transition-colors">
                    <ArrowLeft :size="20" />
                </button>
                <div>
                    <h1 class="text-3xl font-black text-[#212121]">Gerenciar Caixas</h1>
                    <p class="text-[#757575] text-sm">Controle de caixas/terminais de PDV</p>
                </div>
            </div>

            <div v-if="!establishment.mercadoPagoApi" class="bg-amber-50 border border-amber-200 rounded-lg p-4 w-full sm:w-auto">
                <div class="flex items-start gap-3">
                    <div class="flex-shrink-0">
                        <svg class="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                        </svg>
                    </div>
                    <div class="flex-1">
                        <p class="text-sm font-semibold text-amber-800">Configuração incompleta</p>
                        <p class="text-xs text-amber-700">Termine de configurar seu estabelecimento colocando todas as informações de endereço</p>
                    </div>
                </div>
            </div>

            <div v-else class="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <BaseButton @click="openAddModal" :icon="PlusCircle" class="w-full sm:w-auto">
                    Novo Caixa
                </BaseButton>
            </div>
        </header>

        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div class="flex items-start gap-3">
                <div class="flex-shrink-0">
                    <svg class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                    </svg>
                </div>
                <div class="flex-1">
                    <p class="text-sm font-semibold text-blue-800">Informação importante</p>
                    <p class="text-xs text-blue-700">Cada caixa criado corresponde a um terminal PDV</p>
                </div>
            </div>
        </div>

        <div class="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div class="flex items-start gap-3">
                <div class="flex-shrink-0">
                    <svg class="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
                </div>
                <div class="flex-1">
                    <p class="text-sm font-semibold text-amber-800">Atenção</p>
                    <p class="text-xs text-amber-700">Para conectar seu terminal PDV ao estabelecimento, primeiro crie um caixa</p>
                </div>
            </div>
        </div>

        <div class="bg-white border border-[#E0E0E0] rounded overflow-x-auto shadow-2xl">
            <table class="w-full text-left border-collapse">
                <thead class="bg-gray-100 text-[#757575] uppercase text-[10px] font-black tracking-widest">
                    <tr>
                        <th class="p-4 sm:p-6 border-b border-[#E0E0E0]">Nome</th>
                        <th class="p-4 sm:p-6 border-b border-[#E0E0E0] text-right whitespace-nowrap">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="registers.length === 0">
                        <td colspan="4" class="p-12 text-center text-[#757575] text-sm font-bold">Nenhum caixa encontrada.</td>
                    </tr>
                    <tr
                        v-for="register in registers"
                        :key="register.id"
                        class="hover:bg-gray-50 border-b border-[#E0E0E0] last:border-0 transition-colors"
                        :class="{ 'opacity-50 grayscale': register.deletedAt }"
                    >
                        <td class="p-4 sm:p-6 font-bold text-[#212121] text-sm sm:text-base truncate max-w-[150px] sm:max-w-none">{{ register.name }}</td>
                        <td class="p-4 sm:p-6 text-right whitespace-nowrap">
                            <div class="flex justify-end gap-2">
                                <template v-if="!register.deletedAt">
                                    <button @click="handlePermanentDelete(register)" class="p-2 text-[#757575] hover:text-red-500 transition-colors" title="Deletar permanentemente">
                                        <Trash2 :size="18" />
                                    </button>
                                    <button @click="associateRegisterToTerminal(register)" class="p-2 text-[#757575] hover:text-blue-600 transition-colors" title="Associar caixa ao terminal">
                                        <Link :size="18" />
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
                <div v-if="showModal" class="fixed inset-0 bg-black/50  z-[100] flex items-center justify-center p-4">
                    <div class="bg-white border border-[#E0E0E0] w-full max-w-md rounded flex flex-col shadow-2xl overflow-hidden">
                        
                        <header class="p-8 border-b border-[#E0E0E0] flex justify-between items-center bg-gray-100">
                            <h2 class="text-2xl font-black text-[#212121] flex items-center gap-3">
                                {{ 'Novo Caixa' }}
                            </h2>
                            <button @click="showModal = false" class="p-2 text-[#757575] hover:text-[#212121] transition-colors">
                                <X :size="24" />
                            </button>
                        </header>

                        <div class="p-8 space-y-6">

                            <BaseInput
                                v-model="form.name"
                                label="Nome do Caixa"
                                placeholder="Ex: Bebidas"
                                :error="errors.name"
                                @blur="touchField('name')"
                                @input="() => { if (touched.name) validateField('name'); }"
                            />
                        </div>

                        <footer class="p-8 border-t border-[#E0E0E0] bg-gray-100 flex justify-end gap-4">
                            <button @click="showModal = false" class="px-6 py-3 rounded text-[#757575] font-bold hover:bg-gray-50 hover:text-[#212121] transition-colors">
                                Cancelar
                            </button>
                            <BaseButton @click="saveRegister" :isLoading="isLoading" class="px-8">
                                {{ 'Criar Caixa' }}
                            </BaseButton>
                        </footer>
                    </div>
                </div>
            </Transition>
        </Teleport>

        <ConfirmModal :confirmModal="confirmModal" @close="confirmModal.show = false" />

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
</style> -->
