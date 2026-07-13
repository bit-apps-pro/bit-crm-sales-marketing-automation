import { create } from 'zustand'

interface ActivityStore {
  actions: {
    handleModal: (
      type: string,
      setSearchParams: (params: string | { id?: string; modal: string }) => void,
      searchParamData?: { id?: string; modal: string }
    ) => void
  }
}

const useActivityStore = create<ActivityStore>(() => ({
  actions: {
    handleModal: (type, setSearchParams, searchParamData) => {
      const currentParams = new URLSearchParams(window.location.hash.split('?')[1])

      if (type === 'open' && searchParamData) {
        Object.entries(searchParamData).forEach(([key, value]) => {
          if (value !== undefined) {
            currentParams.set(key, value)
          }
        })
        setSearchParams(currentParams.toString())

        return
      }

      currentParams.delete('modal')
      currentParams.delete('id')
      setSearchParams(currentParams.toString())
    }
  }
}))
export const useActivityStoreActions = () => useActivityStore(state => state.actions)
