import NotifyContext from '@common/context/NotifyContext'
import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { type Deal } from '@pages/deal/shared/deal-types'
import { useMutation } from '@tanstack/react-query'
import { type FormInstance } from 'antd'
import { useContext, useState } from 'react'
import { useNavigate } from 'react-router'

interface StoreDealProps {
  customFieldsValues: Record<string, Record<string, unknown>>
  newTagTitles: string[]
  nextAction?: null | string
  systemDefinedFieldsValues: Record<string, unknown>
  tagIds: number[]
}

export default function useStoreDeal(form: FormInstance) {
  const { messageApi } = useContext(NotifyContext)
  const navigate = useNavigate()
  const [nextAction, setNextAction] = useState<string | undefined>()

  const { isPending, mutateAsync } = useMutation<
    Response<Deal>,
    Response<string> | Response<ValidationType<StoreDealProps>>,
    StoreDealProps
  >({
    mutationFn: dealData => queryRequest('deals/store', dealData),
    mutationKey: ['deals', 'store'],
    onError: error => {
      if (typeof error.data === 'object') {
        const errors = Object.entries(error.data).map(([key, messages]) => ({
          errors: messages,
          name: key
        }))

        form.setFields(errors)
      } else {
        messageApi?.error(error.message || error.data)
      }
    },
    onMutate: variables => {
      setNextAction(variables.nextAction ?? undefined)
    },
    onSettled: () => {
      setNextAction(undefined)
    },
    onSuccess: ({ data }, { nextAction }) => {
      messageApi?.success('Deal created successfully')
      form.resetFields()
      if (nextAction === 'create') return navigate(`/deals/details/${data?.id}`)
    }
  })

  return {
    isCreateAndAddPending: isPending && nextAction !== 'create',
    isCreatePending: isPending && nextAction === 'create',
    isStoringPending: isPending,
    storeDeal: mutateAsync
  }
}
