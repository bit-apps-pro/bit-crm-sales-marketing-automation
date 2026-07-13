import { type Stage } from '@pages/deal-settings/ui/stages/shared/types'
import { type Deal } from '@pages/deal/shared/deal-types'
import { create } from 'zustand'

interface UpdateDealStagePayload {
  deal: Deal
  newStage: Stage
  oldPosition: number
  oldStageKey: string
}

interface UpdateDealStageStore {
  actions: {
    handleModal: (isOpen: boolean, payload?: UpdateDealStagePayload) => void
    setUpdateModalOpen: (isOpen: boolean) => void
  }
  isUpdateModalOpen: boolean
  payload: undefined | UpdateDealStagePayload
}

const useUpdateDealStageStore = create<UpdateDealStageStore>(set => ({
  actions: {
    handleModal: (isOpen, payload) =>
      set({
        isUpdateModalOpen: isOpen,
        payload
      }),
    setUpdateModalOpen: isOpen => set({ isUpdateModalOpen: isOpen, payload: undefined })
  },
  isUpdateModalOpen: false,
  payload: undefined
}))

export const useIsUpdateModalOpenStore = () => useUpdateDealStageStore(state => state.isUpdateModalOpen)
export const useUpdateDealStagePayloadStore = () => useUpdateDealStageStore(state => state.payload)

export const useUpdateDealStageActionsStore = () => useUpdateDealStageStore(state => state.actions)
