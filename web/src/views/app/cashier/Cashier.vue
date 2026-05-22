<template>
  <SubscriptionGuard featureName="O Caixa">
    <div class="h-screen bg-page flex flex-col font-inter overflow-hidden">
      <header
        class="h-16 md:h-20 bg-white border-b border-[#E0E0E0] flex items-center justify-between px-6 md:px-8 shadow-sm z-20 shrink-0"
      >
        <div class="flex items-center gap-4">
          <div class="bg-accent p-2 rounded text-white shadow-sm">
            <Monitor :size="20" class="md:w-6 md:h-6" />
          </div>
          <div>
            <h1
              class="text-[#212121] font-black text-lg tracking-tight leading-none uppercase"
            >
              Caixa de Operações
            </h1>
            <p
              class="text-[#757575] text-[10px] uppercase font-black tracking-widest mt-1"
            >
              Terminal de Liquidação
            </p>
          </div>
        </div>
      </header>

      <main class="flex-grow flex flex-col p-4 md:p-8 overflow-hidden bg-page">
        <section
          class="flex-1 flex flex-col min-w-0 bg-white rounded border border-[#E0E0E0] overflow-hidden"
        >
          <header
            class="p-6 md:px-8 flex justify-between items-center bg-gray-50 z-10 border-b border-[#E0E0E0]"
          >
            <div class="flex items-center gap-3">
              <div class="w-2 h-6 bg-blue-500 rounded"></div>
              <h2
                class="font-black text-[#212121] text-base md:text-lg uppercase tracking-widest"
              >
                {{ comandaUnitLabel }}s Ativas
              </h2>
            </div>
            <span
              class="bg-blue-500 text-white font-black px-4 py-1 rounded text-xs shadow-lg border border-blue-400/30"
            >
              {{ comandaStore.comandas.length }}
            </span>
          </header>

          <div class="flex-grow p-6 md:p-8 overflow-y-auto custom-scrollbar">
            <div
              v-if="comandaStore.comandas.length === 0"
              class="flex flex-col items-center justify-center h-full text-[#757575] opacity-40 min-h-[200px]"
            >
              <FileText :size="48" class="mb-4" />
              <p class="font-black uppercase tracking-widest text-sm">
                Nenhuma {{ comandaUnitLabel.toLowerCase() }} ativa
              </p>
            </div>
            <div
              v-else
              class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              <div
                v-for="comanda in comandaStore.comandas"
                :key="comanda.id"
                class="bg-gray-50 rounded border border-[#E0E0E0] p-6 cursor-pointer hover:border-blue-500/50 hover:bg-gray-50 transition-all group"
                @click="openDetails(comanda)"
              >
                <div class="flex justify-between items-start mb-4">
                  <div>
                    <span
                      class="text-[10px] font-black uppercase tracking-widest block mb-1"
                      :class="comanda.isAutoatendimento ? 'text-blue-500' : 'text-[#757575]'"
                      >{{ getComandaTypeLabel(comanda) }}</span
                    >
                    <span
                      class="font-black text-[#212121] text-xl tracking-tighter group-hover:text-blue-400 transition-colors"
                      >{{ getComandaMainLabel(comanda) }}</span
                    >
                  </div>
                  <span class="text-accent font-black text-lg tracking-tighter"
                    >R$ {{ comanda.total.toFixed(2) }}</span
                  >
                </div>
                <div
                  class="flex items-center gap-2 text-[10px] font-bold text-[#757575] uppercase tracking-wider bg-page/40 p-3 rounded border border-[#E0E0E0]"
                >
                  <Receipt :size="14" class="text-blue-500" />
                  {{ comanda.orders.length }} pedidos vinculados
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Teleport to="body">
        <div
          v-if="showDetails"
          class="fixed inset-0 bg-page/50 backdrop-blur-xl flex items-center justify-center p-4 z-50"
        >
          <div
            class="bg-white border border-[#E0E0E0] rounded w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
          >
            <div
              class="p-8 border-b border-[#E0E0E0] flex justify-between items-center bg-gray-50 shrink-0"
            >
              <div class="flex items-center gap-4">
                <div
                  class="bg-blue-500/10 p-3 rounded text-blue-500 border border-blue-500/20"
                >
                  <Receipt :size="24" />
                </div>
                <div>
                  <h2
                    class="text-2xl font-black text-[#212121] uppercase tracking-tighter"
                  >
                    {{ getComandaMainLabel(selectedComanda) }}
                  </h2>
                  <p
                    class="font-black uppercase tracking-widest text-[10px]"
                    :class="selectedComanda.isAutoatendimento ? 'text-blue-500' : 'text-[#757575]'"
                  >
                    {{ selectedComanda.isAutoatendimento ? 'Autoatendimento' : 'Processamento Financeiro' }}
                  </p>
                </div>
              </div>
              <button
                @click="closeDetails"
                class="p-2 text-[#757575] hover:text-[#212121] hover:bg-gray-100 rounded transition-all"
              >
                <X :size="24" />
              </button>
            </div>

            <div class="p-8 overflow-y-auto custom-scrollbar bg-white">
              <h3
                class="font-black text-[#757575] mb-6 uppercase tracking-[0.2em] text-[10px]"
              >
                Detalhamento de Consumo
              </h3>

              <div
                v-if="hasPending"
                class="mb-4 flex items-start gap-3 p-4 rounded bg-yellow-500/10 border border-yellow-500/30"
              >
                <AlertTriangle
                  :size="18"
                  class="text-yellow-400 shrink-0 mt-0.5"
                />
                <div>
                  <p
                    class="text-amber-700 font-black text-xs uppercase tracking-widest"
                  >
                    Pedidos aguardando preparo
                  </p>
                  <p class="text-yellow-400/80 text-xs mt-1">
                    Um ou mais itens ainda não foram enviados para a cozinha. Será
                    necessário cancelá-los para finalizar.
                  </p>
                </div>
              </div>

              <div class="space-y-4">
                <div
                  v-for="order in ordersWithStatus"
                  :key="order.id"
                  class="rounded p-6"
                  :class="
                    order.status === 'pending'
                      ? 'border border-yellow-500/30 bg-yellow-500/5'
                      : 'border border-[#E0E0E0] bg-gray-50'
                  "
                >
                  <div class="flex justify-between items-center mb-4">
                    <span
                      class="font-black text-[#212121] text-sm uppercase tracking-widest"
                      >Pedido #{{ order.id }}</span
                    >
                    <div class="flex items-center gap-2">
                      <span
                        class="px-4 py-1 rounded text-[10px] font-black uppercase tracking-widest border"
                        :class="{
                          'border-yellow-500/30 bg-yellow-500/10 text-yellow-500':
                            order.status === 'pending',
                          'border-blue-500/30 bg-blue-500/10 text-blue-500':
                            order.status === 'preparing',
                          'border-accent/40 bg-accent-light text-accent':
                            order.status === 'ready',
                        }"
                      >
                        {{
                          order.status === "pending"
                            ? "Aguardando"
                            : order.status === "preparing"
                              ? "Preparando"
                              : "Pronto"
                        }}
                      </span>
                      <button
                        v-if="order.status !== 'ready' && order.status !== 'finished'"
                        @click.stop.prevent="openManualCancel(order.id)"
                        class="text-danger hover:bg-danger-light p-1.5 rounded transition-all"
                        title="Cancelar Pedido"
                      >
                        <XCircle :size="16" />
                      </button>
                    </div>
                  </div>

                  <div class="space-y-2 mb-4">
                    <div
                      v-for="(item, idx) in getOrderItems(order)"
                      :key="idx"
                      class="flex justify-between text-xs font-bold text-[#757575]"
                    >
                      <span>{{ item.amount }}x {{ item.name }}</span>
                      <span class="text-[#757575]"
                        >R$ {{ item.price.toFixed(2) }}</span
                      >
                    </div>
                  </div>

                  <div
                    class="text-right font-black text-[#212121] text-sm mt-3 pt-3 border-t border-[#E0E0E0] border-dashed"
                  >
                    Total Pedido:
                    <span class="text-blue-400 ml-2"
                      >R$ {{ getOrderTotal(order).toFixed(2) }}</span
                    >
                  </div>
                </div>
              </div>

              <div
                class="mt-10 border border-[#E0E0E0] rounded p-8 bg-page/40 shadow-inner"
              >
                <div
                  class="flex justify-between text-sm font-black text-[#757575] uppercase tracking-widest"
                >
                  <span>Subtotal da Conta:</span>
                  <span class="text-[#212121]">R$ {{ subtotal.toFixed(2) }}</span>
                </div>
                <div class="mt-6 p-6 bg-gray-50 rounded border border-[#E0E0E0]">
                  <label
                    class="block text-[10px] font-black text-[#757575] uppercase tracking-widest mb-3"
                    >Aplicar Ajuste/Desconto</label
                  >
                  <div class="flex gap-4">
                    <select
                      v-model="discountType"
                      class="bg-gray-50 border border-[#E0E0E0] rounded px-4 py-3 text-xs font-black uppercase text-[#212121] outline-none focus:ring-2 focus:ring-blue-500 flex-1"
                    >
                      <option value="percent">Percentual (%)</option>
                      <option value="fixed">Valor fixo (R$)</option>
                    </select>
                    <div class="relative">
                      <input
                        :value="discountRaw"
                        @input="onDiscountInput"
                        inputmode="numeric"
                        :placeholder="discountType === 'percent' ? '0' : '0,00'"
                        class="bg-gray-50 border border-[#E0E0E0] rounded px-4 py-3 text-lg font-black text-center text-accent w-32 outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span
                        class="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-black text-[#757575] pointer-events-none"
                      >
                        {{ discountType === "percent" ? "%" : "R$" }}
                      </span>
                    </div>
                  </div>
                </div>
                <div class="mt-6 p-6 bg-gray-50 rounded border border-[#E0E0E0]">
                  <label
                    class="block text-[10px] font-black text-[#757575] uppercase tracking-widest mb-3 flex items-center gap-2"
                  >
                    <Tag :size="12" /> Cupom de Desconto
                  </label>
                  <div
                    v-if="appliedCoupon"
                    class="flex items-center justify-between p-3 bg-accent-light border border-accent/30 rounded"
                  >
                    <div class="flex items-center gap-2">
                      <Tag :size="14" class="text-accent" />
                      <span
                        class="font-black text-accent text-sm font-mono tracking-widest"
                        >{{ appliedCoupon.code }}</span
                      >
                      <span class="text-[#757575] text-xs"
                        >—
                        {{
                          appliedCoupon.type === "percent"
                            ? appliedCoupon.value + "%"
                            : "R$ " + Number(appliedCoupon.value).toFixed(2)
                        }}
                        off</span
                      >
                    </div>
                    <button
                      @click="removeCoupon"
                      class="p-1 text-[#757575] hover:text-danger transition-colors"
                    >
                      <XCircle :size="16" />
                    </button>
                  </div>
                  <div v-else class="flex gap-3">
                    <input
                      v-model="couponCodeInput"
                      @keydown.enter="applyCoupon"
                      placeholder="Digite o código..."
                      class="flex-1 bg-gray-50 border border-[#E0E0E0] rounded px-4 py-2.5 text-sm font-black text-[#212121] placeholder:text-[#757575] outline-none focus:border-primary/40 uppercase"
                    />
                    <button
                      @click="applyCoupon"
                      class="px-4 py-2.5 bg-gray-50 border border-[#E0E0E0] text-[#757575] text-xs font-black uppercase tracking-widest rounded hover:bg-gray-100 transition-all"
                    >
                      Aplicar
                    </button>
                  </div>
                  <p
                    v-if="couponError"
                    class="text-danger text-[11px] font-bold mt-2 ml-1"
                  >
                    {{ couponError }}
                  </p>
                </div>

                <div class="flex justify-between items-end mt-8">
                  <div>
                    <span
                      class="text-[10px] font-black text-[#757575] uppercase tracking-[0.3em]"
                      >Total Final</span
                    >
                    <div
                      v-if="appliedCoupon"
                      class="text-[10px] text-accent font-bold mt-0.5"
                    >
                      Cupom: − R$ {{ couponDiscount.toFixed(2) }}
                    </div>
                  </div>
                  <span
                    class="text-4xl font-black text-accent tracking-tighter drop-"
                  >
                    R$ {{ totalWithDiscount.toFixed(2) }}
                  </span>
                </div>
              </div>

              <div class="mt-10" v-if="totalWithDiscount > 0">
                <h3
                  class="font-black text-[#757575] mb-6 uppercase tracking-[0.2em] text-[10px]"
                >
                  Método de Liquidação
                </h3>
                <div class="bg-gray-50 border border-[#E0E0E0] p-8 rounded">
                  <div class="mb-6 flex items-center gap-6 flex-wrap">
                    <label class="flex items-center cursor-pointer">
                      <div class="relative">
                        <input
                          type="checkbox"
                          v-model="splitPayment"
                          class="sr-only"
                        />
                        <div
                          class="w-12 h-6 bg-gray-200 rounded transition-colors"
                          :class="{ 'bg-blue-600': splitPayment }"
                        ></div>
                        <div
                          class="absolute left-1 top-1 w-4 h-4 bg-white rounded transition-transform"
                          :class="{ 'translate-x-6': splitPayment }"
                        ></div>
                      </div>
                      <span
                        class="ml-3 font-black text-xs uppercase text-[#757575] tracking-widest"
                        >Dividir Pagamento</span
                      >
                    </label>
                    <div
                      v-if="splitPayment"
                      class="flex items-center gap-4 bg-page/40 px-4 py-2 rounded border border-[#E0E0E0]"
                    >
                      <span
                        class="text-[10px] font-black text-[#757575] uppercase"
                        >Pessoas:</span
                      >
                      <input
                        type="number"
                        v-model.number="numberOfPeople"
                        min="2"
                        max="20"
                        class="bg-transparent text-[#212121] font-black w-12 text-center outline-none"
                      />
                      <button
                        @click="distributeEqually"
                        class="px-4 py-1.5 bg-blue-500 text-white text-[10px] font-black uppercase rounded hover:bg-blue-500 transition-colors"
                      >
                        Calcular
                      </button>
                    </div>
                  </div>

                  <div v-if="!splitPayment" class="flex gap-3 flex-wrap">
                    <button
                      v-for="method in enabledPaymentMethods"
                      :key="method"
                      @click="paymentSplits[0].type = method"
                      class="px-4 py-2 rounded text-xs font-black uppercase tracking-widest transition-all border"
                      :class="
                        paymentSplits[0]?.type === method
                          ? 'bg-primary text-white border-primary'
                          : 'bg-gray-50 text-[#757575] border-[#E0E0E0] hover:border-[#E0E0E0] hover:text-[#212121]'
                      "
                    >
                      {{ method }}
                    </button>
                  </div>

                  <div v-else class="space-y-4">
                    <div
                      v-for="(split, idx) in paymentSplits"
                      :key="idx"
                      class="flex flex-col gap-2"
                    >
                      <div
                        class="flex gap-3 items-center p-4 rounded border transition-all"
                        :class="
                          !split.amount || split.amount <= 0
                            ? 'bg-red-500/5 border-danger'
                            : 'bg-page/20 border-[#E0E0E0]'
                        "
                      >
                        <select
                          v-model="split.type"
                          class="bg-gray-50 border border-[#E0E0E0] rounded px-3 py-2 text-xs font-black text-[#212121] outline-none flex-1"
                        >
                          <option v-for="m in enabledPaymentMethods" :key="m">
                            {{ m }}
                          </option>
                        </select>
                        <input
                          type="text"
                          :value="utils.formatCurrency(split.amount)"
                          @input="applyMask($event, split)"
                          class="bg-gray-50 border border-[#E0E0E0] rounded px-3 py-2 text-sm font-black text-accent text-right w-32 outline-none"
                        />
                        <button
                          v-if="paymentSplits.length > 1"
                          @click="removePaymentSplit(idx)"
                          class="p-2 text-red-500 hover:bg-danger-light rounded transition-all"
                        >
                          <X :size="16" />
                        </button>
                      </div>
                      <p
                        v-if="split.amount <= 0"
                        class="text-danger text-[10px] font-bold ml-4 flex items-center gap-1 uppercase tracking-widest"
                      >
                        <AlertCircle :size="10" /> Valor obrigatório
                      </p>
                    </div>

                    <button
                      @click="addPaymentSplit"
                      class="w-full py-3 border border-dashed border-[#E0E0E0] rounded text-[#757575] text-xs font-black uppercase tracking-widest hover:border-[#E0E0E0] hover:text-[#757575] transition-all"
                    >
                      + Adicionar método
                    </button>

                    <div
                      class="flex justify-between text-xs font-black pt-2 border-t border-[#E0E0E0]"
                      :class="
                        Math.abs(totalPayments - totalWithDiscount) > 0.01
                          ? 'text-danger'
                          : 'text-accent'
                      "
                    >
                      <span class="uppercase tracking-widest">Distribuído:</span>
                      <span
                        >R$ {{ totalPayments.toFixed(2) }} / R$
                        {{ totalWithDiscount.toFixed(2) }}</span
                      >
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              class="p-8 border-t border-[#E0E0E0] bg-page/20 flex flex-col gap-6 shrink-0"
            >
              <div
                v-if="isFinalizeDisabled && splitPayment && totalWithDiscount > 0"
                class="flex items-center gap-4 p-4 rounded border animate-pulse bg-danger-light border-danger"
              >
                <div class="p-2 bg-red-500/20 rounded text-red-500">
                  <AlertTriangle :size="20" />
                </div>
                <div class="flex-grow">
                  <p
                    class="text-xs font-black uppercase tracking-widest text-[#212121]"
                  >
                    Pagamento Bloqueado
                  </p>
                  <p class="text-[11px] font-bold text-[#757575]">
                    <span
                      v-if="paymentSplits.some((s) => !s.amount || s.amount <= 0)"
                      >Existem pessoas com valor R$ 0,00 na divisão.</span
                    >
                    <span v-else-if="totalPayments < totalWithDiscount">
                      Faltam
                      <span class="text-danger font-black"
                        >R$
                        {{ (totalWithDiscount - totalPayments).toFixed(2) }}</span
                      >
                      para atingir o total.
                    </span>
                    <span v-else-if="totalPayments > totalWithDiscount">
                      O valor excede em
                      <span class="text-danger font-black"
                        >R$
                        {{ (totalPayments - totalWithDiscount).toFixed(2) }}</span
                      >
                      o total da conta.
                    </span>
                  </p>
                </div>
              </div>

              <div class="flex flex-col sm:flex-row justify-between gap-4 w-full">
                <div class="flex gap-3">
                  <button
                    @click="closeDetails"
                    class="px-6 py-3 bg-white border border-[#E0E0E0] text-[#757575] font-black uppercase tracking-widest text-xs rounded hover:bg-gray-50 transition-all"
                  >
                    Voltar
                  </button>
                  <button
                    @click="showCancelComandaModal = true"
                    class="px-6 py-3 bg-danger/5 border border-danger/20 text-danger font-black uppercase tracking-widest text-xs rounded hover:bg-danger hover:text-white transition-all flex items-center gap-2"
                  >
                    <XCircle :size="16" />
                    Cancelar Comanda
                  </button>
                </div>
                <div class="flex gap-3">
                  <button
                    @click="emitReceiptForSelected"
                    class="px-6 py-3 bg-gray-50 border border-[#E0E0E0] text-[#757575] font-black uppercase tracking-widest text-xs rounded hover:bg-gray-100 transition-all flex items-center gap-2"
                  >
                    <Printer :size="16" />
                    Cupom Fiscal
                  </button>
                  <button
                    @click="handleFinalize"
                    :disabled="isFinalizeDisabled"
                    class="flex-grow sm:flex-none px-8 py-3 bg-primary text-white font-black uppercase tracking-widest text-xs rounded hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-20 disabled:grayscale disabled:cursor-not-allowed"
                  >
                    <CheckCircle :size="18" />
                    {{
                      isFinalizeDisabled
                        ? "Pagamento Inválido"
                        : totalWithDiscount === 0 
                          ? "Baixar Comanda (R$ 0,00)"
                          : "Confirmar Pagamento"
                    }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Teleport>

      <Teleport to="body">
        <div
          v-if="showCancelComandaModal"
          class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          style="z-index: 99999;"
        >
          <div class="bg-white border border-danger rounded p-8 w-full max-w-md shadow-2xl">
            <div class="flex items-start gap-4 mb-6">
              <div class="p-3 bg-danger-light rounded-full border border-danger shrink-0">
                <AlertTriangle :size="24" class="text-danger" />
              </div>
              <div>
                <p class="text-[#212121] font-black text-base mb-1">Cancelar Comanda Completa</p>
                <p class="text-[#757575] text-sm leading-relaxed">
                  Esta ação <b>removerá</b> a comanda do caixa e <b>cancelará</b> todos os pedidos na cozinha.
                </p>
              </div>
            </div>

            <label class="block text-[10px] font-black text-[#757575] uppercase tracking-widest mb-2">
              Motivo do Cancelamento <span class="text-danger">*</span>
            </label>
            <select v-model="cancelComandaReason" class="w-full bg-gray-50 border border-[#E0E0E0] rounded px-4 py-3 text-sm text-[#212121] outline-none focus:border-danger mb-6 cursor-pointer">
              <option value="" disabled>Selecione o motivo...</option>
              <option value="Cliente desistiu de tudo">Cliente desistiu de tudo</option>
              <option value="Erro no lançamento da comanda">Erro no lançamento da comanda</option>
              <option value="Comanda duplicada">Comanda duplicada</option>
              <option value="Outros">Outros</option>
            </select>

            <div class="flex gap-3">
              <button @click="showCancelComandaModal = false" class="flex-1 px-6 py-3 bg-white border border-[#E0E0E0] text-[#757575] font-black uppercase tracking-widest text-xs rounded hover:bg-gray-50 transition-all">
                Voltar
              </button>
              <button @click="confirmCancelComanda" :disabled="!cancelComandaReason.trim()" class="flex-1 px-6 py-3 bg-danger text-white font-black uppercase tracking-widest text-xs rounded hover:bg-red-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                Confirmar
              </button>
            </div>
          </div>
        </div>
      </Teleport>

      <Teleport to="body">
        <div
          v-if="manualCancelTargetId !== null"
          class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          style="z-index: 99999;"
        >
          <div class="bg-white border border-danger rounded p-8 w-full max-w-md shadow-2xl">
            <div class="flex items-start gap-4 mb-6">
              <div class="p-3 bg-danger-light rounded-full border border-danger shrink-0">
                <XCircle :size="24" class="text-danger" />
              </div>
              <div>
                <p class="text-[#212121] font-black text-base mb-1">Cancelar Pedido #{{ manualCancelTargetId }}</p>
                <p class="text-[#757575] text-sm leading-relaxed">Informe o motivo do cancelamento. Esse pedido será removido da fila e da comanda.</p>
              </div>
            </div>

            <select v-model="cancelReason" class="w-full bg-gray-50 border border-[#E0E0E0] rounded px-4 py-3 text-sm text-[#212121] outline-none focus:border-danger mb-6 cursor-pointer">
              <option value="" disabled>Selecione o motivo...</option>
              <option value="Demora no preparo">Demora no preparo</option>
              <option value="Pedido errado / Erro do Garçom">Pedido errado / Erro do Garçom</option>
              <option value="Desistência / Cliente foi embora">Desistência / Cliente foi embora</option>
            </select>

            <div class="flex gap-3">
              <button @click="dismissManualCancel" class="flex-1 px-6 py-3 bg-white border border-[#E0E0E0] text-[#757575] font-black uppercase tracking-widest text-xs rounded hover:bg-gray-100 transition-all">Voltar</button>
              <button @click="confirmManualCancel" :disabled="!cancelReason.trim()" class="flex-1 px-6 py-3 bg-danger text-white font-black uppercase tracking-widest text-xs rounded hover:bg-red-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed">Confirmar Cancelamento</button>
            </div>
          </div>
        </div>
      </Teleport>

      <Teleport to="body">
        <div
          v-if="showRulesModal"
          class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          style="z-index: 99999;"
        >
          <div
            class="bg-white border border-[#E0E0E0] rounded p-8 w-full max-w-md shadow-2xl"
          >
            <div class="flex items-start gap-4 mb-6">
              <div
                class="p-3 rounded-full border shrink-0"
                :class="
                  pendingCancel
                    ? 'bg-danger-light border-danger'
                    : 'bg-yellow-500/10 border-yellow-500/20'
                "
              >
                <AlertTriangle
                  :size="24"
                  :class="pendingCancel ? 'text-danger' : 'text-yellow-500'"
                />
              </div>
              <div>
                <p class="text-[#212121] font-bold text-sm leading-relaxed">
                  {{ rulesModalMessage }}
                </p>
              </div>
            </div>

            <div v-if="pendingCancel" class="mb-6">
              <label
                class="block text-[10px] font-black text-[#757575] uppercase tracking-widest mb-2"
              >
                Motivo do Cancelamento <span class="text-danger">*</span>
              </label>
              <select
                v-model="cancelReason"
                class="w-full bg-gray-50 border border-[#E0E0E0] rounded px-4 py-3 text-sm text-[#212121] outline-none focus:border-danger transition-all cursor-pointer"
              >
                <option value="" disabled>Selecione o motivo...</option>
                <option value="Demora no preparo">Demora no preparo</option>
                <option value="Pedido errado / Erro do Garçom">
                  Pedido errado / Erro do Garçom
                </option>
                <option value="Desistência / Cliente foi embora">
                  Desistência / Cliente foi embora
                </option>
              </select>
            </div>

            <div class="flex gap-3">
              <button
                @click="confirmRules(false)"
                class="flex-1 px-6 py-3 bg-white border border-[#E0E0E0] text-[#757575] font-black uppercase tracking-widest text-xs rounded hover:bg-gray-100 transition-all"
              >
                Voltar
              </button>
              <button
                @click="confirmRules(true)"
                :disabled="pendingCancel && !cancelReason.trim()"
                class="flex-1 px-6 py-3 font-black uppercase tracking-widest text-xs rounded transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                :class="
                  pendingCancel
                    ? 'bg-danger text-white hover:bg-red-400'
                    : 'bg-primary text-white hover:bg-primary-dark'
                "
              >
                {{ pendingCancel ? "Cancelar Pedidos" : "Confirmar" }}
              </button>
            </div>
          </div>
        </div>
      </Teleport>

      <Teleport to="body">
        <div
          v-if="paymentFlowActive"
          class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          style="z-index: 99999;"
        >
          <div
            class="bg-white border border-[#E0E0E0] rounded w-full max-w-lg shadow-2xl overflow-hidden"
          >
            <div class="p-8 border-b border-[#E0E0E0] bg-gray-50">
              <div class="flex items-center justify-between mb-2">
                <span
                  class="text-[10px] font-black text-[#757575] uppercase tracking-widest"
                >
                  Pagamento {{ currentPaymentIndex + 1 }} de
                  {{ pendingPayments.length }}
                </span>
                <div class="flex gap-1">
                  <div
                    v-for="i in pendingPayments.length"
                    :key="i"
                    class="w-8 h-1.5 rounded transition-all"
                    :class="
                      i - 1 <= currentPaymentIndex ? 'bg-accent' : 'bg-gray-100'
                    "
                  ></div>
                </div>
              </div>
              <h2 class="text-2xl font-black text-[#212121]">
                {{ pendingPayments[currentPaymentIndex]?.type }}
              </h2>
              <p class="text-accent font-black text-3xl mt-1">
                R$
                {{
                  (pendingPayments[currentPaymentIndex]?.amount || 0).toFixed(2)
                }}
              </p>
            </div>
            <div class="p-8">
              <template
                v-if="pendingPayments[currentPaymentIndex]?.type === 'Dinheiro'"
              >
                <div class="space-y-4">
                  <div class="space-y-1.5">
                    <label
                      class="text-xs font-black uppercase tracking-widest text-[#757575] ml-1"
                      >Valor Recebido</label
                    >
                    <input
                      type="number"
                      v-model.number="cashReceivedForCurrent"
                      min="0"
                      step="0.01"
                      class="w-full py-4 px-4 rounded border bg-gray-50 border-[#E0E0E0] text-[#212121] text-xl font-black text-right focus:border-primary/50 focus:outline-none transition-all"
                      @input="updateChangeBreakdown"
                    />
                  </div>
                  <div
                    v-if="
                      cashReceivedForCurrent >=
                      (pendingPayments[currentPaymentIndex]?.amount || 0)
                    "
                    class="p-6 bg-accent-light border border-accent/30 rounded"
                  >
                    <div class="flex justify-between items-center mb-3">
                      <span
                        class="text-xs font-black text-[#757575] uppercase tracking-widest"
                        >Troco</span
                      >
                      <span class="text-2xl font-black text-accent">
                        R$
                        {{
                          (
                            cashReceivedForCurrent -
                            (pendingPayments[currentPaymentIndex]?.amount || 0)
                          ).toFixed(2)
                        }}
                      </span>
                    </div>
                    <div
                      v-if="changeBreakdownList.length > 0"
                      class="space-y-1.5"
                    >
                      <p
                        class="text-[10px] font-black text-[#757575] uppercase tracking-widest mb-2"
                      >
                        Detalhamento:
                      </p>
                      <div
                        v-for="item in changeBreakdownList"
                        :key="item.label"
                        class="flex justify-between text-xs font-bold text-[#212121]"
                      >
                        <span class="text-[#757575]">{{ item.label }}</span>
                        <span>× {{ item.count }}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="mt-8 flex gap-3">
                  <button
                    @click="cancelPaymentFlow"
                    class="flex-1 py-3 bg-white border border-[#E0E0E0] text-[#757575] font-black uppercase text-xs rounded hover:bg-gray-50 transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    @click="confirmCashPayment"
                    :disabled="
                      cashReceivedForCurrent <
                      (pendingPayments[currentPaymentIndex]?.amount || 0)
                    "
                    class="flex-1 py-3 bg-primary text-white font-black uppercase text-xs rounded hover:bg-primary-dark transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Confirmar
                  </button>
                </div>
              </template>
              <template v-else>
                <div
                  class="p-6 bg-gray-50 border border-[#E0E0E0] rounded text-center mb-8"
                >
                  <p class="text-[#757575] font-bold text-sm mb-2">
                    Confirmar recebimento via
                  </p>
                  <p class="text-[#212121] font-black text-xl">
                    {{ pendingPayments[currentPaymentIndex]?.type }}
                  </p>
                  <p class="text-accent font-black text-3xl mt-2">
                    R$
                    {{
                      (pendingPayments[currentPaymentIndex]?.amount || 0).toFixed(
                        2,
                      )
                    }}
                  </p>
                </div>
                <div class="flex gap-3">
                  <button
                    @click="cancelPaymentFlow"
                    class="flex-1 py-3 bg-white border border-[#E0E0E0] text-[#757575] font-black uppercase text-xs rounded hover:bg-gray-50 transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    @click="confirmNonCashPayment"
                    class="flex-1 py-3 bg-primary text-white font-black uppercase text-xs rounded hover:bg-primary-dark transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle :size="16" /> Recebido
                  </button>
                </div>
              </template>
            </div>
          </div>
        </div>
      </Teleport>
      
      <Teleport to="body">
        <div
          v-if="showReceiptModal"
          class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[99999]"
        >
          <div
            class="bg-white border border-[#E0E0E0] rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden"
          >
            <div class="p-8 flex flex-col items-center gap-4">
              <div class="p-4 bg-accent-light rounded-full border border-accent/20">
                <Printer :size="32" class="text-accent" />
              </div>
              <h2 class="text-xl font-black text-[#212121] uppercase tracking-tight text-center">
                Deseja imprimir o cupom fiscal?
              </h2>
              <p class="text-[#757575] text-xs text-center font-bold uppercase tracking-widest">
                Um comprovante será aberto para impressão
              </p>
            </div>
            <div class="flex border-t border-[#E0E0E0]">
              <button
                @click="showReceiptModal = false"
                class="flex-1 py-4 text-[#757575] font-black uppercase tracking-widest text-xs hover:bg-gray-50 transition-all border-r border-[#E0E0E0]"
              >
                Não
              </button>
              <button
                @click="() => { emitReceipt(pendingReceiptData.comanda, pendingReceiptData.paymentInfo); showReceiptModal = false; }"
                class="flex-1 py-4 text-primary font-black uppercase tracking-widest text-xs hover:bg-accent-light transition-all flex items-center justify-center gap-2"
              >
                <Printer :size="16" /> Imprimir
              </button>
            </div>
          </div>
        </div>
      </Teleport>
    </div>
  </SubscriptionGuard>
</template>

<script setup>
import SubscriptionGuard from "@/components/SubscriptionGuard.vue";
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { useComandaStore } from "@/stores/comandaManagement";
import { useClosedComandaStore } from "@/stores/closedComandas";
import { useKitchenStore } from "@/stores/kitchen";
import { useAuthStore } from "@/stores/auth";
import { useCouponStore } from "@/stores/coupons";
import { useToast } from "@/composables/useToast";
import { useUtils } from "@/composables/useUtils.js";
import { request } from "@/services/api";
import {
  Monitor,
  Receipt,
  AlertTriangle,
  FileText,
  CheckCircle,
  X,
  AlertCircle,
  Tag,
  XCircle,
  Printer,
} from "lucide-vue-next";
import { initCashierSocket, destroyCashierSocket } from '@/stores/cashierSocket';
import localStorageService from "@/services/localStorageService";

const comandaStore = useComandaStore();
const closedComandaStore = useClosedComandaStore();
const kitchenStore = useKitchenStore();
const authStore = useAuthStore();
const couponStore = useCouponStore();
const utils = useUtils();
const { showToast } = useToast();

const comandaUnitLabel = localStorageService.getComandaUnitLabel();

function getComandaTypeLabel(comanda) {
  return comanda.isAutoatendimento ? 'Autoatendimento' : comandaUnitLabel;
}

function getComandaMainLabel(comanda) {
  if (comanda.isAutoatendimento && comanda.customerName) return comanda.customerName;
  return comanda.label;
}

const BACKEND_TO_LOCAL_STATUS = {
    'Aguardando_Preparo': 'pending',
    'Em_Preparo': 'preparing',
    'Pronto': 'ready',
    'Finalizado': 'finished',
    'Cancelado': 'cancelled',
};

let pollInterval = null;

onMounted(async () => {
  await comandaStore.loadComandas();
  pollInterval = setInterval(() => comandaStore.loadComandas(), 30_000);
  initCashierSocket((data) => {
      const localStatus = BACKEND_TO_LOCAL_STATUS[data.status] || data.status;
      const order = kitchenStore.orders.find(o => o.id === data.orderId);
      if (order) {
          order.status = localStatus;
      } else {
          kitchenStore.addOrder({ id: data.orderId, comandaId: data.comandaId, status: localStatus });
      }
      if (data.status === 'Pronto') {
          showToast(`Pedido #${data.orderId} está PRONTO!`, 'success');
      } else if (data.status === 'Cancelado') {
          showToast(`Pedido #${data.orderId} foi cancelado.`, 'error');
      }
  });
});

onUnmounted(() => {
    destroyCashierSocket();
    clearInterval(pollInterval);
});

function getOrderItems(order) {
  const items = order.items || order.productOrders || [];
  return items.map((i) => {
    const variationName = i.variations?.[0]?.productVariation?.name || '';
    const baseName = i.name || i.product?.name || 'Item';
    return {
      name: baseName + (variationName ? ` (${variationName})` : ''),
      amount: Number(i.amount || i.quantity || 1),
      price: Number(i.price ?? i.Preco_Unitario_Momento ?? 0),
    };
  });
}

function getOrderTotal(order) {
  const items = getOrderItems(order);
  if (items.length === 0) return Number(order.price ?? 0);
  return items.reduce((sum, item) => sum + item.price * item.amount, 0);
}

const ALL_PAYMENT_METHODS = [
  "Dinheiro",
  "Cartão Débito",
  "Cartão Crédito",
  "PIX",
];

const enabledPaymentMethods = computed(() => {
  try {
    const saved = localStorage.getItem("paymentMethods");
    return saved ? JSON.parse(saved) : ALL_PAYMENT_METHODS;
  } catch {
    return ALL_PAYMENT_METHODS;
  }
});

const denominations = [
  { label: "R$ 200", value: 200 }, { label: "R$ 100", value: 100 }, { label: "R$ 50", value: 50 }, { label: "R$ 20", value: 20 }, { label: "R$ 10", value: 10 }, { label: "R$ 5", value: 5 }, { label: "R$ 2", value: 2 }, { label: "R$ 1", value: 1 }, { label: "R$ 0,50", value: 0.5 }, { label: "R$ 0,25", value: 0.25 }, { label: "R$ 0,10", value: 0.1 }, { label: "R$ 0,05", value: 0.05 },
];

const selectedComanda = ref(null);
const showDetails = ref(false);
const discountType = ref("percent");
const discountValue = ref(0);
const discountRaw = ref("");

const applyDiscountMask = (raw) => {
  let val = String(raw).replace(/[^\d,]/g, "");
  const commaIdx = val.indexOf(",");
  if (commaIdx !== -1) {
    val =
      val.slice(0, commaIdx + 1) + val.slice(commaIdx + 1).replace(/,/g, "");
    val = val.slice(0, commaIdx + 3);
  }
  const parts = val.split(",");
  parts[0] = parts[0].replace(/^0+(\d)/, "$1");
  return parts.join(",");
};

const onDiscountInput = (e) => {
  if (discountType.value === "percent") {
    const digits = e.target.value.replace(/\D/g, "");
    const num = Math.min(100, parseInt(digits, 10) || 0);
    discountValue.value = num;
    discountRaw.value = num === 0 ? "" : String(num);
  } else {
    const masked = applyDiscountMask(e.target.value);
    discountRaw.value = masked;
    discountValue.value = parseFloat(masked.replace(",", ".")) || 0;
  }
};
const paymentSplits = ref([{ type: "Dinheiro", amount: 0 }]);
const splitPayment = ref(false);
const numberOfPeople = ref(1);
const showRulesModal = ref(false);
const rulesModalMessage = ref("");
const pendingCancel = ref(false);
const manualCancelTargetId = ref(null);
const cancelReason = ref("");
const showCancelComandaModal = ref(false);
const cancelComandaReason = ref("");
const paymentFlowActive = ref(false);
const pendingPayments = ref([]);
const currentPaymentIndex = ref(0);
const cashReceivedForCurrent = ref(0);
const currentChangeBreakdown = ref({});

const ordersWithStatus = computed(() => {
  if (!selectedComanda.value) return [];
  return selectedComanda.value.orders
    .map((order) => {
      const kitchenOrder = kitchenStore.orders.find((o) => o.id === order.id);
      return { ...order, status: kitchenOrder ? kitchenOrder.status : "ready" };
    })
    .filter(o => o.status !== 'cancelled'); 
});

const hasPreparing = computed(() => ordersWithStatus.value.some((o) => o.status === "preparing"));
const hasPending = computed(() => ordersWithStatus.value.some((o) => o.status === "pending"));

const subtotal = computed(() => {
  if (!selectedComanda.value) return 0;
  const orders = selectedComanda.value.orders || [];
  const hasItems = orders.some(o => (o.productOrders || o.items || []).length > 0);
  if (!hasItems) return Number(selectedComanda.value.total) || 0;
  const sum = orders.reduce((acc, order) => {
    const kitchenOrder = kitchenStore.orders.find(k => k.id === order.id);
    if (kitchenOrder?.status === 'cancelled') return acc; 
    return acc + getOrderTotal(order);
  }, 0);
  return Math.round(sum * 100) / 100;
});

const totalWithDiscount = computed(() => {
  const sub = subtotal.value;
  let afterManual = sub;
  if (discountValue.value) {
    if (discountType.value === "percent")
      afterManual = sub * (1 - discountValue.value / 100);
    else afterManual = Math.max(0, sub - discountValue.value);
  }
  return Math.max(0, afterManual - couponDiscount.value);
});

const totalPayments = computed(() => paymentSplits.value.reduce((sum, s) => sum + (s.amount || 0), 0));

const isFinalizeDisabled = computed(() => {
  const activeOrdersCount = ordersWithStatus.value.length;
  if (activeOrdersCount === 0) return false;
  if (splitPayment.value) {
    const hasZero = paymentSplits.value.some((s) => !s.amount || s.amount <= 0);
    const totalMismatch = Math.abs(totalPayments.value - totalWithDiscount.value) > 0.01;
    return hasZero || totalMismatch;
  }
  return totalWithDiscount.value < 0; 
});

watch(discountType, () => {
  discountValue.value = 0;
  discountRaw.value = "";
  appliedCoupon.value = null;
  couponCodeInput.value = "";
  couponError.value = "";
});

const couponCodeInput = ref("");
const appliedCoupon = ref(null);
const couponError = ref("");

const applyCoupon = () => {
  couponError.value = "";
  if (!couponCodeInput.value.trim()) return;
  const coupon = couponStore.findByCode(couponCodeInput.value);
  if (!coupon) { couponError.value = "Cupom não encontrado ou inativo."; return; }
  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) { couponError.value = "Este cupom está vencido."; return; }
  appliedCoupon.value = coupon;
  couponError.value = "";
};

