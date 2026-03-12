<script setup>
import { computed } from 'vue';

const props = defineProps({
  columns: { type: Array, required: true }, // [{ key, label, sortable? }]
  data: { type: Array, required: true },
  actions: { type: Array, default: () => [] }, // [{ icon, tooltip, handler, condition, class }]
  sortKey: { type: String, default: '' },
  sortOrder: { type: String, default: 'asc' }
});

const emit = defineEmits(['update:sortKey', 'update:sortOrder']);

const sortedData = computed(() => {
  if (!props.sortKey) return props.data;
  return [...props.data].sort((a, b) => {
    let aVal = a[props.sortKey];
    let bVal = b[props.sortKey];
    if (typeof aVal === 'string') aVal = aVal.toLowerCase();
    if (typeof bVal === 'string') bVal = bVal.toLowerCase();
    if (aVal < bVal) return props.sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return props.sortOrder === 'asc' ? 1 : -1;
    return 0;
  });
});

const handleSort = (key) => {
  if (!props.columns.find(c => c.key === key)?.sortable) return;
  let newOrder = 'asc';
  if (props.sortKey === key) {
    newOrder = props.sortOrder === 'asc' ? 'desc' : 'asc';
  }
  emit('update:sortKey', key);
  emit('update:sortOrder', newOrder);
};
</script>

<template>
  <div class="bg-white rounded-xl shadow-lg border border-gray-200 overflow-x-auto">
    <table class="w-full text-left border-collapse min-w-[740px]">
      <thead class="bg-gray-50 text-gray-600 uppercase text-xs sm:text-sm font-semibold">
        <tr>
          <th v-for="col in columns" :key="col.key" class="p-2 sm:p-4 border-b whitespace-nowrap">
            <div class="flex items-center gap-1" :class="{ 'cursor-pointer select-none': col.sortable }" @click="handleSort(col.key)">
              {{ col.label }}
              <span v-if="col.sortable && sortKey === col.key" class="text-gray-400">
                {{ sortOrder === 'asc' ? '↑' : '↓' }}
              </span>
            </div>
          </th>
          <th v-if="actions.length" class="p-2 sm:p-4 border-b text-right whitespace-nowrap">Ações</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, idx) in sortedData" :key="item.id" class="hover:bg-gray-50 border-b last:border-0 transition-colors">
          <td v-for="col in columns" :key="col.key" class="p-2 sm:p-4">
            <slot :name="`cell-${col.key}`" :item="item" :value="item[col.key]">
              {{ item[col.key] }}
            </slot>
          </td>
          <td v-if="actions.length" class="p-2 sm:p-4 text-right whitespace-nowrap">
            <div class="flex justify-end gap-1 sm:gap-2">
              <template v-for="act in actions" :key="act.label">
                <button
                  v-if="!act.condition || act.condition(item)"
                  @click="act.handler(item)"
                  class="p-1.5 sm:p-2 rounded-lg transition-colors"
                  :class="act.class || 'text-gray-600 hover:bg-gray-100'"
                  :title="act.tooltip"
                >
                  <component :is="act.icon" :size="16" class="sm:w-5 sm:h-5" />
                </button>
              </template>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>