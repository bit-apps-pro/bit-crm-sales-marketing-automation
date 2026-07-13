import { __ } from '@common/helpers/i18nWrap'
import { type LineItem } from '@features/product-line-items/shared/types'
import { create } from 'zustand'

import {
  type ContactInformation,
  type CurrencyItemType,
  type DealInformation,
  type SectionType
} from '../shared/invoice-create-types'

interface InvoiceCreateStore {
  actions: {
    clearStore: () => void
    setContactInformation: (contactInformation: ContactInformation) => void
    setCurrencyData: (currencyData: CurrencyItemType) => void
    setDealInformation: (dealInformation: DealInformation) => void
    setInvoiceData: (data: Partial<Omit<InvoiceCreateStore, 'actions'>>) => void
    setInvoiceLineItems: (updater: ((prevState: LineItem[]) => LineItem[]) | LineItem[]) => void
    setInvoiceNumber: (number: number | string) => void
    updateSectionLabel: (position: 'bottom' | 'top', index: number, label: string) => void
    updateSectionValue: (position: 'bottom' | 'top', index: number, value: string) => void
  }
  bottomSectionNotes: SectionType[]
  contactInformation?: ContactInformation
  currencyData?: CurrencyItemType
  dealInformation: DealInformation
  invoiceLineItems: LineItem[]
  invoiceNumber: number | string
  topSectionNotes: SectionType[]
}

const initialState = {
  bottomSectionNotes: [
    {
      label: __('Notes'),
      value: __('')
    },
    {
      label: __('Terms'),
      value: __('')
    }
  ],
  contactInformation: undefined,
  currencyData: undefined,
  dealInformation: {
    contact_id: '',
    currency: '',
    email: '',
    id: '',
    isDealSelected: false,
    name: ''
  },
  invoiceLineItems: [],
  invoiceNumber: '',
  topSectionNotes: [
    {
      label: __('Title'),
      value: __('')
    }
  ]
}

const useInvoiceCreateStore = create<InvoiceCreateStore>(set => ({
  actions: {
    clearStore: () => {
      set({ ...initialState })
    },
    setContactInformation: contactInformation => {
      set({ contactInformation })
    },
    setCurrencyData: currencyData => {
      set({ currencyData })
    },
    setDealInformation: dealInformation => {
      set({ dealInformation })
    },
    setInvoiceData: data => {
      set(state => ({
        ...state,
        ...data
      }))
    },
    setInvoiceLineItems: (updater: ((prevState: LineItem[]) => LineItem[]) | LineItem[]) =>
      set(state => ({
        invoiceLineItems: typeof updater === 'function' ? updater(state.invoiceLineItems) : updater
      })),
    setInvoiceNumber: number => {
      set({ invoiceNumber: number })
    },
    updateSectionLabel: (position, index, label) => {
      const sectionKey = position === 'top' ? 'topSectionNotes' : 'bottomSectionNotes'
      set(state => {
        const updatedSections = state[sectionKey].map((section, idx) =>
          idx === index ? { ...section, label } : section
        )
        return {
          [sectionKey]: updatedSections
        }
      })
    },
    updateSectionValue: (position, index, value) => {
      const sectionKey = position === 'top' ? 'topSectionNotes' : 'bottomSectionNotes'
      set(state => {
        const updatedSections = state[sectionKey].map((section, idx) =>
          idx === index ? { ...section, value } : section
        )
        return {
          [sectionKey]: updatedSections
        }
      })
    }
  },
  ...initialState
}))

export const useInvoiceCurrencyDataSelect = () => useInvoiceCreateStore(state => state.currencyData)
export const useDealInformationSelect = () => useInvoiceCreateStore(state => state.dealInformation)
export const useInvoiceLineItemsSelect = () => useInvoiceCreateStore(state => state.invoiceLineItems)
export const useInvoiceNumberSelect = () => useInvoiceCreateStore(state => state.invoiceNumber)
export const useInvoiceCreateStoreActions = () => useInvoiceCreateStore(state => state.actions)
export const useInvoiceTopSectionNotesSelect = () =>
  useInvoiceCreateStore(state => state.topSectionNotes)
export const useInvoiceBottomSectionNotesSelect = () =>
  useInvoiceCreateStore(state => state.bottomSectionNotes)
export const useContactInformationSelect = () => useInvoiceCreateStore(state => state.contactInformation)
