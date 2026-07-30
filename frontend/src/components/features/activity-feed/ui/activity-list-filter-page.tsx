import { getFilteredModuleOptions, MODULES } from '@common/constants/modules'
import { __ } from '@common/helpers/i18nWrap'
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from '@features/activity-feed/shared/activity-constants'
import ActivityFilter from '@utilities/activity-filter/ui/activity-filter'

const FILTERED_MODULE_OPTIONS = getFilteredModuleOptions([MODULES.INVOICE])

export default function ActivityListFilterPage({ showPriority = false }: { showPriority?: boolean }) {
  const filters = [
    {
      key: 'module',
      label: __('Module'),
      options: FILTERED_MODULE_OPTIONS,
      placeholder: __('Filter by module')
    },
    { key: 'status', label: __('Status'), options: STATUS_OPTIONS, placeholder: __('Filter by status') },
    { key: 'assigned_to', label: __('Assigned to'), placeholder: __('Filter by user') }
  ]

  if (showPriority)
    filters.push({
      key: 'priority',
      label: __('Priority'),
      options: PRIORITY_OPTIONS,
      placeholder: __('Filter by priority')
    })

  return <ActivityFilter filters={filters} />
}
