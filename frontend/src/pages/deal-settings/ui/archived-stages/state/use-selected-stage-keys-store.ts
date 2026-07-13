import { type Key } from 'react'
import { create } from 'zustand'

interface SelectedStageKeysStore {
  clearSelectedKeys: () => void
  selectedKeys: Key[]
  setSelectedKeys: (keys: Key[]) => void
}

const useSelectedStageKeysStore = create<SelectedStageKeysStore>(set => ({
  clearSelectedKeys: () => set({ selectedKeys: [] }),
  selectedKeys: [],
  setSelectedKeys: keys => set({ selectedKeys: keys })
}))

export default useSelectedStageKeysStore
