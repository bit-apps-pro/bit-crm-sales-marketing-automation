import { __ } from '@common/helpers/i18nWrap'

interface InvoicePaymentError {
  data?: unknown
  message?: string
}

export function formatInvoicePaymentError(
  error: InvoicePaymentError,
  fallback = __('Something went wrong')
) {
  if (typeof error.message === 'string' && error.message.trim()) return error.message

  if (typeof error.data === 'string' && error.data.trim()) return error.data

  if (Array.isArray(error.data)) {
    const messages = error.data.filter(isMessageValue).join(' ')
    if (messages) return messages
  }

  if (error.data && typeof error.data === 'object') {
    const messages = Object.values(error.data)
      .flatMap(value => (Array.isArray(value) ? value : [value]))
      .filter(isMessageValue)
      .join(' ')

    if (messages) return messages
  }

  return fallback
}

function isMessageValue(value: unknown): value is number | string {
  return typeof value === 'string' || typeof value === 'number'
}
