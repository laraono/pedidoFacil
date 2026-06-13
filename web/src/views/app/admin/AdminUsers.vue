<script setup>
import { ref, computed, onMounted } from 'vue';
import { useToast } from '@/composables/useToast';
import { useAsyncAction } from '@/composables/useAsyncAction';
import { useConfirm } from '@/composables/useConfirm';
import { ShieldAlert, Plus, Trash2, Pencil, Eye, EyeOff, KeyRound, Mail } from 'lucide-vue-next';
import { adminUserApi, adminMetricsApi } from '@/services/adminApi';
import { validatePasswordStrength } from '@/utils/password';
import { PageHeader, BaseButton, BaseInput, FormModal, ConfirmModal, DataTable, EmptyState } from '@/components/ui';

const { showToast } = useToast();
const { loading, run: runLoad } = useAsyncAction();
const { loading: saving, run } = useAsyncAction();
const { confirmState, showConfirm, closeConfirm } = useConfirm();

const users = ref([]);
const masterId = ref(null);
const isModalOpen = ref(false);
const isEditing = ref(false);
const showPassword = ref(false);

const form = ref({ id: null, name: '', email: '', password: '' });
const errors = ref({});

const columns = [
  { key: 'name', label: 'Nome' },
  { key: 'email', label: 'E-mail' },
];

const tableActions = computed(() => [
  { icon: Pencil, tooltip: 'Editar', handler: (u) => openEdit(u), class: 'text-[#757575] hover:text-[#212121] hover:bg-gray-100' },
  { icon: Trash2, tooltip: 'Remover', handler: (u) => askDelete(u), class: 'text-[#757575] hover:text-red-500 hover:bg-red-50', condition: (u) => !!masterId.value && u.id !== masterId.value },
]);

async function load() {
  const [data, masterData] = await Promise.all([
    runLoad(() => adminUserApi.list(), 'Erro ao carregar usuários admin.'),
    adminMetricsApi.getMasterId().catch(() => null),
  ]);
  if (data) users.value = data;
  if (masterData) masterId.value = masterData.masterId;
}

onMounted(load);

function openCreate() {
  form.value = { id: null, name: '', email: '', password: '' };
  errors.value = {};
  isEditing.value = false;
  showPassword.value = false;
  isModalOpen.value = true;
}

function openEdit(user) {
  form.value = { id: user.id, name: user.name, email: user.email, password: '' };
  errors.value = {};
  isEditing.value = true;
  showPassword.value = false;
  isModalOpen.value = true;
}

function validate() {
  const e = {};
  if (!form.value.name.trim()) e.name = 'Nome é obrigatório.';
  if (!form.value.email.trim() || !form.value.email.includes('@')) e.email = 'E-mail inválido.';
  if (!isEditing.value && !form.value.password.trim()) e.password = 'Senha é obrigatória.';
  else if (form.value.password) { const err = validatePasswordStrength(form.value.password); if (err) e.password = err; }
  errors.value = e;
  return Object.keys(e).length === 0;
}

async function save() {
  if (!validate()) return;
  const payload = { name: form.value.name.trim(), email: form.value.email.trim() };
  if (form.value.password) payload.password = form.value.password;
  await run(async () => {
    if (isEditing.value) {
      await adminUserApi.update(form.value.id, payload);
      showToast('Admin atualizado!', 'success');
    } else {
      payload.password = form.value.password;
      await adminUserApi.create(payload);
      showToast('Admin criado!', 'success');
    }
    isModalOpen.value = false;
    await load();
  }, 'Erro ao salvar admin.');
}

function askDelete(user) {
  showConfirm({
    title: 'Remover Admin?',
    message: `O usuário "${user.name}" será removido permanentemente.`,
    onConfirm: async () => {
      await run(async () => {
        await adminUserApi.delete(user.id);
        showToast(`"${user.name}" removido.`, 'success');
        await load();
      }, 'Erro ao remover admin.');
    }
  });
}
</script>

<template>
  <main class="max-w-5xl mx-auto py-12 px-6 font-inter">
    <PageHeader
      title="Usuários Admin"
      subtitle="Gerenciar contas com acesso ao painel administrativo"
      :category-icon="ShieldAlert"
      category-label="Painel Admin"
    >
      <template #actions>
        <BaseButton variant="primary" :icon="Plus" @click="openCreate">
          Novo Admin
        </BaseButton>
      </template>
    </PageHeader>

    <div v-if="loading" class="py-20 text-center text-[#757575]">Carregando...</div>

    <template v-else>
      <DataTable v-if="users.length" :columns="columns" :data="users" :actions="tableActions">
        <template #cell-name="{ item }">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded bg-accent-light border border-accent/30 flex items-center justify-center">
              <ShieldAlert :size="15" class="text-accent" />
            </div>
            <span class="font-bold text-[#212121] text-sm">{{ item.name }}</span>
          </div>
        </template>
      </DataTable>

      <EmptyState
        v-else
        :icon="ShieldAlert"
        message="Nenhum usuário admin cadastrado"
        action-label="Criar Primeiro Admin"
        @action="openCreate"
      />
    </template>
  </main>

  <FormModal
    :show="isModalOpen"
    :title="isEditing ? 'Editar Admin' : 'Novo Admin'"
    size="sm"
    :is-loading="saving"
    :save-label="isEditing ? 'Salvar' : 'Criar Admin'"
    @close="isModalOpen = false"
    @save="save"
  >
    <div class="space-y-5">
      <BaseInput
        v-model="form.name"
        label="Nome"
        placeholder="Ex: Admin Suporte"
        :error="errors.name"
        @input="delete errors.name"
      />
      <BaseInput
        v-model="form.email"
        type="email"
        label="E-mail"
        placeholder="admin@empresa.com"
        :icon="Mail"
        :error="errors.email"
        @input="delete errors.email"
      />
      <BaseInput
        v-model="form.password"
        :type="showPassword ? 'text' : 'password'"
        :label="isEditing ? 'Nova Senha (deixe em branco para manter)' : 'Senha'"
        placeholder="Mínimo 8 caracteres"
        :icon="KeyRound"
        :error="errors.password"
        @input="delete errors.password"
      >
        <template #suffix>
          <button type="button" @click="showPassword = !showPassword"
            class="absolute right-4 top-1/2 -translate-y-1/2 text-[#757575] hover:text-[#212121] transition-colors">
            <Eye v-if="!showPassword" :size="15" /><EyeOff v-else :size="15" />
          </button>
        </template>
      </BaseInput>
    </div>
  </FormModal>

  <ConfirmModal :confirm-modal="confirmState" @close="closeConfirm" />
</template>
