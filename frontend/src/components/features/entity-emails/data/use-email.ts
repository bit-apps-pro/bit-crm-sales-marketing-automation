import { checkCapability } from '@common/helpers/capabilityHelper'
import queryRequest from '@common/helpers/request'
import { useQuery } from '@tanstack/react-query'

import { getEmailCapability } from '../shared/common-functions'
import { type EntityModule } from '../shared/types'
import useEmailViewStore from '../state/use-email-view-store'

interface EmailResType<T> {
  data: T
}

export default function useEmail<T>(emailId: number, module: EntityModule) {
  const { isViewOpen } = useEmailViewStore()
  const emailCapability = getEmailCapability(module)

  const { data, isFetching, isRefetching } = useQuery<EmailResType<T>>({
    enabled: !!emailId && checkCapability(emailCapability) && isViewOpen,
    queryFn: () => queryRequest(`emails/${emailId}`, undefined, { module }, 'GET'),
    queryKey: ['email', emailId, module],
    retry: false
  })

  return {
    email: data?.data as T,
    isEmailFetching: isFetching,
    isRefetchingEmail: isRefetching
  }
}
