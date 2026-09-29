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
    /*
      Name + tag are sized to their content so the tag sits right beside the name, and
      the block never shrinks (`shrink-0`) -- otherwise on a phone it is squeezed to zero
      by the hover-only row controls, which are wider than the screen. The `max-w` cap
      lets a long name ellipsise instead; the controls take what is left and scroll.
    */
    <div className="flex min-w-0 max-w-[75%] shrink-0 items-center gap-2 sm:gap-4">
      <Typography.Text className="m-0 min-w-0 truncate text-sm" title={label}>
        {label}
      </Typography.Text>
      <div className="flex shrink-0 items-center justify-start">
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