const removeCoupon = () => { appliedCoupon.value = null; couponCodeInput.value = ""; couponError.value = ""; };

const couponDiscount = computed(() => {
  if (!appliedCoupon.value) return 0;
  const sub = subtotal.value;
  if (appliedCoupon.value.type === "percent") return sub * (appliedCoupon.value.value / 100);
  return Math.min(appliedCoupon.value.value, sub);
});

watch(numberOfPeople, (newVal) => {
  const num = Math.max(2, newVal);
  if (num !== newVal) numberOfPeople.value = num;
  const currentLength = paymentSplits.value.length;
  if (currentLength < num) {
    for (let i = currentLength; i < num; i++)
      paymentSplits.value.push({ type: "Dinheiro", amount: 0 });
  } else if (currentLength > num) {
    paymentSplits.value.splice(num);
  }
});

function distributeEqually() {
  const num = numberOfPeople.value;
  const total = totalWithDiscount.value;
  const each = Math.floor((total / num) * 100) / 100;
  paymentSplits.value = Array.from({ length: num }, (_, i) => ({ type: "Dinheiro", amount: i === 0 ? total - each * (num - 1) : each, }));
}

function updateChangeBreakdown() {
  const current = pendingPayments.value[currentPaymentIndex.value];
  const received = cashReceivedForCurrent.value;
  if (received >= current.amount) {
    const change = received - current.amount;
    const breakdown = {};
    let remainingCents = Math.round(change * 100);
    for (const denom of denominations) {
      const denomCents = Math.round(denom.value * 100);
      if (remainingCents >= denomCents) {
        const count = Math.floor(remainingCents / denomCents);
        breakdown[denom.label] = count;
        remainingCents -= count * denomCents;
      }
    }
    currentChangeBreakdown.value = breakdown;
  } else { currentChangeBreakdown.value = {}; }
}

