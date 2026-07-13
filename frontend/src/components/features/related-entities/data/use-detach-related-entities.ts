import NotifyContext from '@common/context/NotifyContext'
import queryRequest, { type Response } from '@common/helpers/request'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useContext } from 'react'

interface DetachModulePayload {
  entity: string
  entityId: number
  relatedEntity: string
  relatedEntityIds: number[]
}

export default function useDetachModule() {
  const { messageApi } = useContext(NotifyContext)
  const queryClient = useQueryClient()

  const { isPending, mutateAsync } = useMutation<
    Response<string>,
    Response<string>,
    DetachModulePayload
  >({
    mutationFn: payload => queryRequest(`common/related-entities/detach`, payload),
    mutationKey: ['common', 'related-entities', 'detach'],
    onError: error => {
      messageApi?.error(error.message || error.data)
    },
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: ['common', 'related-entities'] })
      messageApi?.success(data.message || data.data)
    }
  })

  return {
    detachModule: mutateAsync,
    isDetachingModule: isPending
  }
}
