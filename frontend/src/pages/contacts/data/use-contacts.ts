import CAPABILITIES from '@common/constants/capabilities'
import NotifyContext from '@common/context/NotifyContext'
import { checkCapability } from '@common/helpers/capabilityHelper'
import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { type FilterCondition } from '@features/advanced-filter/shared/types'
import { useAdvancedFilterActions } from '@features/advanced-filter/state/use-advanced-filter-store'
import { type ContactType } from '@pages/contact/shared/contact-types'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { create } from 'mutative'
import { useContext, useEffect } from 'react'

import { type ContactsPayloadType } from '../shared/types'

export interface ContactResponse {
  current_page: number
  current_total: number
  data: ContactType[]
  last_page: number
  pages: number
  per_page: number
  total: number
}

type ResponseError = Response<
  ValidationType<ContactsPayloadType & { advancedFilterGroups: FilterCondition[][] }>
>

export default function useContacts(
  payload: ContactsPayloadType,
  advancedFilterGroups: FilterCondition[][]
) {
  const { setGroupErrors } = useAdvancedFilterActions()
  const { messageApi } = useContext(NotifyContext)

  const { data, error, isError, isFetching, isPending, refetch } = useQuery<
    Response<ContactResponse>,
    ResponseError,
    ContactResponse
  >({
    enabled: checkCapability(CAPABILITIES.CONTACT.VIEW),
    placeholderData: keepPreviousData,
    queryFn: ({ signal }) =>
      queryRequest('contacts/search', { ...payload, advancedFilterGroups }, undefined, 'POST', {
        signal
      }),
    queryKey: ['contacts', payload, advancedFilterGroups],
    retry: false,
    select: response => {
      return create(response.data, draft => {
        draft.data = draft.data?.map(contact => ({
          full_name: {
            email: contact?.email,
            first_name: contact?.first_name,
            id: contact.id,
            last_name: contact?.last_name,
            title: contact?.title
          },
          ...contact
        }))
      })
    }
  })

  useEffect(() => {
    if (isError && error?.code === 'VALIDATION') {
      messageApi?.error('Invalid filters! failed to fetch contacts.')
      const filteredErrors = Object.fromEntries(
        Object.entries(error.data).filter(([key]) => key.startsWith('advancedFilterGroups'))
      )
      setGroupErrors(filteredErrors)
    } else {
      setGroupErrors({})
    }
  }, [isError, error, setGroupErrors, messageApi])

  return {
    contacts: data?.data || [],
    isContactsError: isError,
    isContactsFetching: isFetching,
    isContactsPending: isPending,
    refetchContacts: refetch,
    totalContacts: data?.total || 0
  }
}