const changeBreakdownList = computed(() => Object.entries(currentChangeBreakdown.value).map(([label, count]) => ({ label, count, })));

function openDetails(comanda) {
  selectedComanda.value = comanda;
  discountType.value = "percent";
  discountValue.value = 0;
  discountRaw.value = "";
  appliedCoupon.value = null;
  couponCodeInput.value = "";
  couponError.value = "";
  splitPayment.value = false;
  numberOfPeople.value = 2;
  paymentSplits.value = [{ type: "Dinheiro", amount: 0 }];
  showDetails.value = true;
}

function closeDetails() { showDetails.value = false; selectedComanda.value = null; }
function addPaymentSplit() { paymentSplits.value.push({ type: "Dinheiro", amount: 0 }); }
function removePaymentSplit(index) { paymentSplits.value.splice(index, 1); }

const confirmCancelComanda = async () => {
  if (!cancelComandaReason.value.trim()) return;

  const currentUserId = authStore.usuario?.id || authStore.user?.id || 1;

  try {
    await request(`/commands/${selectedComanda.value.id}/cancel`, {
      method: "POST",
      body: { 
        reason: cancelComandaReason.value,
        userId: Number(currentUserId)
      },
    });

    const activeOrders = ordersWithStatus.value.filter(o => o.status !== 'cancelled' && o.status !== 'finished');
    for (const order of activeOrders) {
      await kitchenStore.finishOrder(order.id, cancelComandaReason.value);
    }

    const closedComanda = { ...selectedComanda.value, closedAt: new Date().toISOString(), status: "CANCELADO", cancelReason: cancelComandaReason.value, paymentDetails: null, };
    closedComandaStore.addClosedComanda(closedComanda);
    comandaStore.removeComanda(selectedComanda.value.id);
    showCancelComandaModal.value = false;
    closeDetails();
    showToast(`${comandaUnitLabel} cancelada!`, "success");
  } catch (error) { 
    showToast("Erro ao cancelar a comanda.", "error"); 
  }
};

