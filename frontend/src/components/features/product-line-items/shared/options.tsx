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

export function getProductSourceOptions(wooEnabled: boolean, allowCustomSource = false) {
  const options: ProductSourceOption[] = [
    {
      disabled: !wooEnabled,
      label: __('Woo'),
      optionLabel: (
        <span className="flex items-center justify-between gap-2">
          {__('Woo')}
          {!wooEnabled && <Tag style={{ marginInlineEnd: 0 }}>{__('Inactive')}</Tag>}
        </span>
      ),
      value: PRODUCT_SOURCE.WOO_COMMERCE
    },
    {
      disabled: true,
      label: __('Local'),
      optionLabel: (
        <span className="flex items-center justify-between gap-2">
          {__('Local')}
          <Tag color="gold" style={{ marginInlineEnd: 0 }}>
            {__('Pro')}
          </Tag>
        </span>
      ),
      value: PRODUCT_SOURCE.LOCAL
    }
  ]

  if (allowCustomSource) {
    options.push({
      disabled: false,
      label: __('Custom'),
      optionLabel: <span className="flex items-center justify-between gap-2">{__('Custom')}</span>,
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
