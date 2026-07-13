import { type FieldItem } from '@features/field-settings/shared/field-types'
import { create } from 'zustand'

interface FieldStore {
  actions: {
    setFieldList: (updater: ((prevState: FieldItem[]) => FieldItem[]) | FieldItem[]) => void
  }
  fieldList: FieldItem[]
  isFieldListLoading: boolean
}

const useDealTableFieldsStore = create<FieldStore>(set => ({
  actions: {
    setFieldList: (updater: ((prevState: FieldItem[]) => FieldItem[]) | FieldItem[]) =>
      set(state => ({
        fieldList: typeof updater === 'function' ? updater(state.fieldList) : updater,
        isFieldListLoading: false
      }))
  },
  fieldList: [],
  isFieldListLoading: true
}))

export const useFieldListStore = () => useDealTableFieldsStore(state => state.fieldList)
export const useIsFieldListLoadingStore = () =>
  useDealTableFieldsStore(state => state.isFieldListLoading)

export const useDealTableFieldActionsStore = () => useDealTableFieldsStore(state => state.actions)