const openManualCancel = (id) => { manualCancelTargetId.value = id; cancelReason.value = ""; };
const dismissManualCancel = () => { manualCancelTargetId.value = null; cancelReason.value = ""; };

const confirmManualCancel = async () => {
  if (!cancelReason.value.trim()) return;
  try {
    await kitchenStore.finishOrder(manualCancelTargetId.value, cancelReason.value);
    const kOrder = kitchenStore.orders.find(o => o.id === manualCancelTargetId.value);
    if (kOrder) { kOrder.status = 'cancelled'; } else { kitchenStore.addOrder({ id: manualCancelTargetId.value, status: 'cancelled' }); }
    manualCancelTargetId.value = null;
    cancelReason.value = "";
    showToast("Pedido cancelado!", "success");
  } catch (error) { showToast("Erro ao cancelar o pedido.", "error"); }
};

function handleFinalize() {
  if (isFinalizeDisabled.value) return;
  if (hasPreparing.value) {
    rulesModalMessage.value = "Existem pedidos em preparo. Eles serão cobrados mesmo assim. Deseja continuar?";
    pendingCancel.value = false;
    cancelReason.value = "";
    showRulesModal.value = true;
  } else if (hasPending.value) {
    rulesModalMessage.value = "Existem pedidos aguardando preparo na cozinha. Para cancelá-los, informe o motivo abaixo.";
    pendingCancel.value = true;
    cancelReason.value = "";
    showRulesModal.value = true;
  } else { startPaymentFlow(); }
}

