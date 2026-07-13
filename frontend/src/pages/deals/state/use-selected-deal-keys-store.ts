import { type Key } from 'react'
import { create } from 'zustand'

interface SelectedDealKeysStore {
  actions: {
    addSelectedKey: (key: Key | string) => void
    clearSelectedKeys: () => void
    removeSelectedKey: (key: Key | string) => void
    setSelectedKeys: (selectedKeys: (Key | string)[]) => void
    toggleSelectedKey: (key: Key | string) => void
  }
  selectedKeys: (Key | string)[]
}

const useSelectedDealKeysStore = create<SelectedDealKeysStore>(set => ({
  actions: {
    addSelectedKey: key =>
      set(state => ({
        selectedKeys: state.selectedKeys.includes(key)
          ? state.selectedKeys
          : [...state.selectedKeys, key]
      })),
    clearSelectedKeys: () => set({ selectedKeys: [] }),
    removeSelectedKey: key =>
      set(state => ({
        selectedKeys: state.selectedKeys.filter(selectedKey => selectedKey !== key)
      })),
    setSelectedKeys: selectedKeys => set({ selectedKeys }),
    toggleSelectedKey: key =>
      set(state => ({
        selectedKeys: state.selectedKeys.includes(key)
          ? state.selectedKeys.filter(selectedKey => selectedKey !== key)
          : [...state.selectedKeys, key]
      }))
  },
  selectedKeys: []
}))

export const useSelectedKeysStore = () => useSelectedDealKeysStore(state => state.selectedKeys)

export const useSelectedKeysActionsStore = () => useSelectedDealKeysStore(state => state.actions)
