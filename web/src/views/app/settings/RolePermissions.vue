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
  ShieldCheck, Plus, ArrowLeft, Lock, CheckCircle, X, AlertCircle, Trash2
} from 'lucide-vue-next';

const router = useRouter();
const { showToast } = useToast();

const roles = ref([]);
const isModalOpen = ref(false);
const isEditing = ref(false);
const isLoading = ref(false);
const confirmDeleteRole = ref(null);

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

const PROTECTED_ROLE_NAMES = ['Admin', 'Gerente'];
const HIDDEN_ROLE_NAMES = ['Admin'];

onMounted(() => {
  roles.value = getRolesMock().filter(r => !HIDDEN_ROLE_NAMES.includes(r.name));
});

const saveRole = async () => {
  if (!validateAll(currentRole.value)) {
    const msg = !currentRole.value.permissions?.length
      ? 'Selecione ao menos uma permissão antes de salvar o cargo.'
      : 'Preencha o nome do cargo.';
    showToast(msg, 'error');
    return;
  }

  isLoading.value = true;
  try {
    // Preserve hidden roles (Admin) when saving
    const allRoles = getRolesMock();
    const hiddenRoles = allRoles.filter(r => HIDDEN_ROLE_NAMES.includes(r.name));

    if (isEditing.value) {
      const idx = roles.value.findIndex(r => r.id === currentRole.value.id);
      roles.value[idx] = { ...currentRole.value };
    } else {
      roles.value.push({ ...currentRole.value, id: Date.now() });
    }

    await saveRolesMock([...hiddenRoles, ...roles.value]);
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

const deleteRole = async () => {
  const role = confirmDeleteRole.value;
  if (!role) return;
  if (PROTECTED_ROLE_NAMES.includes(role.name)) {
    showToast(`O cargo "${role.name}" não pode ser excluído.`, 'error');
    confirmDeleteRole.value = null;
    return;
  }
  // Remove from full stored list (including hidden roles like Admin)
  const allRoles = getRolesMock();
  const updated = allRoles.filter(r => r.id !== role.id);
  await saveRolesMock(updated);
  roles.value = roles.value.filter(r => r.id !== role.id);
  showToast(`Cargo "${role.name}" excluído.`, 'success');
  confirmDeleteRole.value = null;
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
        <button @click="router.push('/app/dashboard')" class="p-3 bg-gray-50 border border-[#E0E0E0] rounded text-[#757575] hover:text-[#212121] transition-colors">
          <ArrowLeft :size="20" />
        </button>
        <div>
          <h1 class="text-3xl font-black text-[#212121]">Cargos e Permissões</h1>
          <p class="text-[#757575] text-sm">Gerenciando acessos do estabelecimento</p>
        </div>
      </div>
      <BaseButton @click="openModal()" :icon="Plus">
        Novo Cargo
      </BaseButton>
    </header>

    <div v-if="roles.length === 0" class="flex flex-col items-center justify-center py-20 text-[#757575]">
      <ShieldCheck :size="48" class="mb-4 opacity-20" />
      <p class="font-black uppercase tracking-widest text-sm opacity-40">Nenhum cargo cadastrado</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div
        v-for="role in roles"
        :key="role.id"
        class="bg-white border border-[#E0E0E0] rounded p-8 group transition-all hover:border-accent/40 cursor-pointer"
        @click="openModal(role)"
      >
        <div class="flex justify-between items-start mb-6">
          <ShieldCheck class="text-accent" :size="24" />
          <button
            v-if="!PROTECTED_ROLE_NAMES.includes(role.name)"
            @click.stop="confirmDeleteRole = role"
            class="p-1.5 text-[#757575] hover:text-red-500 hover:bg-danger-light rounded transition-all"
            title="Excluir cargo"
          >
            <Trash2 :size="16" />
          </button>
          <span
            v-else
            class="text-[9px] font-black uppercase tracking-widest text-[#757575] px-2 py-1 bg-gray-50 rounded border border-[#E0E0E0]"
            title="Cargo protegido"
          >Fixo</span>
        </div>
        <h3 class="text-xl font-bold text-[#212121]">{{ role.name }}</h3>
        <p class="text-[10px] font-black uppercase tracking-widest text-[#757575] mt-2">
          {{ role.permissions.length }} Permissões Ativas
        </p>
        <div class="flex flex-wrap gap-1 mt-4">
          <span
            v-for="permId in role.permissions.slice(0, 3)"
            :key="permId"
            class="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 bg-accent-light text-accent rounded border border-accent/30"
          >
            {{ AVAILABLE_PERMISSIONS.find(p => p.id === permId)?.label || permId }}
          </span>
          <span v-if="role.permissions.length > 3" class="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 bg-gray-50 text-[#757575] rounded">
            +{{ role.permissions.length - 3 }}
          </span>
        </div>
      </div>
    </div>

    <!-- Confirmação de exclusão -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="confirmDeleteRole" class="fixed inset-0 bg-black/50  z-[110] flex items-center justify-center p-4">
          <div class="bg-white border border-[#E0E0E0] w-full max-w-sm rounded p-8 shadow-2xl">
            <div class="flex items-start gap-4 mb-6">
              <div class="p-3 bg-danger-light rounded border border-danger shrink-0">
                <Trash2 :size="20" class="text-danger" />
              </div>
              <div>
                <p class="text-[#212121] font-black text-base">Excluir cargo?</p>
                <p class="text-[#757575] text-sm mt-1">O cargo <span class="text-[#212121] font-bold">"{{ confirmDeleteRole.name }}"</span> será removido permanentemente. Usuários com este cargo perderão as permissões.</p>
              </div>
            </div>
            <div class="flex gap-3">
              <button @click="confirmDeleteRole = null" class="flex-1 py-3 rounded text-[#757575] font-bold hover:bg-gray-50 transition-colors border border-[#E0E0E0]">Cancelar</button>
              <button @click="deleteRole" class="flex-1 py-3 rounded bg-danger text-white font-black hover:bg-red-400 transition-colors">Excluir</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <Teleport to="body">
      <Transition name="fade">
        <div v-if="isModalOpen" class="fixed inset-0 bg-black/50  z-[100] flex items-center justify-center p-4">
          <div class="bg-white border border-[#E0E0E0] w-full max-w-2xl rounded flex flex-col max-h-[90vh] shadow-2xl">
            
            <header class="p-8 border-b border-[#E0E0E0] flex justify-between items-center bg-gray-100">
              <h2 class="text-2xl font-black text-[#212121] flex items-center gap-3">
                <Lock :size="24" class="text-accent" />
                {{ isEditing ? 'Editar Cargo' : 'Novo Cargo' }}
              </h2>
              <button @click="isModalOpen = false" class="p-2 text-[#757575] hover:text-[#212121]">
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
                <label class="text-xs font-black uppercase tracking-widest text-[#757575] ml-2">Permissões de Acesso</label>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    v-for="perm in AVAILABLE_PERMISSIONS"
                    :key="perm.id"
                    @click="togglePermission(perm.id)"
                    :class="currentRole.permissions.includes(perm.id) ? 'border-accent bg-accent-light' : 'border-[#E0E0E0] bg-gray-50'"
                    class="p-4 rounded border cursor-pointer transition-all flex items-start gap-4"
                  >
                    <div class="mt-1">
                      <div
                        class="w-5 h-5 rounded border border-[#E0E0E0] flex items-center justify-center"
                        :class="currentRole.permissions.includes(perm.id) ? 'bg-accent border-accent' : ''"
                      >
                        <CheckCircle v-if="currentRole.permissions.includes(perm.id)" :size="14" class="text-black" />
                      </div>
                    </div>
                    <div>
                      <span class="block font-bold text-sm" :class="currentRole.permissions.includes(perm.id) ? 'text-accent' : 'text-[#212121]'">
                        {{ perm.label }}
                      </span>
                      <span class="text-[10px] text-[#757575] font-medium">{{ perm.desc }}</span>
                    </div>
                  </div>
                </div>
                <p v-if="errors.permissions" class="text-red-500 text-xs font-bold ml-2 flex items-center gap-1">
                  <AlertCircle :size="12" /> {{ errors.permissions }}
                </p>
              </div>
            </div>

            <footer class="p-8 border-t border-[#E0E0E0] bg-gray-100 flex justify-end gap-4">
              <button @click="isModalOpen = false" class="px-6 py-3 rounded text-[#757575] font-bold hover:bg-gray-50 hover:text-[#212121] transition-colors">
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