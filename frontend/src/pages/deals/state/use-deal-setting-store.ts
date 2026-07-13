import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface DealSettingsStore {
  actions: {
    setView: (view: 'kanban' | 'table', setSearchParams: (params: string) => void) => void
  }
  view: 'kanban' | 'table'
}

const useDealSettingStore = create<DealSettingsStore>()(
  persist(
    set => ({
      actions: {
        setView: (view, setSearchParams) => {
          set({ view })

          const currentParams = new URLSearchParams(window.location.hash.split('?')[1])
          currentParams.delete('page')
          currentParams.delete('perPage')
          setSearchParams(currentParams.toString())

          return
        }
      },
      view: 'kanban'
    }),
    {
      name: 'deal-settings',
      partialize: state => ({ view: state.view })
    }
  )
)

export const useDealViewStore = () => useDealSettingStore(state => state.view)

export const useDealSettingActionsStore = () => useDealSettingStore(state => state.actions)
