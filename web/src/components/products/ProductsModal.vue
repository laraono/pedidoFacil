<script setup>
import { ref, watch } from 'vue';
import { X, Image as ImageIcon, Plus, Trash2 } from 'lucide-vue-next';
import { BaseButton, BaseInput, BaseSelect, BaseTextArea, BaseToggle } from '@/components/ui/';

const props = defineProps({
  show: Boolean,
  isEditing: Boolean,
  initialData: Object,
  categories: Array
});

const emit = defineEmits(['close', 'save']);

const errors = ref({});
const touched = ref({});
const form = ref({});

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2
});

watch(() => props.show, (newVal) => {
  if (newVal) {
    form.value = JSON.parse(JSON.stringify(props.initialData));
    errors.value = {};
    touched.value = {};
  }
}, { immediate: true });

const validateField = (field) => {
  if (field === 'name') {
    if (!form.value.name?.trim()) errors.value.name = 'O título é obrigatório.';
    else delete errors.value.name;
  }
  if (field === 'categoryId') {
    if (!form.value.categoryId) errors.value.categoryId = 'Selecione uma categoria.';
    else delete errors.value.categoryId;
  }
};

const touchField = (field) => {
  touched.value[field] = true;
  validateField(field);
};

const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      form.value.imagePreview = e.target.result;
      form.value.image = e.target.result;
    };
    reader.readAsDataURL(file);
  }
};

const updatePrice = (index, event, type = 'sizes') => {
  let rawValue = event.target.value.replace(/\D/g, '');
  if (rawValue === '') rawValue = '0';
  const floatValue = parseFloat(rawValue) / 100;
  
  if (type === 'sizes') form.value.sizes[index].price = floatValue;
  else form.value.addons[index].price = floatValue;
};

const addSize = () => form.value.sizes.push({ name: '', price: 0 });
const removeSize = (index) => form.value.sizes.length > 1 && form.value.sizes.splice(index, 1);
const addAddon = () => form.value.addons.push({ name: '', price: 0 });
const removeAddon = (index) => form.value.addons.splice(index, 1);

const handleSave = () => {
  touchField('name');
  touchField('categoryId');
  if (Object.keys(errors.value).length === 0) {
    emit('save', form.value);
  }
};
</script>

<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
    <div class="bg-white rounded shadow-2xl w-full max-w-4xl my-4 overflow-hidden flex flex-col max-h-[95vh]">
      
      <div class="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <h2 class="text-xl font-bold text-[#212121]">{{ isEditing ? 'Editar Produto' : 'Novo Produto' }}</h2>
        <button @click="emit('close')" class="text-[#757575] hover:text-[#757575] transition-colors"><X :size="24" /></button>
      </div>
      
      <div class="p-6 sm:p-10 overflow-y-auto custom-scrollbar">
        <div class="flex flex-col md:grid md:grid-cols-3 gap-8">
          
          <div class="md:col-span-1 space-y-6">
            <div>
              <label class="block text-sm font-bold text-[#757575] mb-3 ml-1">Imagem do Produto</label>
              <div class="relative w-full aspect-square bg-gray-50 rounded border-2 border-dashed border-gray-200 hover:border-accent/50 transition-all overflow-hidden group cursor-pointer">
                <img v-if="form.imagePreview" :src="form.imagePreview" class="w-full h-full object-cover" />
                <div v-else class="w-full h-full flex flex-col items-center justify-center text-[#757575]">
                  <ImageIcon :size="40" />
                  <span class="text-xs mt-2 font-medium">Fazer Upload</span>
                </div>
                <input type="file" class="absolute inset-0 opacity-0 cursor-pointer" @change="handleImageUpload" accept="image/*" />
              </div>
            </div>

            <div class="bg-gray-50 p-4 rounded border border-gray-100">
              <BaseToggle 
                label="Disponibilidade" 
                v-model="form.isAvailable" 
                :description="form.isAvailable ? 'Visível no cardápio' : 'Oculto para clientes'"
              />
            </div>
          </div>

          <div class="md:col-span-2 space-y-5">
            <BaseInput 
              label="Título do Produto *" 
              v-model="form.name" 
              placeholder="Ex: Burger Artesanal" 
              :error="errors.name"
              @blur="touchField('name')"
            />

            <BaseSelect 
              label="Categoria *"
              v-model="form.categoryId"
              :error="errors.categoryId"
              :options="categories.map(c => ({ label: c.name, value: c.id }))"
              @change="touchField('categoryId')"
            />

            <BaseTextArea 
              label="Descrição" 
              v-model="form.description" 
              placeholder="Descreva os ingredientes e detalhes do prato..."
              :rows="4"
            />

            <div class="bg-blue-50/50 p-5 rounded border border-blue-100">
              <div class="flex justify-between items-center mb-4">
                <h3 class="text-blue-900 font-bold text-sm uppercase tracking-wider">Tamanhos e Preços</h3>
                <BaseButton variant="ghost" @click="addSize" class="text-sm py-2 px-3 text-[#757575]">
                  <Plus :size="16" /> Adicionar
                </BaseButton>
              </div>
              <div v-for="(size, index) in form.sizes" :key="index" class="flex gap-3 mb-3 items-center">
                <input v-model="size.name" placeholder="Ex: Grande" class="text-[#757575] flex-1 p-3 bg-white border border-gray-200 rounded text-sm" />
                <div class="relative w-36">
                  <input :value="currencyFormatter.format(size.price)" @input="updatePrice(index, $event, 'sizes')" class="text-[#757575] w-full pl-9 p-3 bg-white border border-gray-200 rounded text-sm text-right font-mono" />
                </div>
                <button @click="removeSize(index)" class="text-danger hover:text-red-600 p-2"><Trash2 :size="20" /></button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="p-6 border-t border-gray-100 bg-gray-50 flex flex-col-reverse sm:flex-row justify-end gap-3">
        <BaseButton variant="secondary" @click="emit('close')" class="min-w-[120px]">Cancelar</BaseButton>
        <BaseButton variant="primary" @click="handleSave" class="min-w-[180px]">
          {{ isEditing ? 'Salvar Alterações' : 'Criar Produto' }}
        </BaseButton>
      </div>

    </div>
  </div>
</template>