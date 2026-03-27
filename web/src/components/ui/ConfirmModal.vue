<script setup>
const props = defineProps({
    confirmModal: { type: Object, required: true }
});
const emit = defineEmits(['close']);

const closeConfirm = () => {
    emit('close'); 
};

const handleConfirm = () => {
    if (props.confirmModal.onConfirm) {
        props.confirmModal.onConfirm(props.confirmModal.data);
    }
    closeConfirm();
};
</script>
<template>
    <div v-if="confirmModal.show"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden border border-gray-200">
            <div class="p-5 bg-white">
                <h3 class="text-lg font-bold text-gray-900">
                    {{ confirmModal.title }}
                </h3>
                <p class="text-sm mt-2 font-medium text-gray-800">
                    {{ confirmModal.message }}
                </p>
            </div>
            <div class="px-5 py-3 bg-gray-50 flex justify-end gap-2 border-t border-gray-100">
                <button v-if="!confirmModal.isError" @click="closeConfirm"
                    class="px-4 py-2 text-sm text-gray-700 font-bold hover:bg-gray-200 rounded transition-colors">
                    Cancelar
                </button>
                <button @click="handleConfirm"
                    class="px-4 py-2 text-sm text-white font-bold rounded transition-colors shadow-sm"
                    :class="confirmModal.isError ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'">
                    {{ confirmModal.isError ? 'Entendi' : 'Confirmar' }}
                </button>
            </div>
        </div>
    </div>
</template>