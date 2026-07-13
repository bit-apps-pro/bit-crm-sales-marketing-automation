import { type Key } from 'react'
import { create } from 'zustand'

interface SelectedTrashKeysStore {
  addSelectedKey: (key: Key | string) => void
  clearSelectedKeys: () => void
  removeSelectedKey: (key: Key | string) => void
  selectedKeys: Key[]
  setSelectedKeys: (selectedKeys: Key[]) => void
  toggleSelectedKey: (key: Key | string) => void
}

export const useSelectedTrashKeysStore = create<SelectedTrashKeysStore>(set => ({
  addSelectedKey: key =>
    set(state => ({
      selectedKeys: state.selectedKeys.includes(key) ? state.selectedKeys : [...state.selectedKeys, key]
    })),
  clearSelectedKeys: () => set({ selectedKeys: [] }),
  removeSelectedKey: key =>
    set(state => ({
      selectedKeys: state.selectedKeys.filter(selectedKey => selectedKey !== key)
    })),
  selectedKeys: [],
  setSelectedKeys: selectedKeys => set({ selectedKeys }),
  toggleSelectedKey: key =>
    set(state => ({
      selectedKeys: state.selectedKeys.includes(key)
        ? state.selectedKeys.filter(selectedKey => selectedKey !== key)
        : [...state.selectedKeys, key]
    }))
}))
