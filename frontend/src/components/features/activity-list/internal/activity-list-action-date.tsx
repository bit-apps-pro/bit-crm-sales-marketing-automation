import { formatDateTime } from '@common/helpers/globalHelpers'
import AntIconWrapper from '@icons/AntIconWrapper'
import { Typography } from 'antd'
import { LuClock } from 'react-icons/lu'

export default function ActivityListActionDate({ date }: { date: string }) {
  const formattedDate = date ? formatDateTime(date) : '-'

  return (
    <div className="flex items-center justify-center gap-1">
      <AntIconWrapper>
        <LuClock className="text-gray-500" size={12} />
      </AntIconWrapper>
      <Typography.Text className="text-xs font-medium" type="secondary">
        {formattedDate}
      </Typography.Text>
    </div>
  )
}
