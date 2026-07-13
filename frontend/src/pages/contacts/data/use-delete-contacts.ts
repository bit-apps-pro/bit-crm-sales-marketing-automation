import NotifyContext from '@common/context/NotifyContext'
import { __ } from '@common/helpers/i18nWrap'
import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useContext } from 'react'

export type DeleteMethod = 'delete' | 'trash'

type ResponseData = null | {
  message?: string
  next_id: null | number | string
  previous_id: null | number | string
}

export default function useDeleteContacts() {
  const { messageApi } = useContext(NotifyContext)
  const queryClient = useQueryClient()

  const { isPending, mutateAsync } = useMutation<
    Response<ResponseData>,
    Response<string>,
    { ids: (number | string)[] }
  >({
    mutationFn: ({ ids }) => queryRequest('contacts/trash', { ids }),
    mutationKey: ['contacts', 'trash'],
    onError: error => {
      messageApi?.error(error?.message || error?.data)
    },
    onSuccess: data => {
      messageApi?.success(data.message || __('Contacts deleted successfully.'))
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
    }
  })

  return {
    deleteContacts: mutateAsync,
    isDeletingContacts: isPending
  }
}
