<script setup>
  import { computed, useSlots, useAttrs } from "vue";
  import EmptyState from "./EmptyState.vue";
  import { Inbox } from "lucide-vue-next";

  defineOptions({ inheritAttrs: false });
  const attrs = useAttrs();

  const props = defineProps({
    columns: { type: Array, required: true },
    data: { type: Array, required: true },
    actions: { type: Array, default: () => [] },
    sortKey: { type: String, default: "" },
    sortOrder: { type: String, default: "asc" },
    emptyMessage: { type: String, default: "Nenhum item encontrado." },
    emptyIcon: { default: () => Inbox },
    isLoading: { type: Boolean, default: false },
    breakpoint: { type: String, default: "md" },
  });

  const bpClasses = {
    sm: { table: "hidden sm:block", cards: "sm:hidden" },
    md: { table: "hidden md:block", cards: "md:hidden" },
    lg: { table: "hidden lg:block", cards: "lg:hidden" },
  };
  const bp = computed(() => bpClasses[props.breakpoint] ?? bpClasses.md);

  const emit = defineEmits(["update:sortKey", "update:sortOrder"]);

  const slots = useSlots();
  const hasMobileSlot = computed(() => !!slots["mobile-item"]);

  const sortedData = computed(() => {
    if (!props.sortKey) return props.data;
    return [...props.data].sort((a, b) => {
      let aVal = a[props.sortKey];
      let bVal = b[props.sortKey];
      if (typeof aVal === "string") aVal = aVal.toLowerCase();
      if (typeof bVal === "string") bVal = bVal.toLowerCase();
      if (aVal < bVal) return props.sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return props.sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  });

  const handleSort = (key) => {
    if (!props.columns.find((c) => c.key === key)?.sortable) return;
    const newOrder =
      props.sortKey === key && props.sortOrder === "asc" ? "desc" : "asc";
    emit("update:sortKey", key);
    emit("update:sortOrder", newOrder);
  };
</script>

<template>
  <div v-bind="attrs">
    <div
      v-if="isLoading || sortedData.length > 0"
      class="bg-white border border-[#E0E0E0] rounded overflow-x-auto shadow-2xl font-inter"
      :class="hasMobileSlot ? bp.table : ''"
    >
      <table class="w-full text-left border-collapse min-w-[740px]">
        <thead
          class="bg-gray-50 text-[#757575] uppercase text-[10px] font-black tracking-widest border-b border-[#E0E0E0]"
        >
          <tr>
            <th
              v-for="col in columns"
              :key="col.key"
              class="p-4 sm:p-6 whitespace-nowrap"
            >
              <div
                class="flex items-center gap-2"
                :class="{
                  'cursor-pointer select-none hover:text-[#212121] transition-colors':
                    col.sortable,
                }"
                @click="handleSort(col.key)"
              >
                {{ col.label }}
                <span
                  v-if="col.sortable && sortKey === col.key"
                  class="text-accent"
                >
                  {{ sortOrder === "asc" ? "↑" : "↓" }}
                </span>
              </div>
            </th>
            <th
              v-if="actions.length || $slots['row-actions']"
              class="p-4 sm:p-6 text-right whitespace-nowrap"
            >
              Ações
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="isLoading">
            <td
              :colspan="columns.length + (actions.length || $slots['row-actions'] ? 1 : 0)"
              class="p-12 text-center text-[#757575] font-bold animate-pulse text-sm"
            >
              Carregando...
            </td>
          </tr>
          <tr
            v-else
            v-for="item in sortedData"
            :key="item.id"
            class="hover:bg-gray-50 border-b border-[#E0E0E0] last:border-0 transition-colors"
          >
            <td
              v-for="col in columns"
              :key="col.key"
              class="p-4 sm:p-6 text-sm text-[#212121] font-medium"
            >
              <slot :name="`cell-${col.key}`" :item="item" :value="item[col.key]">
                {{ item[col.key] }}
              </slot>
            </td>
            <td
              v-if="actions.length || $slots['row-actions']"
              class="p-4 sm:p-6 text-right whitespace-nowrap"
            >
              <div class="flex justify-end gap-2">
                <slot name="row-actions" :item="item">
                  <template v-for="act in actions" :key="act.tooltip">
                    <button
                      v-if="!act.condition || act.condition(item)"
                      @click="act.handler(item)"
                      class="p-2 rounded transition-all"
                      :class="
                        act.class ||
                        'text-[#757575] hover:text-[#212121] hover:bg-gray-50'
                      "
                      :title="act.tooltip"
                    >
                      <component :is="act.icon" :size="18" />
                    </button>
                  </template>
                </slot>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div
      v-else
      class="bg-white border border-[#E0E0E0] rounded shadow-2xl font-inter"
    >
      <EmptyState :icon="emptyIcon" :message="emptyMessage" />
    </div>
  </div>

  <div v-if="hasMobileSlot" :class="[bp.cards, 'space-y-4']">
    <div
      v-for="item in sortedData"
      :key="item.id"
      class="bg-white border border-[#E0E0E0] rounded shadow-xl overflow-hidden"
    >
      <slot name="mobile-item" :item="item" />
    </div>
  </div>
</template>
