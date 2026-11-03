import NotifyContext from '@common/context/NotifyContext'
import { __ } from '@common/helpers/i18nWrap'
import queryRequest, { type Response } from '@common/helpers/request'
import NotesDefaultsForm, {
  type NotesDefaults
} from '@pages/invoice-settings/shared/notes-defaults-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Skeleton } from 'antd'
import { useContext } from 'react'

import useInvoiceDefaults from './data/use-invoice-defaults'

export default function Defaults() {
  const { messageApi } = useContext(NotifyContext)
  const queryClient = useQueryClient()
  const { invoiceDefaults, isInvoiceDefaultsLoading } = useInvoiceDefaults()

  const { isPending, mutate } = useMutation<Response<NotesDefaults>, Response<string>, NotesDefaults>({
    mutationFn: values => queryRequest('invoices/defaults', values, undefined, 'POST'),
    onError: error => {
      messageApi?.error(error.message || error.data)
    },
    onSuccess: res => {
      messageApi?.success(res.message)
      queryClient.invalidateQueries({ queryKey: ['invoices', 'defaults'] })
    }
  })

  if (isInvoiceDefaultsLoading) {
    return <Skeleton active />
  }

  return (
    <NotesDefaultsForm
      defaults={invoiceDefaults}
      description={__('New invoices start with these notes. You can still change them on each invoice.')}
      isSaving={isPending}
      onSave={mutate}
    />
  )
}
