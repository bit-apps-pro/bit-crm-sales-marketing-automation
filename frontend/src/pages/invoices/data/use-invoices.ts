import CAPABILITIES from '@common/constants/capabilities'
import { checkCapability } from '@common/helpers/capabilityHelper'
import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { type InvoiceType } from '@pages/invoice-create/shared/invoice-create-types'
import { keepPreviousData, useQuery } from '@tanstack/react-query'

interface InvoiceResType {
  current_page: number
  data: InvoiceType[]
  pages: number
  per_page: number
  total: number
}

interface InvoicesParams {
  page: number
  perPage: number
  sortBy: string
  sortOrder: string
  statuses: string
}

export default function useInvoices(searchData: InvoicesParams) {
  const { data, error, isError, isFetching, isPending, refetch } = useQuery<
    Response<InvoiceResType>,
    Error,
    InvoiceResType
  >({
    enabled: checkCapability(CAPABILITIES.INVOICE.VIEW),
    placeholderData: keepPreviousData,
    queryFn: ({ signal }) => queryRequest('invoices/index', {}, { ...searchData }, 'GET', { signal }),
    queryKey: ['invoices', 'index', searchData],
    select: res => res.data
  })

  if (isError) {
    console.error(error)
  }

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
