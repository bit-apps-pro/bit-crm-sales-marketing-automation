import { __ } from '@common/helpers/i18nWrap'
import { Typography } from 'antd'

export default function ActivityListActionAssignee({ assignee }: { assignee?: string }) {
  return (
    <div className="flex items-center gap-1">
      <Typography.Text className="text-xs" type="secondary">
        {__('Assigned to:')}
      </Typography.Text>
      <Typography.Text className="text-xs font-medium">{assignee || __('User')}</Typography.Text>
    </div>
  )
}
