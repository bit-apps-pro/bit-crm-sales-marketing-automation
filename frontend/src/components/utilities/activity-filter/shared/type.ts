import { type DefaultOptionType } from 'antd/es/select'

export interface ActivityFilterProps {
  filters: ActivityFilterConfig[]
  title?: string
}

export interface ActivityFilterConfig {
  key: string
  label: string
  options?: DefaultOptionType[]
  placeholder?: string
}
