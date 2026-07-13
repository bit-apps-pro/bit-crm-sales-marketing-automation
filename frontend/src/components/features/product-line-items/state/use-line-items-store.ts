import { type FormInstance } from 'antd'
import { create } from 'zustand'

import { type DiscountType, type LineItem, type TaxOption } from '../shared/types'

interface LineItemsStore {
  actions: {
    clearStore: () => void
    setAmount: (amount: number, form?: FormInstance) => void
    setGrossDiscount: (discount: number) => void
    setGrossDiscountType: (discountType: DiscountType) => void
    setLineItems: (lineItems: LineItem[]) => void
    setTaxOption: (taxOption: TaxOption) => void
  }
  amount?: number
  grossDiscount: number
  grossDiscountType: DiscountType
  lineItems: LineItem[]
  taxOption: TaxOption
}

const useLineItemsStore = create<LineItemsStore>(set => ({
  actions: {
    clearStore: () =>
      set({
        amount: undefined,
        grossDiscount: 0,
        grossDiscountType: 'amount',
        lineItems: [],
        taxOption: 'exclusive'
      }),
    setAmount: (amount: number, form?: FormInstance) => {
      if (form) {
        form.setFieldsValue({ amount })
      }
      set({ amount })
    },
    setGrossDiscount: (grossDiscount: number) => set({ grossDiscount }),
    setGrossDiscountType: (grossDiscountType: DiscountType) => set({ grossDiscountType }),
    setLineItems: (lineItems: LineItem[]) => set({ lineItems }),
    setTaxOption: (taxOption: TaxOption) => set({ taxOption })
  },
  amount: undefined,
  grossDiscount: 0,
  grossDiscountType: 'amount',
  lineItems: [],
  taxOption: 'exclusive'
}))

export const useLineItemsStoreActions = () => useLineItemsStore(state => state.actions)

export const useLineItemsAmountSelect = () => useLineItemsStore(state => state.amount)
export const useLineItemsSelect = () => useLineItemsStore(state => state.lineItems)
export const useGrossDiscountSelect = () => useLineItemsStore(state => state.grossDiscount)
export const useGrossDiscountTypeSelect = () => useLineItemsStore(state => state.grossDiscountType)
export const useTaxOptionSelect = () => useLineItemsStore(state => state.taxOption)
