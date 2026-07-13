import { MODULE_OPTIONS, PRO_MODULES } from '@common/constants/modules'
import { __ } from '@common/helpers/i18nWrap'
import { Select, type SelectProps, Tag } from 'antd'
import { type BaseOptionType } from 'antd/es/select'
import { LuCrown } from 'react-icons/lu'

const isProModule = (value?: null | number | string) => PRO_MODULES.includes(String(value))

const optionRender = (option: BaseOptionType) => {
  if (isProModule(option.value)) {
    return (
      <span className="flex items-center gap-2">
        {option.label}
        <Tag className="flex items-center justify-center" color="gold">
          <LuCrown className="mr-1" />
          <span>{__('Pro')}</span>
        </Tag>
      </span>
    )
  }

  return option.label
}

export default function ModuleSelect({
  options = MODULE_OPTIONS,
  placeholder = __('Select module'),
  ...rest
}: SelectProps) {
  const filteredOptions = options?.map(option =>
    isProModule(option.value) ? { ...option, disabled: true } : option
  )

  return (
    <Select placeholder={placeholder} {...rest} optionRender={optionRender} options={filteredOptions} />
  )
}
