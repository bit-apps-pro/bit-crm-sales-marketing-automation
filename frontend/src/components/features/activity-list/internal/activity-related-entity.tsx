import { __ } from '@common/helpers/i18nWrap'
import { type ActivityType } from '@features/activity-list/shared/activity-types'
import { Typography } from 'antd'
import { Link } from 'react-router'

export default function ActivityRelatedEntity({ item }: { item: ActivityType }) {
  return (
    <Link to={`/${item.module}s/details/${item.entity_id}`}>
      <Typography.Text className="truncate text-wrap text-xs capitalize" type="secondary">
        {`${item.module}: `}
        <span className="text-black dark:text-white">{item.entity_name || __('No Entity')}</span>
      </Typography.Text>
    </Link>
  )
}
