import { CalendarOutlined, ClockCircleOutlined } from '@ant-design/icons'
import { formatDateTime } from '@common/helpers/globalHelpers'
import { __ } from '@common/helpers/i18nWrap'
import { type Deal } from '@pages/deal/shared/deal-types'
import If from '@utilities/If'

interface DealDatesInfoProps {
  closedAt?: Deal['closed_at']
  createdAt?: Deal['created_at']
}

export default function DealDatesInfo({ closedAt, createdAt }: DealDatesInfoProps) {
  const createdDate = createdAt && formatDateTime(createdAt)
  const closedDate = closedAt && formatDateTime(closedAt)

  return (
    <div className="flex items-center gap-4 text-sm">
      <If conditions={createdDate}>
        <div className="flex items-center gap-1.5">
          <CalendarOutlined className="text-gray-400" />
          <span className="text-gray-500 dark:text-gray-400">{__('Start')}:</span>
          <span className="font-medium text-gray-700 dark:text-gray-300">{createdDate}</span>
        </div>
      </If>

      <If conditions={closedDate}>
        <div className="h-4 w-px bg-gray-300 dark:bg-gray-600" />
        <div className="flex items-center gap-1.5">
          <ClockCircleOutlined className="text-gray-400" />
          <span className="text-gray-500 dark:text-gray-400">{__('Closing')}:</span>
          <span className="font-medium text-gray-700 dark:text-gray-300">{closedDate}</span>
        </div>
      </If>
    </div>
  )
}
