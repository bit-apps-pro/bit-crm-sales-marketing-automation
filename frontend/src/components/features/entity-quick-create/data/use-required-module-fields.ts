import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { type BaseFieldItemType } from '@features/entity-form/shared/entity-form-types'
import { useQuery } from '@tanstack/react-query'

export default function useRequiredModuleFields(module: string) {
  const { data, isFetching, isPending } = useQuery<
    Response<BaseFieldItemType[]>,
    Error,
    BaseFieldItemType[]
  >({
    enabled: Boolean(module),
    queryFn: ({ signal }) =>
      queryRequest('common/required-fields', undefined, { module }, 'GET', { signal }),
    queryKey: ['common', 'required-fields', module],
    select: res => res?.data || []
  })

  return {
    fields: data || [],
    isFieldsFetching: isFetching,
    isFieldsPending: isPending
  }
}
