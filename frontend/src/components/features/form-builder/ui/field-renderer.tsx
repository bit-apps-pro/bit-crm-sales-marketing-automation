import { __ } from '@common/helpers/i18nWrap'
import If from '@utilities/If'
import { Tag, Typography } from 'antd'

import { type FieldRendererPropsType } from '../shared/field-types'

export default function FieldRenderer({
  isCustom = false,
  isGroup = false,
  isSection = false,
  label,
  type
}: FieldRendererPropsType) {
  return (
    <div className="flex w-full items-center gap-4">
      <Typography.Text className="m-0 text-sm">{label}</Typography.Text>
      <div className="flex items-center justify-start">
        <If conditions={isGroup}>
          <Tag className="text-xs" color="blue">
            {__('group')}
          </Tag>
        </If>

        <If conditions={isCustom}>
          <Tag className="text-xs" color="purple">
            {__('custom')}
          </Tag>
        </If>

        <If conditions={isCustom && !isSection}>
          <Tag className="text-xs" color="green">
            {__(type)}
          </Tag>
        </If>

        <If conditions={isSection}>
          <Tag className="text-xs" color="magenta">
            {__('section')}
          </Tag>
        </If>

        <If conditions={!isGroup && !isSection && !isCustom}>
          <Tag className="text-xs" color="green">
            {__(type)}
          </Tag>
        </If>
      </div>
    </div>
  )
}