function confirmRules(confirm) {
  if (!confirm) { showRulesModal.value = false; return; }
  if (pendingCancel.value) {
    if (!cancelReason.value.trim()) return;
    const pendingOrders = ordersWithStatus.value.filter((o) => o.status === "pending");
    pendingOrders.forEach((order) => {
      kitchenStore.finishOrder(order.id, cancelReason.value); 
      const kOrder = kitchenStore.orders.find(o => o.id === order.id);
      if (kOrder) kOrder.status = 'cancelled';
    });
  }
  showRulesModal.value = false;
  startPaymentFlow();
}

function startPaymentFlow() {
  if (!splitPayment.value) { paymentSplits.value[0].amount = totalWithDiscount.value; } else { if (isFinalizeDisabled.value) { showToast("A divisão de pagamento é inválida.", "error"); return; } }
  pendingPayments.value = paymentSplits.value.filter((m) => m.amount > 0);
  currentPaymentIndex.value = 0;
  cashReceivedForCurrent.value = 0;
  if (pendingPayments.value.length === 0 && totalWithDiscount.value === 0) { finishPaymentFlow(); return; }
  paymentFlowActive.value = true;
  showDetails.value = false;
  processCurrentPayment();
}

function processCurrentPayment() {
  const current = pendingPayments.value[currentPaymentIndex.value];
  if (current.type === "Dinheiro") { cashReceivedForCurrent.value = current.amount; updateChangeBreakdown(); }
}

