import { create } from 'zustand'

import { type FieldItem } from '../shared/field-types'

interface FieldsStore {
  actions: {
    reset: () => void
    setFieldList: (updater: ((prevState: FieldItem[]) => FieldItem[]) | FieldItem[]) => void
  }
  fieldList: FieldItem[]
}

const useFieldsStore = create<FieldsStore>(set => ({
  actions: {
    reset: () => set({ fieldList: [] }),
    setFieldList: (updater: ((prevState: FieldItem[]) => FieldItem[]) | FieldItem[]) =>
      set(state => ({
        fieldList: typeof updater === 'function' ? updater(state.fieldList) : updater
      }))
  },
  fieldList: []
}))

export const useFieldList = () => useFieldsStore(state => state.fieldList)
export const useFieldsActions = () => useFieldsStore(state => state.actions)
