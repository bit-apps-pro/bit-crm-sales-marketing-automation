import queryRequest, { type Response } from '@common/helpers/request'
import { type NotesDefaults } from '@pages/invoice-settings/shared/notes-defaults-form'
import { useQuery } from '@tanstack/react-query'

export default function useInvoiceDefaults() {
  const { data, isLoading } = useQuery<Response<NotesDefaults>, Error, NotesDefaults>({
    queryFn: ({ signal }) => queryRequest('invoices/defaults', undefined, undefined, 'GET', { signal }),
    queryKey: ['invoices', 'defaults'],
    select: res => res.data
  })

  return {
    invoiceDefaults: data,
    isInvoiceDefaultsLoading: isLoading
  }
}
