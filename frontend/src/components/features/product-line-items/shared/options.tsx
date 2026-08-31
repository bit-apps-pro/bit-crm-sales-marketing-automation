import { __ } from '@common/helpers/i18nWrap'
import { Tag } from 'antd'
import { type ReactNode } from 'react'

import { PRODUCT_SOURCE, TAX } from './constants'

interface ProductSourceOption {
  disabled: boolean
  label: string
  optionLabel: ReactNode
  value: (typeof PRODUCT_SOURCE)[keyof typeof PRODUCT_SOURCE]
}

interface ProductSourceOptionsParams {
  allowCustomSource?: boolean
  fluentCartEnabled?: boolean
  wooEnabled?: boolean
}

interface SourceTag {
  color?: string
  text: string
}

function sourceOptionLabel(label: string, tag?: SourceTag): ReactNode {
  return (
    <span className="flex items-center justify-between gap-2">
      {label}
      {tag && (
        <Tag color={tag.color} style={{ marginInlineEnd: 0 }}>
          {tag.text}
        </Tag>
      )}
    </span>
  )
}

/**
 * Tag explaining why a plugin-backed source is unavailable: in the free plugin
 * neither FluentCart nor Local can ever be used, so the upgrade prompt wins
 * over "Inactive".
 */
function unavailableTag(requiresPro: boolean): SourceTag {
  return requiresPro ? { color: 'gold', text: __('Pro') } : { text: __('Inactive') }
}

export function getProductSourceOptions({
  allowCustomSource = false,
  fluentCartEnabled = false,
  wooEnabled = false
}: ProductSourceOptionsParams) {
  const options: ProductSourceOption[] = [
    {
      disabled: !wooEnabled,
      label: __('Woo'),
      optionLabel: sourceOptionLabel(__('Woo'), wooEnabled ? undefined : unavailableTag(false)),
      value: PRODUCT_SOURCE.WOO_COMMERCE
    },
    {
      disabled: !fluentCartEnabled,
      label: __('FluentCart'),
      optionLabel: sourceOptionLabel(
        __('FluentCart'),
        fluentCartEnabled ? undefined : unavailableTag(true)
      ),
      value: PRODUCT_SOURCE.FLUENT_CART
    },
    {
      disabled: true,
      label: __('Local'),
      optionLabel: sourceOptionLabel(__('Local'), unavailableTag(true)),
      value: PRODUCT_SOURCE.LOCAL
    }
  ]

  if (allowCustomSource) {
    options.push({
      disabled: false,
      label: __('Custom'),
      optionLabel: sourceOptionLabel(__('Custom')),
      value: PRODUCT_SOURCE.CUSTOM
    })
  }

  return options
}

export const TAX_OPTIONS = [
  { label: __('Tax Exclusive'), value: TAX.EXCLUSIVE },
  { label: __('Tax Inclusive'), value: TAX.INCLUSIVE },
  { label: __('No Tax'), value: TAX.NO_TAX }
]
