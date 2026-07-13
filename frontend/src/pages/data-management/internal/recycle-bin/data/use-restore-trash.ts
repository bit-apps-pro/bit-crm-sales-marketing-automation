import NotifyContext from '@common/context/NotifyContext'
import { __ } from '@common/helpers/i18nWrap'
import queryRequest from '@common/helpers/request'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useContext } from 'react'

export default function useRestoreTrash() {
  const { messageApi } = useContext(NotifyContext)
  const queryClient = useQueryClient()

  const { isPending, mutateAsync } = useMutation({
    mutationFn: (payload: { ids: number[] }) => queryRequest('trashes/restore', payload),
    mutationKey: ['trashes', 'restore'],
    onError: error => {
      messageApi?.error(error.message || __('Could not restore trash'))
    },
    onSuccess: () => {
      messageApi?.success(__('Trash restored successfully'))
      queryClient.invalidateQueries({ queryKey: ['trashes', 'index'] })
    }
  })

  return {
    isRestoringTrash: isPending,
    restoreTrash: mutateAsync
  }
}
