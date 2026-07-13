import { PRODUCT_SOURCE } from '@features/product-line-items/shared/constants'
import { type DefaultOptionType } from 'antd/es/select'
import { type DataNode } from 'antd/es/tree'

export const renderLabel = (option: DefaultOptionType, fallback = '') => {
  const { label } = option
  return label || fallback
}

export const getDisplayValue = (
  value: number | string | undefined,
  options: DataNode[] | undefined,
  settings: {
    fallback?: string
    source: string
    wooEnabled: boolean
  }
): null | number | string | undefined => {
  if (settings.source !== PRODUCT_SOURCE.WOO_COMMERCE || !settings.wooEnabled) {
    return value
  }

  if (!value || !options) return value

  const valueExists = (items: DataNode[]): boolean => {
    for (const item of items) {
      if ((item as DataNode & { value?: number | string }).value === value) return true

      if (item.children && valueExists(item.children)) return true
    }

    return false
  }

  const fallback = settings?.fallback || 'Item not found'
  return valueExists(options) ? value : fallback
}
