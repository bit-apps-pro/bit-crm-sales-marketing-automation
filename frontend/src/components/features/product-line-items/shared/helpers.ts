import { __ } from '@common/helpers/i18nWrap'
import { type ProductOptionData } from '@components/features/product-lookup-select/shared/types'
import { roundAmount } from '@pages/currencies/shared/common-functions'
import { type CurrencyItemType } from '@pages/currencies/shared/currency-types'

import { PRODUCT_SOURCE, TAX } from './constants'
import { type DiscountType, type LineItem, type LineItemTax, type TaxOption } from './types'

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
  return lineItems.map(item => {
    if (item.id !== id) return item

    if (field === 'tax_rate' && Array.isArray(item.taxes)) {
      const rate = Number(value) || 0
      const typedTax = { id: 0, is_compound: false, name: __('Tax'), rate }

      return { ...item, tax_customer: undefined, tax_rate: rate, taxes: rate ? [typedTax] : [] }
    }

    return { ...item, [field]: value }
  })
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

export function copyLineItems(lineItems: LineItem[]): LineItem[] {
  return lineItems.map(item => ({
    ...item,
    entity_id: undefined,
    id: createEmptyLineItem().id,
    module: undefined
  }))
}

export function selectProduct(
  lineItems: LineItem[],
  lineItemId: string,
  productData: ProductOptionData,
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
          taxes: undefined,
          unit_price_in_deal_currency: price
        }
      : item
  )
}

export function calculateLineItemTotal(item: LineItem, taxOption: TaxOption, decimals?: number): number {
  if (decimals !== undefined && taxOption !== TAX.NO_TAX) {
    return getRoundedLineAmounts(item, taxOption, decimals).total
  }

  const baseAmount = (item.unit_price_in_deal_currency || 0) * item.quantity

  const discountAmount = baseAmount * ((item.discount_percentage || 0) / 100)
  const afterDiscount = baseAmount - discountAmount

  if (taxOption === TAX.EXCLUSIVE) {
    const taxAmount = (afterDiscount * item.tax_rate) / 100
    return afterDiscount + taxAmount
  }

  return afterDiscount
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

function getTaxShares(taxes: LineItemTax[]): number[] {
  let combinedRate = 0

  return taxes.map(tax => {
    const share = ((tax.is_compound ? 100 + combinedRate : 100) * Number(tax.rate)) / 100
    combinedRate += share
    return share
  })
}

function getLineTaxShares(item: LineItem): Map<string, number> {
  const singleTax = { id: 0, is_compound: false, name: __('Tax'), rate: item.tax_rate }
  const taxes = item.taxes ?? (item.tax_rate ? [singleTax] : [])
  const shares = getTaxShares(taxes)
  const sharesByLabel = new Map<string, number>()

  taxes.forEach((tax, index) => {
    const namedLabel = Number(tax.rate) > 0 ? `${tax.name} (${Number(tax.rate)}%)` : tax.name
    const label = Number(tax.rate) > 0 && !tax.id ? __('Other tax') : namedLabel

    sharesByLabel.set(label, (sharesByLabel.get(label) || 0) + shares[index])
  })

  return sharesByLabel
}

function formatTaxBreakdown(amounts: Map<string, number>): { amount: number; label: string }[] {
  const rows = [...amounts].map(([label, amount]) => ({ amount, label }))
  const namedRows = rows.filter(row => row.label !== __('Other tax'))

  return namedRows.length > 0 ? [...namedRows, ...rows.filter(row => row.label === __('Other tax'))] : []
}

export function calculateCombinedTaxRate(taxes: LineItemTax[]): number {
  const combinedRate = getTaxShares(taxes).reduce((sum, share) => sum + share, 0)

  return Math.round(combinedRate * 10_000) / 10_000
}

// Lines with named taxes are rounded one by one so the tax rows add up to the cent.
export function getRoundingDecimals(
  lineItems: LineItem[],
  taxOption: TaxOption,
  decimalPlaces?: number | string
): number | undefined {
  const hasNamedTaxes = taxOption !== TAX.NO_TAX && lineItems.some(item => Boolean(item.taxes?.length))

  return hasNamedTaxes ? Number(decimalPlaces ?? 2) : undefined
}

function getRoundedLineAmounts(item: LineItem, taxOption: TaxOption, decimals: number) {
  const baseAmount = (item.unit_price_in_deal_currency || 0) * item.quantity
  const afterDiscount = baseAmount - baseAmount * ((item.discount_percentage || 0) / 100)
  const isInclusive = taxOption === TAX.INCLUSIVE
  const lineAmount = roundAmount(afterDiscount, decimals)
  const taxableAmount = isInclusive ? lineAmount / (1 + item.tax_rate / 100) : lineAmount
  const taxes = [...getLineTaxShares(item)].map(([label, share]) => ({
    amount: roundAmount((taxableAmount * share) / 100, decimals),
    label
  }))
  const tax = taxes.reduce((sum, lineTax) => sum + lineTax.amount, 0)

  return {
    net: isInclusive ? lineAmount - tax : lineAmount,
    taxes,
    total: isInclusive ? lineAmount : lineAmount + tax
  }
}

export function calculateTotals(
  lineItems: LineItem[],
  taxOption: TaxOption,
  grossDiscount: number,
  grossDiscountType: DiscountType,
  decimalPlaces?: number | string
) {
  const decimals = getRoundingDecimals(lineItems, taxOption, decimalPlaces)
  const taxAmounts = new Map<string, number>()
  let subtotal = 0
  let totalTax = 0

  if (decimals === undefined) {
    subtotal = calculateSubtotal(lineItems, taxOption)
    totalTax = calculateTotalTax(lineItems, taxOption)
  } else {
    lineItems.forEach(item => {
      const line = getRoundedLineAmounts(item, taxOption, decimals)

      subtotal += line.net
      line.taxes.forEach(lineTax => {
        taxAmounts.set(lineTax.label, (taxAmounts.get(lineTax.label) || 0) + lineTax.amount)
        totalTax += lineTax.amount
      })
    })
  }

  const grandTotalBeforeDiscount = subtotal + totalTax

  const cappedDiscount = Math.min(
    grossDiscountType === 'amount' ? grossDiscount : (grandTotalBeforeDiscount * grossDiscount) / 100,
    grandTotalBeforeDiscount
  )
  const discountAmount = decimals === undefined ? cappedDiscount : roundAmount(cappedDiscount, decimals)

  return {
    discountAmount,
    grandTotal: Math.max(0, grandTotalBeforeDiscount - discountAmount),
    grandTotalBeforeDiscount,
    subtotal,
    taxBreakdown: formatTaxBreakdown(taxAmounts),
    totalTax
  }
}

export function formatLineItems(lineItems: LineItem[]) {
  const formattedLineItems = lineItems
    ?.filter(item => item.product_name)
    ?.map(item => ({
      description: item.description,
      discount_percentage: item.discount_percentage || 0,
      id: item.id,
      product_code: item.product_code,
      product_id: item.product_id,
      product_name: item.product_name,
      product_source: item.product_source || '',
      quantity: item.quantity,
      tax_rate: item.tax_rate || 0,
      taxes: item.taxes ?? undefined,
      unit_price: item.unit_price_in_deal_currency || 0
    }))

  return formattedLineItems
}
