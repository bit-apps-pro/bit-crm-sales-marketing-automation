import { __ } from '@common/helpers/i18nWrap'
import { Tag } from 'antd'

export default function ActivityListActionStatus({ isCompleted }: { isCompleted?: boolean }) {
  return isCompleted ? (
    <Tag className="text-xs" color="green">
      {__('Completed')}
    </Tag>
  ) : (
    <Tag className="text-xs" color="blue">
      {__('Pending')}
    </Tag>
  )
}
