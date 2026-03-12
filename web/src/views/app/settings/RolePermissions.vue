<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { AVAILABLE_PERMISSIONS } from '@/utils/permissions';
import { getRolesMock, saveRolesMock } from '@/mock/authmock';
import { useToast } from '@/composables/useToast';
import { useFormValidation } from '@/composables/useFormValidation';
import BaseInput from '@/components/ui/BaseInput.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import {
  ShieldCheck, Plus, ArrowLeft, Lock, CheckCircle, X, AlertCircle
} from 'lucide-vue-next';

const router = useRouter();
const { showToast } = useToast();

const roles = ref([]);
const isModalOpen = ref(false);
const isEditing = ref(false);
const isLoading = ref(false);

const currentRole = ref({ id: null, name: '', permissions: [] });

const validationRules = {
  name: [
    { validator: (v) => !!v?.trim(), message: 'O nome do cargo é obrigatório.' }
  ],
  permissions: [
    { validator: (v) => v?.length > 0, message: 'Selecione pelo menos um nível de acesso.' }
  ]
};

const { errors, validateAll, validateField } = useFormValidation(validationRules);

onMounted(() => {
  roles.value = getRolesMock();
});

const saveRole = async () => {
  if (!validateAll(currentRole.value)) {
    showToast('Existem erros no formulário.', 'error');
    return;
  }

  isLoading.value = true;
  try {
    if (isEditing.value) {
      const idx = roles.value.findIndex(r => r.id === currentRole.value.id);
      roles.value[idx] = { ...currentRole.value };
    } else {
      roles.value.push({ ...currentRole.value, id: Date.now() });
    }

    await saveRolesMock(roles.value);
    showToast(`Cargo "${currentRole.value.name}" salvo com sucesso!`, 'success');
    isModalOpen.value = false;
  } catch {
    showToast('Erro ao salvar cargos.', 'error');
  } finally {
    isLoading.value = false;
  }
};

const openModal = (role = null) => {
  if (role) {
    currentRole.value = JSON.parse(JSON.stringify(role));
    isEditing.value = true;
  } else {
    currentRole.value = { id: null, name: '', permissions: [] };
    isEditing.value = false;
  }
  isModalOpen.value = true;
};

const togglePermission = (id) => {
  const perms = currentRole.value.permissions;
  const idx = perms.indexOf(id);
  
  if (idx > -1) perms.splice(idx, 1);
  else perms.push(id);
  
  validateField('permissions', perms);
};
</script>

<template>
  <main class="max-w-6xl mx-auto py-12 px-6 font-inter">
    
    <header class="flex items-center justify-between mb-10">
      <div class="flex items-center gap-4">
        <button @click="router.push('/app/dashboard')" class="p-3 bg-white/5 border border-white/10 rounded-2xl text-gray-400 hover:text-white transition-colors">
          <ArrowLeft :size="20" />
        </button>
        <div>
          <h1 class="text-3xl font-black text-white">Cargos e Permissões</h1>
          <p class="text-gray-400 text-sm">Gerenciando acessos do estabelecimento</p>
        </div>
      </div>
      <BaseButton @click="openModal()" :icon="Plus">
        Novo Cargo
      </BaseButton>
    </header>

    <div v-if="roles.length === 0" class="flex flex-col items-center justify-center py-20 text-gray-600">
      <ShieldCheck :size="48" class="mb-4 opacity-20" />
      <p class="font-black uppercase tracking-widest text-sm opacity-40">Nenhum cargo cadastrado</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div
        v-for="role in roles"
        :key="role.id"
        class="bg-dark-card border border-white/10 rounded-[2rem] p-8 group transition-all hover:border-brand-green/30 cursor-pointer"
        @click="openModal(role)"
      >
        <div class="flex justify-between items-start mb-6">
          <ShieldCheck class="text-brand-green" :size="24" />
        </div>
        <h3 class="text-xl font-bold text-white">{{ role.name }}</h3>
        <p class="text-[10px] font-black uppercase tracking-widest text-gray-500 mt-2">
          {{ role.permissions.length }} Permissões Ativas
        </p>
        <div class="flex flex-wrap gap-1 mt-4">
          <span
            v-for="permId in role.permissions.slice(0, 3)"
            :key="permId"
            class="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 bg-brand-green/10 text-brand-green rounded-full border border-brand-green/20"
          >
            {{ AVAILABLE_PERMISSIONS.find(p => p.id === permId)?.label || permId }}
          </span>
          <span v-if="role.permissions.length > 3" class="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 bg-white/5 text-gray-400 rounded-full">
            +{{ role.permissions.length - 3 }}
          </span>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <Transition name="fade">
        <div v-if="isModalOpen" class="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div class="bg-dark-card border border-white/10 w-full max-w-2xl rounded-[2.5rem] flex flex-col max-h-[90vh] shadow-2xl">
            
            <header class="p-8 border-b border-white/5 flex justify-between items-center bg-black/20">
              <h2 class="text-2xl font-black text-white flex items-center gap-3">
                <Lock :size="24" class="text-brand-green" />
                {{ isEditing ? 'Editar Cargo' : 'Novo Cargo' }}
              </h2>
              <button @click="isModalOpen = false" class="p-2 text-gray-400 hover:text-white">
                <X :size="24" />
              </button>
            </header>

            <div class="p-8 overflow-y-auto custom-scrollbar space-y-8">
              <BaseInput
                v-model="currentRole.name"
                label="Nome do Cargo"
                placeholder="Ex: Supervisor"
                :error="errors.name"
                @input="validateField('name', currentRole.name)"
              />

              <div class="space-y-4">
                <label class="text-xs font-black uppercase tracking-widest text-gray-500 ml-2">Permissões de Acesso</label>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    v-for="perm in AVAILABLE_PERMISSIONS"
                    :key="perm.id"
                    @click="togglePermission(perm.id)"
                    :class="currentRole.permissions.includes(perm.id) ? 'border-brand-green bg-brand-green/5' : 'border-white/5 bg-white/5'"
                    class="p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-4"
                  >
                    <div class="mt-1">
                      <div
                        class="w-5 h-5 rounded border border-white/20 flex items-center justify-center"
                        :class="currentRole.permissions.includes(perm.id) ? 'bg-brand-green border-brand-green' : ''"
                      >
                        <CheckCircle v-if="currentRole.permissions.includes(perm.id)" :size="14" class="text-black" />
                      </div>
                    </div>
                    <div>
                      <span class="block font-bold text-sm" :class="currentRole.permissions.includes(perm.id) ? 'text-brand-green' : 'text-white'">
                        {{ perm.label }}
                      </span>
                      <span class="text-[10px] text-gray-500 font-medium">{{ perm.desc }}</span>
                    </div>
                  </div>
                </div>
                <p v-if="errors.permissions" class="text-red-500 text-xs font-bold ml-2 flex items-center gap-1">
                  <AlertCircle :size="12" /> {{ errors.permissions }}
                </p>
              </div>
            </div>

            <footer class="p-8 border-t border-white/5 bg-black/20 flex justify-end gap-4">
              <button @click="isModalOpen = false" class="px-6 py-3 rounded-2xl text-gray-400 font-bold hover:bg-white/5 hover:text-white transition-colors">
                Cancelar
              </button>
              <BaseButton @click="saveRole" :isLoading="isLoading" class="px-12">
                Salvar Cargo
              </BaseButton>
            </footer>
          </div>
        </div>
      </Transition>
    </Teleport>
  </main>
</template>