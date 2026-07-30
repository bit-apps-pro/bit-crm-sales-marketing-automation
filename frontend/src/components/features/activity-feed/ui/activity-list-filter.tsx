import { __ } from '@common/helpers/i18nWrap'
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from '@features/activity-feed/shared/activity-constants'
import ActivityFilter from '@utilities/activity-filter/ui/activity-filter'

export default function ActivityListFilter({ showPriority = false }: { showPriority?: boolean }) {
  const filters = [
    {
      key: 'status',
      label: __('Status'),
      options: STATUS_OPTIONS,
      placeholder: __('Filter by status')
    },
    {
      key: 'assigned_to',
      label: __('Assigned To'),
      placeholder: __('Filter by user')
    }
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
