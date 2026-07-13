import { MODULES_PLURAL } from '@common/constants/modules'
import NotifyContext from '@common/context/NotifyContext'
import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { setFormErrors } from '@features/entity-form/shared/entity-form-helpers'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { type FormInstance } from 'antd'
import { useContext } from 'react'

import { type StoreEntityPayload, type StoreEntityResponse } from '../shared/types'

export default function useStoreEntity(form: FormInstance, module: string) {
  const { messageApi } = useContext(NotifyContext)
  const queryClient = useQueryClient()

  const { isPending, mutateAsync } = useMutation<
    Response<StoreEntityResponse>,
    Response<string> | Response<ValidationType<StoreEntityResponse>>,
    StoreEntityPayload
  >({
    mutationFn: payload => queryRequest(`${MODULES_PLURAL[module]}/store`, payload),
    mutationKey: [MODULES_PLURAL[module], 'store'],
    onError: error => {
      if (typeof error.data === 'object') return setFormErrors(form, error.data)
      messageApi?.error(error.message || error.data)
    },
    onSuccess: () => {
      messageApi?.success('Created successfully')
      queryClient.invalidateQueries({ queryKey: [MODULES_PLURAL[module]] })
    }
  })

  return {
    isStoringPending: isPending,
    storeEntity: mutateAsync
  }
}
