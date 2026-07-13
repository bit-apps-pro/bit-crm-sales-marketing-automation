import CAPABILITIES from '@common/constants/capabilities'
import { checkCapability } from '@common/helpers/capabilityHelper'
import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { type InvoiceType } from '@pages/invoice-create/shared/invoice-create-types'
import { useQuery } from '@tanstack/react-query'

interface InvoicesResType {
  current_page: number
  data: InvoiceType[]
  pages: number
  per_page: number
  total: number
}

interface SearchData {
  id: number
  page: number
  perPage: number
  sortBy: string
  sortOrder: string
}

export default function useDealInvoices(searchData: SearchData) {
  const { data, isError, isFetching, isPending, refetch } = useQuery<
    Response<InvoicesResType>,
    Error,
    InvoicesResType
  >({
    enabled: Boolean(searchData.id) && checkCapability(CAPABILITIES.INVOICE.VIEW),
    queryFn: ({ signal }) =>
      queryRequest(`invoices/deals/${searchData.id}`, {}, { ...searchData }, 'GET', { signal }),
    queryKey: ['invoices', 'deals', searchData],
    select: res => res.data
  })
  return {
    currentPage: data?.current_page || 1,
    invoices: data?.data || [],
    isInvoiceError: isError,
    isInvoiceFetching: isFetching,
    isInvoicePending: isPending,
    pageSize: data?.per_page || 0,
    refetchInvoice: refetch,
    totalInvoice: data?.total || 0
  }
}
