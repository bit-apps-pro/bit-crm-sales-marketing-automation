import NotifyContext from '@common/context/NotifyContext'
import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useContext } from 'react'

interface RevokeApiKeyPayload {
  userId: number
  uuid: string
}

export default function useRevokeApiKey() {
  const { messageApi } = useContext(NotifyContext)
  const queryClient = useQueryClient()

  const { error, isError, isPending, mutateAsync } = useMutation<
    Response<{ uuid: string }>,
    Response<string>,
    RevokeApiKeyPayload
  >({
    mutationFn: data => queryRequest<{ uuid: string }>('settings/external-api/keys/delete', data),
    mutationKey: ['settings', 'external-api', 'keys', 'delete'],
    onError: err => messageApi?.error(err.message),
    onSuccess: res => {
      messageApi?.success(res.message)
      queryClient.invalidateQueries({ queryKey: ['settings', 'external-api', 'index'] })
    }
  })

  if (isError) {
    console.error(error)
  }

  return {
    isRevokingApiKey: isPending,
    revokeApiKey: mutateAsync
  }
}
