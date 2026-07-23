import NotifyContext from '@common/context/NotifyContext'
import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { setFormErrors } from '@features/entity-form/shared/entity-form-helpers'
import { type ContactType } from '@pages/contact/shared/contact-types'
import { useMutation } from '@tanstack/react-query'
import { type FormInstance } from 'antd'
import { useContext, useState } from 'react'
import { useNavigate } from 'react-router'

import { type StoreContactPayloadType } from '../shared/contact-create-types'

export default function useStoreContact(form: FormInstance) {
  const { messageApi } = useContext(NotifyContext)
  const navigate = useNavigate()
  const [nextAction, setNextAction] = useState<string | undefined>()

  const { isPending, mutateAsync } = useMutation<
    Response<ContactType>,
    Response<string>,
    StoreContactPayloadType
  >({
    mutationFn: contactData => queryRequest('contacts/store', contactData),
    mutationKey: ['store_contact'],
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
    onSuccess: ({ data, message }, { nextAction }) => {
      if (message) {
        messageApi?.warning(message)
      } else {
        messageApi?.success('Contact created successfully')
      }
      form.resetFields()
      if (nextAction === 'create' && data?.id) return navigate(`/contacts/details/${data.id}`)
    }
  })

  return {
    isCreateAndAddPending: isPending && nextAction !== 'create',
    isCreatePending: isPending && nextAction === 'create',
    isStoringPending: isPending,
    storeContact: mutateAsync
  }
}
