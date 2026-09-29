import { type DefaultOptionType } from 'antd/es/select'

export interface ActivityFilterProps {
  className?: string
  compact?: boolean
  filters: ActivityFilterConfig[]
  title?: string
}

export interface ActivityFilterConfig {
  key: string
  label: string
  options?: DefaultOptionType[]
  placeholder?: string
}