function confirmNonCashPayment() { nextPayment(); }
function confirmCashPayment() {
  const current = pendingPayments.value[currentPaymentIndex.value];
  if (cashReceivedForCurrent.value < current.amount) { showToast("Valor recebido insuficiente.", "error"); return; }
  nextPayment();
}

function nextPayment() {
  if (currentPaymentIndex.value < pendingPayments.value.length - 1) { currentPaymentIndex.value++; processCurrentPayment(); } else { finishPaymentFlow(); }
}

async function finishPaymentFlow() {
  try {
    await request(`/commands/${selectedComanda.value.id}/checkout`, {
      method: "POST",
      body: { payments: pendingPayments.value.map(p => ({ type: p.type, amount: p.amount })), totalValue: totalWithDiscount.value, change: cashReceivedForCurrent.value > (pendingPayments.value[0]?.amount || 0) ? cashReceivedForCurrent.value - pendingPayments.value[0].amount : 0, discountType: discountType.value, discountValue: discountValue.value },
    });
    const closedComanda = { ...selectedComanda.value, closedAt: new Date().toISOString(), status: "FINALIZADO", paymentDetails: { discountType: discountType.value, discountValue: discountValue.value, coupon: appliedCoupon.value ? appliedCoupon.value.code : null, couponDiscount: couponDiscount.value, payments: pendingPayments.value, }, };
    closedComandaStore.addClosedComanda(closedComanda);
    comandaStore.removeComanda(selectedComanda.value.id);
    paymentFlowActive.value = false;
    if (totalWithDiscount.value > 0) {
        pendingReceiptData.value = { comanda: { ...closedComanda }, paymentInfo: { totalFinal: totalWithDiscount.value, coupon: appliedCoupon.value ? appliedCoupon.value.code : null, couponDiscount: couponDiscount.value, manualDiscount: discountType.value === "percent" ? subtotal.value * (discountValue.value / 100) : discountValue.value, payments: pendingPayments.value, }, };
        showReceiptModal.value = true;
    }
    closeDetails();
    showToast(totalWithDiscount.value === 0 ? "Comanda removida!" : "Finalizada!", "success");
  } catch (error) {
    const data = error.response?.data || error.data || error;
    if (data?.errors && Array.isArray(data.errors)) { showToast(data.errors[0].mensagem, "error"); } else { showToast(data?.message || "Erro no pagamento.", "error"); }
  }
}

