import { type CurrencyItemType } from '@pages/currencies/shared/currency-types'
import { type FormInstance } from 'antd'
import { type ReactElement } from 'react'

export interface BaseFieldItemType {
  default_value?: string
  field_key: string
  group_fields?: Record<string, BaseFieldItemType>
  help_text?: string
  id?: number | string
  is_custom?: boolean
  label: string
  max?: number
  min?: number
  name: string
  options?: Option[]
  related_module?: string
  required: boolean
  source_module?: string
  status: boolean
  tooltip?: string
  type: string
  width?: string
}

interface Option {
  data?: CurrencyItemType
  label: string
  value: string
}

export interface EntityFormPropsType<T, Y extends BaseFieldItemType> {
  children?: ReactElement
  className?: string
  columnSettings?: boolean | { column_size: number }
  currencyData?: CurrencyItemType
  enableQuickCreate?: boolean
  entity?: T
  fields: Y[]
  form: FormInstance
  specialComponents?: Record<string, ReactElement>
}

export interface EntityInputPropsType {
  currencyData?: CurrencyItemType
  enableQuickCreate?: boolean
  field: BaseFieldItemType
  formItemClassName?: string
  specialComponents?: Record<string, ReactElement>
}

export interface EntityTagsPropsType {
  disabled?: boolean
  label?: string
  loading: boolean
  onAddTag: (tag: string) => void
  onRemoveTag: (tag: string) => void
  options: { label: string; value: string }[]
  value: string[] | undefined
}
