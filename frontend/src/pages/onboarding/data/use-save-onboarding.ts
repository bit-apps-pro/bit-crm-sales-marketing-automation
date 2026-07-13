import NotifyContext from '@common/context/NotifyContext'
import { $appConfig } from '@common/globalStates'
import { __ } from '@common/helpers/i18nWrap'
import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { useMutation } from '@tanstack/react-query'
import { useAtom } from 'jotai'
import { useContext } from 'react'

import { type OnboardingType } from '../onboarding'

export default function useSaveOnboarding() {
  const { messageApi } = useContext(NotifyContext)
  const [, setAppConfig] = useAtom($appConfig)

  const { isPending, mutateAsync } = useMutation<
    Response<OnboardingType>,
    Response<string>,
    OnboardingType
  >({
    mutationFn: data => queryRequest('onboarding/store', data),
    mutationKey: ['onboarding', 'store'],
    onError: error => {
      messageApi?.error(error.message || __('Failed to complete onboarding'))
    },
    onSuccess: () => {
      // Flipping the flag re-renders <Onboarding/>, whose guard redirects to "/".
      setAppConfig(prev => ({ ...prev, onboardingCompleted: true }))
    }
  })

  return {
    isSavingOnboarding: isPending,
    saveOnboarding: mutateAsync
  }
}
