import { loadMercadoPago } from '@mercadopago/sdk-js'
import { ref, nextTick, onBeforeUnmount, type Ref } from 'vue'

const WIN = window as any
if (!WIN.__mpState) WIN.__mpState = { mp: null as any, cardForm: null as any, lastUnmountAt: 0 }

async function getOrCreateMp(): Promise<any> {
  if (WIN.__mpState.mp) return WIN.__mpState.mp
  await loadMercadoPago()
  WIN.__mpState.mp = new WIN.MercadoPago(import.meta.env.VITE_MP_PUBLIC_KEY, { locale: 'pt-BR' })
  return WIN.__mpState.mp
}

export function useMercadoPago(
  selectedPlan: Ref<any>,
  isSubmitting: Ref<boolean>,
  mpPayerEmail: Ref<string>,
  onSubmit: (payload: { planId: number; cardToken: string; payerEmail: string }) => void,
) {
  const error = ref<string | null>(null)
  const isTokenizing = ref(false)

  const initCardForm = async () => {
    const elapsed = Date.now() - WIN.__mpState.lastUnmountAt
    if (elapsed < 500) {
      await new Promise(resolve => setTimeout(resolve, 500 - elapsed))
    }

    let mp: any
    try {
      mp = await getOrCreateMp()
    } catch {
      error.value = 'Falha ao carregar o sistema de pagamento.'
      return
    }

    try {
      WIN.__mpState.cardForm = mp.cardForm({
        amount: Number(selectedPlan.value.price).toFixed(2),
        iframe: true,
        form: {
          id: 'mp-card-form',
          cardNumber: { id: 'mp-cardNumber', placeholder: '0000 0000 0000 0000' },
          expirationDate: { id: 'mp-expirationDate', placeholder: 'MM/AA' },
          securityCode: { id: 'mp-securityCode', placeholder: 'CVV' },
          cardholderName: { id: 'mp-cardholderName' },
          issuer: { id: 'mp-issuer', placeholder: 'Banco emissor' },
          installments: { id: 'mp-installments' },
          identificationType: { id: 'mp-identificationType' },
          identificationNumber: { id: 'mp-identificationNumber' },
        },
        callbacks: {
          onFormMounted: (err: any) => {
            if (err) { error.value = 'Erro ao carregar formulário de pagamento.'; console.error(err) }
          },
          onSubmit: async (event: any) => {
            event.preventDefault()
            if (isSubmitting.value || isTokenizing.value) return
            error.value = null
            isTokenizing.value = true
            try {
              const { token } = WIN.__mpState.cardForm.getCardFormData()
              if (!token) throw new Error('Não foi possível gerar o token. Verifique os dados do cartão.')
              onSubmit({ planId: selectedPlan.value.id, cardToken: token, payerEmail: mpPayerEmail.value })
            } catch (err: any) {
              error.value = err.message || 'Erro ao processar cartão.'
            } finally {
              isTokenizing.value = false
            }
          },
          onError: (err: any) => {
            console.error('MP Card Form error:', err)
          },
        },
      })
    } catch (e: any) {
      error.value = 'Erro ao carregar formulário de pagamento.'
      console.error('cardForm init error:', e)
    }
  }

  const mountIfNeeded = async () => {
    if (WIN.__mpState.cardForm) return
    await nextTick()
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
    await initCardForm()
  }

  async function resetCardForm() {
    try { WIN.__mpState.cardForm?.unmount() } catch {}
    WIN.__mpState.cardForm = null
    WIN.__mpState.lastUnmountAt = Date.now()
    await nextTick()
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
    await initCardForm()
  }

  onBeforeUnmount(() => {
    try { WIN.__mpState.cardForm?.unmount() } catch {}
    WIN.__mpState.cardForm = null
    WIN.__mpState.lastUnmountAt = Date.now()
  })

  return { error, isTokenizing, mountIfNeeded, resetCardForm }
}