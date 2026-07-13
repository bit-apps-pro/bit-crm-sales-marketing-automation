import NotifyContext from '@common/context/NotifyContext'
import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { setFormErrors } from '@features/entity-form/shared/entity-form-helpers'
import { type CompanyType } from '@pages/company/shared/company-types'
import { useMutation } from '@tanstack/react-query'
import { type FormInstance } from 'antd'
import { useContext, useState } from 'react'
import { useNavigate } from 'react-router'

interface PayloadTypes {
  customFieldsValues: Record<string, Record<string, unknown>>
  newTagTitles: string[]
  nextAction?: null | string
  systemDefinedFieldsValues: Record<string, unknown>
  tagIds: number[]
}

export default function useStoreCompany(form: FormInstance) {
  const { messageApi } = useContext(NotifyContext)
  const navigate = useNavigate()
  const [nextAction, setNextAction] = useState<string | undefined>()

  const { isPending, mutateAsync } = useMutation<
    Response<CompanyType>,
    Response<string> | Response<ValidationType<CompanyType>>,
    PayloadTypes
  >({
    mutationFn: ({ ...companyData }) => queryRequest('companies/store', companyData),
    mutationKey: ['store_company'],
    onError: error => {
      if (typeof error.data === 'object') return setFormErrors(form, error.data)
      messageApi?.error(error.message || error.data)
    },
    onMutate: variables => {
      setNextAction(variables.nextAction ?? undefined)
    },
    onSettled: () => {
      setNextAction(undefined)
    },
    onSuccess: ({ data }, { nextAction }) => {
      messageApi?.success('Company created successfully')
      form.resetFields()
      if (nextAction === 'create') return navigate(`/companies/details/${data?.id}`)
    }
  })

  return {
    isCreateAndAddPending: isPending && nextAction !== 'create',
    isCreatePending: isPending && nextAction === 'create',
    isStoringPending: isPending,
    storeCompany: mutateAsync
  }
}
