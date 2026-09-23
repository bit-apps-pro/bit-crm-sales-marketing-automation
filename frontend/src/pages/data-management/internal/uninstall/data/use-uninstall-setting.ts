import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { useQuery } from '@tanstack/react-query'

import { type UninstallSetting } from '../shared/types'

export default function useUninstallSetting() {
  const { data, isLoading } = useQuery<Response<UninstallSetting>, Error, UninstallSetting>({
    queryFn: ({ signal }) =>
      queryRequest('settings/uninstall/show', undefined, undefined, 'GET', { signal }),
    queryKey: ['settings', 'uninstall'],
    select: res => res.data
  })

  return {
    isUninstallSettingLoading: isLoading,
    uninstallSetting: data
  }
}
