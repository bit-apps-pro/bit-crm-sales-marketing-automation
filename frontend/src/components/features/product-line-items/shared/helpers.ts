import { __ } from '@common/helpers/i18nWrap'
import { type Product } from '@common/types/product'
import { type CurrencyItemType } from '@pages/currencies/shared/currency-types'

import { PRODUCT_SOURCE, TAX } from './constants'
import { type LineItem, type TaxOption } from './types'

export function isLineItemEditable(item: LineItem): boolean {
  return Boolean(item.product_name) || item.product_source === PRODUCT_SOURCE.CUSTOM
}

export function createEmptyLineItem(defaultSource = ''): LineItem {
  return {
    description: __(''),
    id: `line-${Date.now()}-${Math.random()}`,
    product_id: undefined,
    product_name: undefined,
    product_source: defaultSource,
    quantity: 1,
    tax_rate: 0,
    unit_price_in_deal_currency: 0
  }
}

export function addLineItem(lineItems: LineItem[], defaultSource = ''): LineItem[] {
  return [...lineItems, createEmptyLineItem(defaultSource)]
}

export function removeLineItem(lineItems: LineItem[], id: string): LineItem[] {
  return lineItems.filter(item => item.id !== id)
}

export function updateLineItem(
  lineItems: LineItem[],
  id: string,
  field: keyof LineItem,
  value: number | string | undefined
): LineItem[] {
  return lineItems.map(item => (item.id === id ? { ...item, [field]: value } : item))
}

export function clearLineItemProduct(
  lineItems: LineItem[],
  id: string,
  productSource: string
): LineItem[] {
  return lineItems.map(item =>
    item.id === id
      ? {
          description: __(''),
          discount_percentage: 0,
          id: item.id,
          product_code: undefined,
          product_id: undefined,
          product_name: undefined,
          product_source: productSource,
          quantity: 1,
          tax_rate: 0,
          unit_price_in_deal_currency: 0
        }
      : item
  )
}

export function selectProduct(
  lineItems: LineItem[],
  lineItemId: string,
  productData: Product,
  currencyData?: CurrencyItemType
): LineItem[] {
  let price = Number(productData.price) || 0
  if (currencyData?.exchange_rate && price) {
    price = price * Number(currencyData.exchange_rate)
  }

  return lineItems.map(item =>
    item.id === lineItemId
      ? {
          ...item,
          description: productData.description || '',
          product_code: productData.code,
          product_id: productData.id,
          product_name: productData.name,
          product_source: productData.source || '',
          tax_rate: Number(productData.tax_rate) || 0,
          unit_price_in_deal_currency: price
        }
      : item
  )
}

export function calculateLineItemTotal(item: LineItem, taxOption: TaxOption): number {
  const baseAmount = (item.unit_price_in_deal_currency || 0) * item.quantity

  const discountAmount = baseAmount * ((item.discount_percentage || 0) / 100)
  const afterDiscount = baseAmount - discountAmount

  if (taxOption === TAX.EXCLUSIVE) {
    const taxAmount = (afterDiscount * item.tax_rate) / 100
    return afterDiscount + taxAmount
  }

  return afterDiscount
}

export function calculateGrandTotal(lineItems: LineItem[], taxOption: TaxOption): number {
  return lineItems.reduce((sum, item) => sum + calculateLineItemTotal(item, taxOption), 0)
}

export function calculateSubtotal(lineItems: LineItem[], taxOption: TaxOption): number {
  return lineItems.reduce((sum, item) => {
    const baseAmount = (item.unit_price_in_deal_currency || 0) * item.quantity
    const discountAmount = baseAmount * ((item.discount_percentage || 0) / 100)
    const afterDiscount = baseAmount - discountAmount

    if (taxOption === TAX.INCLUSIVE) {
      return sum + afterDiscount / (1 + item.tax_rate / 100)
    }
    return sum + afterDiscount
  }, 0)
}

export function calculateTotalTax(lineItems: LineItem[], taxOption: TaxOption): number {
  if (taxOption === TAX.NO_TAX) return 0

  return lineItems.reduce((sum, item) => {
    const baseAmount = (item.unit_price_in_deal_currency || 0) * item.quantity
    const discountAmount = baseAmount * ((item.discount_percentage || 0) / 100)
    const afterDiscount = baseAmount - discountAmount

    if (taxOption === TAX.INCLUSIVE) {
      return sum + afterDiscount - afterDiscount / (1 + item.tax_rate / 100)
    }
    return sum + (afterDiscount * item.tax_rate) / 100
  }, 0)
}

export function formatLineItems(lineItems: LineItem[]) {
  const formattedLineItems = lineItems?.map(item => ({
    description: item.description,
    discount_percentage: item.discount_percentage || 0,
    id: item.id,
    product_code: item.product_code,
    product_id: item.product_id,
    product_name: item.product_name,
    product_source: item.product_source || '',
    quantity: item.quantity,
    tax_rate: item.tax_rate || 0,
    unit_price: item.unit_price_in_deal_currency || 0
  }))

  return formattedLineItems
}
