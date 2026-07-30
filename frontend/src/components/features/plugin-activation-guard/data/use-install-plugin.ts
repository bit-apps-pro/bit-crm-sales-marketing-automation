import NotifyContext from '@common/context/NotifyContext'
import { __ } from '@common/helpers/i18nWrap'
import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useContext } from 'react'

export default function useInstallPlugin(pluginSlug: string) {
  const { messageApi } = useContext(NotifyContext)
  const queryClient = useQueryClient()

  const { isPending, mutateAsync } = useMutation<Response<string>, Response<string>, string>({
    mutationFn: slug => queryRequest('plugins/install', { slug }, undefined, 'POST'),
    mutationKey: ['plugins', 'install', pluginSlug],
    onError: error => {
      messageApi?.error(error.message || __('Failed to install plugin'))
    },
    onSuccess: () => {
      messageApi?.success(__('Plugin activated successfully'))
      queryClient.invalidateQueries({ queryKey: ['plugin-info', pluginSlug] })
    }
  })

  return {
    installPlugin: mutateAsync,
    isInstalling: isPending
  }
}
