import { __ } from '@common/helpers/i18nWrap'
import { type ActivityType } from '@features/activity-list/shared/activity-types'
import { Tooltip, Typography } from 'antd'

export default function ActivityRelatedEntity({ item }: { item: ActivityType }) {
  return (
    <Tooltip title={__('This activity is related to an entity of module: ') + item.module}>
      <Typography.Text className="text-xs capitalize" type="secondary">
        {`${item.module}: `}{' '}
        <span className="text-black dark:text-white">{item.entity_name || __('No Entity')}</span>
      </Typography.Text>
    </Tooltip>
  )
}
