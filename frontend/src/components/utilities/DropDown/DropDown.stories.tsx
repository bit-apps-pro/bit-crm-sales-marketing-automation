import { __ } from '@common/helpers/i18nWrap'
import cls from '@features/FlowItem/FlowItem.module.css'
import DeleteIcon from '@icons/DeleteIcon'
import { type Meta, type StoryFn } from '@storybook/react'
import { LuEllipsisVertical } from 'react-icons/lu'

import DropDown from './DropDown'

export default {
  component: DropDown,
  title: __('Component/DropDown')
} as Meta<typeof DropDown>

export const Template: StoryFn<typeof DropDown> = () => (
  <DropDown>
    <LuEllipsisVertical />
    <div className={cls.DropDownMenu}>
      <button className={cls.DropDownMenuItem} type="button">
        <DeleteIcon className={cls.deleteIcon} size={16} />
        <span className={cls.DropDownMenuItemText}>{__('Delete')}</span>
      </button>
    </div>
  </DropDown>
)
