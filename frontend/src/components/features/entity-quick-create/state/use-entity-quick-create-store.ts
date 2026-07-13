import { create } from 'zustand'

interface EntityQuickCreateStore {
  actions: {
    handleClose: () => void
    handleOpen: (moduleName: string, fieldKey: string) => void
  }
  fieldKey: string
  module: string
  open: boolean
}

const useEntityQuickCreateStore = create<EntityQuickCreateStore>(set => ({
  actions: {
    handleClose: () => set({ fieldKey: '', module: '', open: false }),
    handleOpen: (module, fieldKey) => set({ fieldKey, module, open: true })
  },
  fieldKey: '',
  module: '',
  open: false
}))

export const useIsEntityQuickCreateOpen = () => useEntityQuickCreateStore(state => state.open)
export const useEntityQuickCreateModule = () => useEntityQuickCreateStore(state => state.module)
export const useEntityQuickCreateFieldKey = () => useEntityQuickCreateStore(state => state.fieldKey)

export const useEntityQuickCreateActions = () => useEntityQuickCreateStore(state => state.actions)