function cancelPaymentFlow() { paymentFlowActive.value = false; showDetails.value = true; }

const showReceiptModal = ref(false);
const pendingReceiptData = ref(null);

function buildReceiptHtml(comanda, paymentInfo) {
  const now = new Date(); const dateStr = now.toLocaleDateString("pt-BR"); const timeStr = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  const allItems = [];
  (comanda.orders || []).forEach((order) => {
    const kitchenOrder = kitchenStore.orders.find(k => k.id === order.id);
    if (kitchenOrder?.status === 'cancelled') return;
    const items = getOrderItems(order);
    items.forEach((item) => {
      const existing = allItems.find((i) => i.name === item.name);
      if (existing) { existing.amount += item.amount; existing.total += item.price * item.amount; } else { allItems.push({ name: item.name, amount: item.amount, unitPrice: item.price, total: item.price * item.amount }); }
    });
  });
  const subtotalVal = subtotal.value; const totalFinal = paymentInfo ? paymentInfo.totalFinal : subtotalVal; const coupon = paymentInfo?.coupon || null; const couponDisc = paymentInfo?.couponDiscount || 0; const manualDisc = paymentInfo?.manualDiscount || 0; const payments = paymentInfo?.payments || [];
  const itemRows = allItems.map((i) => `<tr><td style="padding:5px 4px;">${i.amount}x</td><td style="padding:5px 4px;">${i.name}</td><td style="padding:5px 4px;text-align:right;">R$ ${i.unitPrice.toFixed(2)}</td><td style="padding:5px 4px;text-align:right;">R$ ${i.total.toFixed(2)}</td></tr>`).join("");
  const discountSection = (manualDisc > 0 || couponDisc > 0) ? `<tr style="color:#555;"><td colspan="3" style="padding:4px;border-top:1px dashed #ccc;padding-top:8px;">Subtotal</td><td style="padding:4px;text-align:right;border-top:1px dashed #ccc;padding-top:8px;">R$ ${subtotalVal.toFixed(2)}</td></tr>${manualDisc > 0 ? `<tr style="color:#c00;"><td colspan="3" style="padding:3px 4px;">Desconto aplicado</td><td style="padding:3px 4px;text-align:right;">− R$ ${manualDisc.toFixed(2)}</td></tr>` : ""}${couponDisc > 0 ? `<tr style="color:#c00;"><td colspan="3" style="padding:3px 4px;">Cupom ${coupon ? `(${coupon})` : ""}</td><td style="padding:3px 4px;text-align:right;">− R$ ${couponDisc.toFixed(2)}</td></tr>` : ""}` : "";
  const paymentSection = payments.length ? payments.map((p) => `<tr><td colspan="3" style="padding:3px 4px;color:#555;">${p.type}</td><td style="padding:3px 4px;text-align:right;">R$ ${Number(p.amount).toFixed(2)}</td></tr>`).join("") : "";
  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>Cupom</title><style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:monospace;font-size:13px;color:#111;background:#fff;padding:16px;}.wrap{max-width:320px;margin:0 auto;}h2{text-align:center;font-size:16px;letter-spacing:1px;margin-bottom:2px;}.sub{text-align:center;color:#555;font-size:11px;margin-bottom:12px;}hr{border:none;border-top:1px dashed #aaa;margin:10px 0;}table{width:100%;border-collapse:collapse;}th{text-align:left;font-size:10px;text-transform:uppercase;color:#888;padding:4px;}th:last-child,th:nth-child(3){text-align:right;}.total-row td{font-weight:bold;font-size:15px;border-top:2px solid #111;padding-top:8px;padding-bottom:4px;}.footer{text-align:center;margin-top:14px;color:#888;font-size:10px;}@media print{body{padding:0;}button{display:none!important;}}</style></head><body><div class="wrap"><h2>CUPOM FISCAL</h2><p class="sub">${dateStr} às ${timeStr}</p><hr><p style="font-size:11px;margin-bottom:6px;">${comandaUnitLabel}: <strong>${comanda.isAutoatendimento && comanda.customerName ? comanda.customerName : comanda.label}</strong></p><hr><table><thead><tr><th>Qtd</th><th>Descrição</th><th>Unit.</th><th>Total</th></tr></thead><tbody>${itemRows}${discountSection}<tr class="total-row"><td colspan="3">TOTAL</td><td style="text-align:right;">R$ ${Number(totalFinal).toFixed(2)}</td></tr>${paymentSection}</tbody></table><hr><p class="footer">Obrigado!</p><div style="text-align:center;margin-top:16px;"><button onclick="window.print()" style="padding:8px 20px;background:#1976d2;color:#fff;border:none;border-radius:6px;font-size:13px;cursor:pointer;">Imprimir</button></div></div></body></html>`;
}

function emitReceipt(comanda, paymentInfo = null) {
  const html = buildReceiptHtml(comanda, paymentInfo);
  const win = window.open("", "_blank", "width=400,height=600");
  if (!win) { showToast("Permita pop-ups.", "error"); return; }
  win.document.write(html); win.document.close(); win.focus(); setTimeout(() => win.print(), 400);
}

function emitReceiptForSelected() {
  const hasDiscount = discountValue.value > 0 || couponDiscount.value > 0;
  const paymentInfo = hasDiscount ? { totalFinal: totalWithDiscount.value, coupon: appliedCoupon.value ? appliedCoupon.value.code : null, couponDiscount: couponDiscount.value, manualDiscount: discountType.value === "percent" ? subtotal.value * (discountValue.value / 100) : discountValue.value, payments: [], } : null;
  emitReceipt(selectedComanda.value, paymentInfo);
}

function applyMask(event, method) {
  let value = event.target.value.replace(/\D/g, "");
  if (value === "") value = "0";
  method.amount = parseInt(value, 10) / 100;
  event.target.value = utils.formatCurrency(method.amount);
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #e0e0e0; border-radius: 10px; }
input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
</style>