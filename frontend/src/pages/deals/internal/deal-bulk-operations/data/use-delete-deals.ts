import NotifyContext from '@common/context/NotifyContext'
import { __ } from '@common/helpers/i18nWrap'
import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useContext } from 'react'

type ResponseData = null | {
  next_id: null | number | string
  previous_id: null | number | string
}

export default function useDeleteDeals() {
  const { messageApi } = useContext(NotifyContext)
  const queryClient = useQueryClient()

  const { isPending, mutateAsync } = useMutation<
    Response<ResponseData>,
    Response<string>,
    { ids: (number | string)[] }
  >({
    mutationFn: ({ ids }) => queryRequest('deals/trash', { ids }),
    mutationKey: ['deals', 'trash'],
    onError: error => {
      messageApi?.error(error?.message || error?.data)
    },
    onSuccess: data => {
      messageApi?.success(data?.message || __('Deals deleted successfully.'))
      queryClient.invalidateQueries({ queryKey: ['deals'] })
    }
  })

  return {
    deleteDeals: mutateAsync,
    isDeletingDeals: isPending
  }
}
