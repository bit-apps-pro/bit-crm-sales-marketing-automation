import SettingIcon from '@icons/SettingIcon'

import cls from './SettingButton.module.css'

interface SettingButtonType {
  className: string
}
export default function SettingButton(props: SettingButtonType) {
  const { className } = props
  return (
    <div className={`${cls.settingButtonMain} ${className}`}>
      <SettingIcon className="" size={20} stroke={2} />
    </div>
  )
}
