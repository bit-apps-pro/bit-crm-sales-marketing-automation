import NotifyContext from '@common/context/NotifyContext'
import { __ } from '@common/helpers/i18nWrap'
import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { type Key } from 'react'
import { useContext } from 'react'

type ResponseData = null | {
  next_id: null | number | string
  previous_id: null | number | string
}

export default function useDeleteLeads() {
  const { messageApi } = useContext(NotifyContext)
  const queryClient = useQueryClient()

  const { isPending, mutateAsync } = useMutation<
    Response<ResponseData>,
    Response<string>,
    { ids: Key[] }
  >({
    mutationFn: ({ ids }) => queryRequest('leads/trash', { ids }),
    mutationKey: ['leads', 'trash'],
    onError: error => {
      messageApi?.error(error?.message || error?.data)
    },
    onSuccess: data => {
      messageApi?.success(data?.message || __('Leads deleted successfully.'))
      queryClient.invalidateQueries({ queryKey: ['leads'] })
    }
  })

  return {
    deleteLeads: mutateAsync,
    isDeletingLeads: isPending
  }
}
