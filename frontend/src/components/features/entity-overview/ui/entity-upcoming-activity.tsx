import { formatDateTime } from '@common/helpers/globalHelpers'
import { ICONS } from '@common/icons'
import { type ActivityType } from '@features/activity-feed/shared/activity-types'
import If from '@utilities/If'
import { LuClock } from 'react-icons/lu'

export default function EntityUpcomingActivity({ activity }: { activity: ActivityType }) {
  const formattedDueDate = formatDateTime(activity.due_date)

  return (
    <div
      className="flex items-center justify-between gap-3 rounded-md border border-slate-100 dark:border-neutral-700"
      key={activity.id}
    >
      <div className="flex min-w-0 items-center gap-3">
        <span className="shrink-0 text-base">{ICONS[activity.type]}</span>
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-medium text-slate-600 dark:text-neutral-300">
            {activity.title}
          </span>
          <If conditions={activity.details}>
            <span className="truncate text-xs text-slate-400 dark:text-neutral-500">
              {activity.details}
            </span>
          </If>
        </div>
      </div>
      <If conditions={activity.due_date}>
        <div className="flex shrink-0 items-center gap-1.5 text-slate-500 dark:text-neutral-500">
          <LuClock className="shrink-0" />
          <span className="whitespace-nowrap text-xs">{formattedDueDate}</span>
        </div>
      </If>
    </div>
  )
}
