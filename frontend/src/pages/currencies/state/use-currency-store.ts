import { create } from 'zustand'

import { type CurrencyItemType } from '../shared/currency-types'

interface CurrencyStore {
  actions: {
    setCreateModalOpen: (open: boolean) => void
    setEditModalOpen: (open: boolean) => void
    setHomeCurrencyEditModalOpen: (open: boolean) => void
    setHomeCurrencySetupModalOpen: (show: boolean) => void
    setSelectedCurrency: (currency: CurrencyItemType | undefined) => void
  }
  isCreateModalOpen: boolean
  isEditModalOpen: boolean
  isHomeCurrencyEditModalOpen: boolean
  isHomeCurrencySetupModalOpen: boolean
  selectedCurrency: CurrencyItemType | undefined
}

const useCurrencyStore = create<CurrencyStore>(set => ({
  isCreateModalOpen: false,
  isEditModalOpen: false,
  isHomeCurrencyEditModalOpen: false,
  isHomeCurrencySetupModalOpen: false,
  selectedCurrency: undefined,

  actions: {
    setCreateModalOpen: open => set({ isCreateModalOpen: open }),
    setEditModalOpen: open => set({ isEditModalOpen: open }),
    setHomeCurrencyEditModalOpen: open => set({ isHomeCurrencyEditModalOpen: open }),
    setHomeCurrencySetupModalOpen: open => set({ isHomeCurrencySetupModalOpen: open }),
    setSelectedCurrency: currency => set({ selectedCurrency: currency })
  }
}))

export const useIsCreateModalOpen = () => useCurrencyStore(state => state.isCreateModalOpen)
export const useIsEditModalOpen = () => useCurrencyStore(state => state.isEditModalOpen)
export const useIsHomeCurrencyEditModalOpen = () =>
  useCurrencyStore(state => state.isHomeCurrencyEditModalOpen)
export const useSelectedCurrency = () => useCurrencyStore(state => state.selectedCurrency)
export const useIsHomeCurrencySetupModalOpen = () =>
  useCurrencyStore(state => state.isHomeCurrencySetupModalOpen)

export const useCurrencyActions = () => useCurrencyStore(state => state.actions)
